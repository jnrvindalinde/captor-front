"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

function bust(slug: string) {
  revalidatePath("/admin/cms/menus");
  revalidatePath(`/admin/cms/menus/${slug}`);
  // The CMS-driven nav is fetched client-side, so we don't need to revalidate
  // any specific page path here — but bust the home page anyway since /api
  // calls are cached there.
  revalidatePath("/");
}

type Result = { ok: true } | { ok: false; error: string };
const message = (e: unknown) => (e instanceof Error ? e.message : "Request failed");

export async function addMenuItemAction(
  slug: string,
  payload: { label_en: string; label_fr?: string | null; href: string; target?: "_self" | "_blank" },
): Promise<Result> {
  try {
    await apiFetch(`/api/admin/menus/${slug}/items`, { method: "POST", json: payload });
    bust(slug);
    return { ok: true };
  } catch (e) { return { ok: false, error: message(e) }; }
}

export async function updateMenuItemAction(
  slug: string,
  uuid: string,
  payload: Record<string, unknown>,
): Promise<Result> {
  try {
    await apiFetch(`/api/admin/menus/${slug}/items/${uuid}`, { method: "PATCH", json: payload });
    bust(slug);
    return { ok: true };
  } catch (e) { return { ok: false, error: message(e) }; }
}

export async function deleteMenuItemAction(slug: string, uuid: string): Promise<Result> {
  try {
    await apiFetch(`/api/admin/menus/${slug}/items/${uuid}`, { method: "DELETE" });
    bust(slug);
    return { ok: true };
  } catch (e) { return { ok: false, error: message(e) }; }
}

export async function reorderMenuItemsAction(
  slug: string,
  order: { uuid: string; sort_order: number }[],
): Promise<Result> {
  try {
    await apiFetch(`/api/admin/menus/${slug}/items/reorder`, { method: "POST", json: { order } });
    bust(slug);
    return { ok: true };
  } catch (e) { return { ok: false, error: message(e) }; }
}
