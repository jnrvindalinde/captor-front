"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api";
import type { Story, StoryOutcome } from "../_mock";

export type StoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function revalidate(id?: number) {
  revalidatePath("/admin/stories");
  if (id) revalidatePath(`/admin/stories/${id}/edit`);
}

export async function saveStoryAction(
  _prev: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? Number(idRaw) : null;

  const outcomeRaw = emptyToNull(formData.get("outcome"));
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: emptyToNull(formData.get("slug")),
    summary: emptyToNull(formData.get("summary")),
    body: emptyToNull(formData.get("body")),
    person_name: String(formData.get("person_name") ?? "").trim(),
    person_role: emptyToNull(formData.get("person_role")),
    outcome: outcomeRaw as StoryOutcome | null,
    cover_image: emptyToNull(formData.get("cover_image")),
    status: String(formData.get("status") ?? "draft") as "draft" | "published",
  };

  if (!payload.title) return { error: "Title is required." };
  if (!payload.person_name) return { error: "Person name is required." };

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
