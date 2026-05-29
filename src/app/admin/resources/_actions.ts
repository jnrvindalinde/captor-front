"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api";
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
  if (id) revalidatePath(`/admin/resources/${id}/edit`);
}

export async function saveResourceAction(
  _prev: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? Number(idRaw) : null;

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: emptyToNull(formData.get("slug")),
    description: emptyToNull(formData.get("description")),
    format: String(formData.get("format") ?? "guide") as ResourceFormat,
    file_path: emptyToNull(formData.get("file_path")),
    external_url: emptyToNull(formData.get("external_url")),
    cover_image: emptyToNull(formData.get("cover_image")),
    status: String(formData.get("status") ?? "draft") as ResourceStatus,
    tags: parseTags(formData.get("tags")),
  };

  if (!payload.title) return { error: "Title is required." };

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
