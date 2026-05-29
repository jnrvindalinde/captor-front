"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api";
import type { Post, PostStatus } from "../_mock";

export type PostFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function publishedAtToIso(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function revalidate(id?: number) {
  revalidatePath("/admin/blog");
  if (id) revalidatePath(`/admin/blog/${id}/edit`);
}

export async function savePostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? Number(idRaw) : null;

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: emptyToNull(formData.get("slug")),
    excerpt: emptyToNull(formData.get("excerpt")),
    body: emptyToNull(formData.get("body")),
    cover_image: emptyToNull(formData.get("cover_image")),
    status: (String(formData.get("status") ?? "draft") as PostStatus),
    tags: parseTags(formData.get("tags")),
    published_at: publishedAtToIso(formData.get("published_at")),
  };

  if (!payload.title) {
    return { error: "Title is required." };
  }

  let saved: Post;
  try {
    if (id) {
      const r = await apiFetch<{ post: Post }>(`/api/admin/posts/${id}`, {
        method: "PATCH",
        json: payload,
      });
      saved = r.post;
    } else {
      const r = await apiFetch<{ post: Post }>(`/api/admin/posts`, {
        method: "POST",
        json: payload,
      });
      saved = r.post;
    }
  } catch (e) {
    const err = e as ApiError;
    return { error: err?.message ?? "Save failed.", fieldErrors: err?.errors };
  }

  revalidate(saved.id);
  redirect(`/admin/blog/${saved.id}/edit?saved=1`);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/blog");
  try {
    await apiFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
  } catch {
    // Best-effort; we still bounce to the list.
  }
  revalidate();
  redirect("/admin/blog?deleted=1");
}
