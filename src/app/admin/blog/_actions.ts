"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { Post, PostStatus } from "../_mock";

export type PostFormState = {
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

function publishedAtToIso(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function revalidate(id?: number) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (id) revalidatePath(`/admin/blog/${id}/edit`);
}

async function uploadCover(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const token = await getSessionToken();
  if (!token) return null;

  const base = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "captor/blog");

  const res = await fetch(`${base}/api/admin/media`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    body: fd,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Cover upload failed (${res.status}).`;
    try { const j = await res.json(); if (j?.message) msg = j.message; } catch { /* ignore */ }
    throw { status: res.status, message: msg } as ApiError;
  }

  const json = (await res.json()) as { data?: { url?: string; secure_url?: string }; url?: string; secure_url?: string };
  return json.data?.url ?? json.data?.secure_url ?? json.url ?? json.secure_url ?? null;
}

export async function savePostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? Number(idRaw) : null;
  const isEdit = !!id;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const statusRaw = formData.get("status");
  const status: PostStatus | undefined = typeof statusRaw === "string" && statusRaw
    ? (statusRaw as PostStatus)
    : (isEdit ? undefined : ("published" as PostStatus));

  let coverImage: string | null = emptyToNull(formData.get("cover_image_existing"));
  const file = formData.get("cover_file");
  try {
    if (file instanceof File && file.size > 0) {
      const url = await uploadCover(file);
      if (url) coverImage = url;
    }
  } catch (e) {
    const err = e as ApiError;
    return { error: err?.message ?? "Cover image upload failed." };
  }

  const payload: Record<string, unknown> = {
    title,
    excerpt: emptyToNull(formData.get("excerpt")),
    body: emptyToNull(formData.get("body")),
    cover_image: coverImage,
    tags: parseTags(formData.get("tags")),
    published_at: publishedAtToIso(formData.get("published_at")),
  };
  if (status) payload.status = status;
  if (isEdit) {
    const slug = emptyToNull(formData.get("slug"));
    if (slug) payload.slug = slug;
  }

  let saved: Post;
  try {
    if (id) {
      const r = await apiFetch<{ post: Post }>(`/api/admin/posts/${id}`, { method: "PATCH", json: payload });
      saved = r.post;
    } else {
      const r = await apiFetch<{ post: Post }>(`/api/admin/posts`, { method: "POST", json: payload });
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
  } catch { /* best-effort */ }
  revalidate();
  redirect("/admin/blog?deleted=1");
}
