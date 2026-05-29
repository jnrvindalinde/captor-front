"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { MediaItem } from "@/lib/cms/media";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function uploadMediaAction(formData: FormData): Promise<ActionResult<MediaItem>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  // Forward as-is to the backend.
  try {
    const item = await apiFetch<{ data: MediaItem }>("/api/admin/media", {
      method: "POST",
      body: formData,
    });
    revalidatePath("/admin/cms/media");
    return { ok: true, data: item.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed.";
    return { ok: false, error: msg };
  }
}

export async function updateMediaAction(
  uuid: string,
  patch: { alt_en?: string; alt_fr?: string; caption_en?: string; caption_fr?: string },
): Promise<ActionResult<MediaItem>> {
  try {
    const res = await apiFetch<{ data: MediaItem }>(`/api/admin/media/${uuid}`, {
      method: "PATCH",
      json: patch,
    });
    revalidatePath("/admin/cms/media");
    return { ok: true, data: res.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed.";
    return { ok: false, error: msg };
  }
}

export async function deleteMediaAction(uuid: string): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/media/${uuid}`, { method: "DELETE" });
    revalidatePath("/admin/cms/media");
    return { ok: true, data: undefined };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed.";
    return { ok: false, error: msg };
  }
}
