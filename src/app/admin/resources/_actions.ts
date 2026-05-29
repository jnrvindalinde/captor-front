"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { ResourceItem, ResourceFormat, ResourceStatus } from "../_mock";

export type ResourceFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}
function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function revalidate(id?: number) {
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  if (id) revalidatePath(`/admin/resources/${id}/edit`);
}

async function uploadToCloudinary(file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const token = await getSessionToken();
  if (!token) return null;

  const base = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);

  const res = await fetch(`${base}/api/admin/media`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    body: fd,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Upload failed (${res.status}).`;
    try { const j = await res.json(); if (j?.message) msg = j.message; } catch { /* ignore */ }
    throw { status: res.status, message: msg } as ApiError;
  }

  const json = (await res.json()) as { data?: { url?: string; secure_url?: string }; url?: string; secure_url?: string };
  return json.data?.url ?? json.data?.secure_url ?? json.url ?? json.secure_url ?? null;
}

export async function saveResourceAction(
  _prev: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? Number(idRaw) : null;
  const isEdit = !!id;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const format = String(formData.get("format") ?? "guide") as ResourceFormat;

  const statusRaw = formData.get("status");
  const status: ResourceStatus | undefined = typeof statusRaw === "string" && statusRaw
    ? (statusRaw as ResourceStatus)
    : (isEdit ? undefined : ("published" as ResourceStatus));

  // Cover image: prefer freshly uploaded, else existing
  let coverImage: string | null = emptyToNull(formData.get("cover_image_existing"));
  const coverFile = formData.get("cover_file");
  try {
    if (coverFile instanceof File && coverFile.size > 0) {
      const url = await uploadToCloudinary(coverFile, "captor/resources/covers");
      if (url) coverImage = url;
    }
  } catch (e) {
    const err = e as ApiError;
    return { error: err?.message ?? "Cover image upload failed." };
  }

  // Resource file (when not external)
  let filePath: string | null = emptyToNull(formData.get("file_path_existing"));
  let externalUrl: string | null = null;

  if (format === "external") {
    externalUrl = emptyToNull(formData.get("external_url"));
    filePath = null;
  } else {
    const resourceFile = formData.get("resource_file");
    try {
      if (resourceFile instanceof File && resourceFile.size > 0) {
        const url = await uploadToCloudinary(resourceFile, "captor/resources/files");
        if (url) filePath = url;
      }
    } catch (e) {
      const err = e as ApiError;
      return { error: err?.message ?? "Resource file upload failed." };
    }
  }

  const payload: Record<string, unknown> = {
    title,
    description: emptyToNull(formData.get("description")),
    format,
    file_path: filePath,
    file_label: emptyToNull(formData.get("file_label")),
    external_url: externalUrl,
    cover_image: coverImage,
    tags: parseTags(formData.get("tags")),
  };
  if (status) payload.status = status;
  if (isEdit) {
    const slug = emptyToNull(formData.get("slug"));
    if (slug) payload.slug = slug;
  }

  let saved: ResourceItem;
  try {
    if (id) {
      const r = await apiFetch<{ resource: ResourceItem }>(
        `/api/admin/resources/${id}`,
        { method: "PATCH", json: payload },
      );
      saved = r.resource;
    } else {
      const r = await apiFetch<{ resource: ResourceItem }>(
        `/api/admin/resources`,
        { method: "POST", json: payload },
      );
      saved = r.resource;
    }
  } catch (e) {
    const err = e as ApiError;
    return { error: err?.message ?? "Save failed.", fieldErrors: err?.errors };
  }

  revalidate(saved.id);
  redirect(`/admin/resources/${saved.id}/edit?saved=1`);
}

export async function deleteResourceAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/resources");
  try {
    await apiFetch(`/api/admin/resources/${id}`, { method: "DELETE" });
  } catch {
    /* best-effort */
  }
  revalidate();
  redirect("/admin/resources?deleted=1");
}
