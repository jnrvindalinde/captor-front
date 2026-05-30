"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { apiFetch } from "@/lib/api";

export type SaveGlobalsResult = { ok: true } | { ok: false; error: string };

export async function saveGlobalsAction(payload: Record<string, unknown>): Promise<SaveGlobalsResult> {
  try {
    await apiFetch("/api/admin/globals", { method: "PATCH", json: payload });
    revalidatePath("/admin/cms/globals");
    revalidatePath("/");
    revalidateTag("cms:globals", "max");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
