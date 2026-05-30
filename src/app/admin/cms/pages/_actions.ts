"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";

function bustPage(slug?: string | null, uuid?: string | null) {
  revalidatePath("/admin/cms/pages");
  if (uuid) revalidatePath(`/admin/cms/pages/${uuid}`);
  if (slug) {
    revalidatePath(`/p/${slug}`);
    revalidateTag(`cms:page:${slug}`, "max");
  }
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createPageAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();
  const title_en = String(formData.get("title_en") ?? "").trim();
  const title_fr = String(formData.get("title_fr") ?? "").trim() || null;

  if (!slug || !title_en) return;

  try {
    const res = await apiFetch<{ data: { uuid: string; slug: string } }>("/api/admin/pages", {
      method: "POST",
      json: { slug, title_en, title_fr },
    });
    bustPage(res.data.slug, res.data.uuid);
    redirect(`/admin/cms/pages/${res.data.uuid}`);
  } catch (err) {
    // Re-throw redirect (it's an internal Next.js signal); swallow validation errors.
    if (err && typeof err === "object" && "digest" in err) throw err;
    return;
  }
}

export async function updatePageMetaAction(
  uuid: string,
  payload: Record<string, string | number | null>,
): Promise<ActionResult> {
  try {
    const res = await apiFetch<{ data: { slug: string } }>(`/api/admin/pages/${uuid}`, {
      method: "PATCH",
      json: payload,
    });
    bustPage(res.data.slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function publishPageAction(uuid: string, slug: string): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/pages/${uuid}/publish`, { method: "POST" });
    bustPage(slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Publish failed" };
  }
}

export async function unpublishPageAction(uuid: string, slug: string): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/pages/${uuid}/unpublish`, { method: "POST" });
    bustPage(slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unpublish failed" };
  }
}

export async function deletePageAction(uuid: string, slug: string): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/pages/${uuid}`, { method: "DELETE" });
    bustPage(slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

export async function addSectionAction(
  uuid: string,
  slug: string,
  type: string,
  data: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/pages/${uuid}/sections`, {
      method: "POST",
      json: { type, data, status: "published" },
    });
    bustPage(slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Add section failed" };
  }
}

export async function updateSectionAction(
  uuid: string,
  slug: string,
  sectionUuid: string,
  payload: { data?: Record<string, unknown>; status?: "draft" | "published" },
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/pages/${uuid}/sections/${sectionUuid}`, {
      method: "PATCH",
      json: payload,
    });
    bustPage(slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update section failed" };
  }
}

export async function deleteSectionAction(
  uuid: string,
  slug: string,
  sectionUuid: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/pages/${uuid}/sections/${sectionUuid}`, { method: "DELETE" });
    bustPage(slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Delete section failed" };
  }
}

export async function reorderSectionsAction(
  uuid: string,
  slug: string,
  order: { uuid: string; position: number }[],
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/admin/pages/${uuid}/sections/reorder`, {
      method: "POST",
      json: { order },
    });
    bustPage(slug, uuid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Reorder failed" };
  }
}
