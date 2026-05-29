"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { Story, StoryCategory, StoryOutcome } from "../_mock";

export type StoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const CATEGORY_SET: StoryCategory[] = ["School", "Scholarship", "Job", "Career"];

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function revalidate(id?: number) {
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  if (id) revalidatePath(`/admin/stories/${id}/edit`);
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

  const json = (await res.json()) as {
    data?: { url?: string; secure_url?: string };
    url?: string;
    secure_url?: string;
  };
  return json.data?.url ?? json.data?.secure_url ?? json.url ?? json.secure_url ?? null;
}

export async function saveStoryAction(
  _prev: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? Number(idRaw) : null;
  const isEdit = !!id;

  const title = String(formData.get("title") ?? "").trim();
  const personName = String(formData.get("person_name") ?? "").trim();
  if (!title) return { error: "Title is required." };
  if (!personName) return { error: "Person name is required." };

  const categoriesRaw = formData.getAll("categories");
  const categories = categoriesRaw
    .map((v) => String(v))
    .filter((v): v is StoryCategory => (CATEGORY_SET as string[]).includes(v));

  let coverImage: string | null = emptyToNull(formData.get("cover_image_existing"));
  const coverFile = formData.get("cover_file");
  try {
    if (coverFile instanceof File && coverFile.size > 0) {
      const url = await uploadToCloudinary(coverFile, "captor/stories/covers");
      if (url) coverImage = url;
    }
  } catch (e) {
    const err = e as ApiError;
    return { error: err?.message ?? "Cover image upload failed." };
  }

  let gallery: string[] = [];
  const galleryExistingRaw = formData.get("gallery_existing");
  if (typeof galleryExistingRaw === "string" && galleryExistingRaw.trim()) {
    try {
      const parsed = JSON.parse(galleryExistingRaw);
      if (Array.isArray(parsed)) gallery = parsed.filter((u): u is string => typeof u === "string");
    } catch { /* ignore */ }
  }
  const newGalleryFiles = formData.getAll("gallery_files");
  for (const file of newGalleryFiles) {
    if (!(file instanceof File) || file.size === 0) continue;
    try {
      const url = await uploadToCloudinary(file, "captor/stories/gallery");
      if (url) gallery.push(url);
    } catch (e) {
      const err = e as ApiError;
      return { error: err?.message ?? "Gallery image upload failed." };
    }
  }

  const statusRaw = formData.get("status");
  const status: "draft" | "published" | undefined =
    typeof statusRaw === "string" && statusRaw
      ? (statusRaw as "draft" | "published")
      : (isEdit ? undefined : "published");

  const payload: Record<string, unknown> = {
    title,
    summary: emptyToNull(formData.get("summary")),
    quote: emptyToNull(formData.get("quote")),
    body: emptyToNull(formData.get("body")),
    person_name: personName,
    person_role: emptyToNull(formData.get("person_role")),
    outcome: emptyToNull(formData.get("outcome")) as StoryOutcome | null,
    outcome_label: emptyToNull(formData.get("outcome_label")),
    categories,
    cover_image: coverImage,
    gallery,
  };
  if (status) payload.status = status;
  if (isEdit) {
    const slug = emptyToNull(formData.get("slug"));
    if (slug) payload.slug = slug;
  }

  let saved: Story;
  try {
    if (id) {
      const r = await apiFetch<{ story: Story }>(`/api/admin/stories/${id}`, {
        method: "PATCH",
        json: payload,
      });
      saved = r.story;
    } else {
      const r = await apiFetch<{ story: Story }>(`/api/admin/stories`, {
        method: "POST",
        json: payload,
      });
      saved = r.story;
    }
  } catch (e) {
    const err = e as ApiError;
    return { error: err?.message ?? "Save failed.", fieldErrors: err?.errors };
  }

  revalidate(saved.id);
  redirect(`/admin/stories/${saved.id}/edit?saved=1`);
}

export async function deleteStoryAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/stories");
  try {
    await apiFetch(`/api/admin/stories/${id}`, { method: "DELETE" });
  } catch {
    /* best-effort */
  }
  revalidate();
  redirect("/admin/stories?deleted=1");
}
