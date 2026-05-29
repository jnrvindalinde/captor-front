"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, type ApiError } from "@/lib/api";
import type { Client, ClientStatus, ClientProgram } from "../../_mock";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function fail(e: unknown): ActionResult<never> {
  const err = e as ApiError;
  return { ok: false, message: err?.message ?? "Backend unavailable." };
}

function revalidate(uuid: string) {
  revalidatePath(`/admin/clients/${uuid}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
}

export type UpdateClientPayload = {
  status?: ClientStatus;
  consultant_id?: number | null;
  program?: ClientProgram;
  start_date?: string;
  next_milestone_label?: string | null;
  next_milestone_due_at?: string | null;
  satisfaction?: number | null;
};

export async function updateClientAction(
  uuid: string,
  body: UpdateClientPayload,
): Promise<ActionResult<{ client: Client }>> {
  try {
    const res = await apiFetch<{ client: Client }>(
      `/api/admin/clients/${uuid}`,
      { method: "PATCH", json: body },
    );
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}
