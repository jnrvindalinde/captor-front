"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getGoogleConnectUrlAction(): Promise<{ authUrl: string } | { error: string }> {
  try {
    const res = await apiFetch<{ auth_url: string }>("/api/admin/google/connect");
    return { authUrl: res.auth_url };
  } catch (e) {
    const err = e as { message?: string };
    return { error: err.message ?? "Could not start Google connect flow." };
  }
}

export async function disconnectGoogleAction(): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch("/api/admin/google/disconnect", { method: "POST" });
    revalidatePath("/admin/settings/google");
    return { ok: true };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: err.message ?? "Could not disconnect." };
  }
}
