"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { CollectionItem } from "@/lib/cms/collections";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function bust(slug: string) {
  revalidatePath(`/admin/cms/collections/${slug}`);
  revalidatePath("/admin/cms/collections");
  revalidatePath("/");
}

export async function addCollectionItemAction(
  slug: string,
  data: Record<string, unknown>,
): Promise<ActionResult<CollectionItem>> {
  try {
    const res = await apiFetch<{ data: CollectionItem }>(
      `/api/admin/collections/${encodeURIComponent(slug)}/items`,
      { method: "POST", json: { data } },
    );
    bust(slug);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Add failed." };
  }
}

export async function updateCollectionItemAction(
  slug: string,
  uuid: string,
  patch: { data?: Record<string, unknown>; status?: "draft" | "published"; position?: number },
): Promise<ActionResult<CollectionItem>> {
  try {
    const res = await apiFetch<{ data: CollectionItem }>(
      `/api/admin/collections/${encodeURIComponent(slug)}/items/${uuid}`,
      { method: "PATCH", json: patch },
    );
    bust(slug);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed." };
  }
}

export async function deleteCollectionItemAction(
  slug: string,
  uuid: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/collections/${encodeURIComponent(slug)}/items/${uuid}`, {
      method: "DELETE",
    });
    bust(slug);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed." };
  }
}

export async function reorderCollectionItemsAction(
  slug: string,
  order: Array<{ uuid: string; position: number }>,
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/collections/${encodeURIComponent(slug)}/items/reorder`, {
      method: "POST",
      json: { order },
    });
    bust(slug);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Reorder failed." };
  }
}
