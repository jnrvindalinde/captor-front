"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, type ApiError } from "@/lib/api";

export type Rule = {
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  buffer_minutes: number;
  timezone?: string | null;
};

export type AvailabilityResponse = {
  data: Array<Rule & { id: number; user_id: number; active: boolean }>;
  default: { description: string; timezone: string };
};

type Result<T> = { ok: true; data: T } | { ok: false; message: string };

function fail(e: unknown): { ok: false; message: string } {
  const err = e as ApiError;
  return { ok: false, message: err?.message ?? "Backend unavailable." };
}

export async function getAvailabilityAction(): Promise<Result<AvailabilityResponse>> {
  try {
    const r = await apiFetch<AvailabilityResponse>("/api/admin/availability");
    return { ok: true, data: r };
  } catch (e) {
    return fail(e);
  }
}

export async function saveAvailabilityAction(body: {
  timezone: string;
  rules: Rule[];
}): Promise<Result<AvailabilityResponse>> {
  try {
    const r = await apiFetch<AvailabilityResponse>("/api/admin/availability", {
      method: "PUT",
      json: body,
    });
    revalidatePath("/admin/availability");
    return { ok: true, data: r };
  } catch (e) {
    return fail(e);
  }
}

export async function clearAvailabilityAction(): Promise<Result<{ ok: true }>> {
  try {
    await apiFetch("/api/admin/availability", { method: "DELETE" });
    revalidatePath("/admin/availability");
    return { ok: true, data: { ok: true } };
  } catch (e) {
    return fail(e);
  }
}
