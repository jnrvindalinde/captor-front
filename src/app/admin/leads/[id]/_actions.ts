"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, type ApiError } from "@/lib/api";
import type { LeadDetail, LeadStatus, Note, Meeting } from "../../_mock";
import type { Client, ClientProgram } from "../../_mock";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function fail(e: unknown): ActionResult<never> {
  const err = e as ApiError;
  return { ok: false, message: err?.message ?? "Backend unavailable." };
}

function revalidate(uuid: string) {
  revalidatePath(`/admin/leads/${uuid}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function updateLeadStageAction(
  uuid: string,
  body: { status?: LeadStatus; assigned_user_id?: number | null },
): Promise<ActionResult<{ lead: LeadDetail }>> {
  try {
    const res = await apiFetch<{ lead: LeadDetail }>(`/api/admin/leads/${uuid}`, {
      method: "PATCH",
      json: body,
    });
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export async function addLeadNoteAction(
  uuid: string,
  body: string,
): Promise<ActionResult<{ note: Note }>> {
  try {
    const res = await apiFetch<{ note: Note }>(
      `/api/admin/leads/${uuid}/notes`,
      { method: "POST", json: { body } },
    );
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export async function editLeadNoteAction(
  uuid: string,
  noteId: number,
  body: string,
): Promise<ActionResult<{ note: Note }>> {
  try {
    const res = await apiFetch<{ note: Note }>(
      `/api/admin/leads/${uuid}/notes/${noteId}`,
      { method: "PATCH", json: { body } },
    );
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export async function decideApplicationAction(
  uuid: string,
  body: { decision: "approved" | "declined"; note?: string },
): Promise<ActionResult<{ lead: LeadDetail }>> {
  try {
    const res = await apiFetch<{ lead: LeadDetail }>(
      `/api/admin/leads/${uuid}/decision`,
      { method: "POST", json: body },
    );
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export async function scheduleMeetingAction(
  uuid: string,
  body: { scheduled_at: string; notes?: string },
): Promise<ActionResult<{ meeting: Meeting; lead: LeadDetail }>> {
  try {
    const res = await apiFetch<{ meeting: Meeting; lead: LeadDetail }>(
      `/api/admin/leads/${uuid}/meetings`,
      { method: "POST", json: body },
    );
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export type SlotResponse = {
  data: Array<{ start: string; end: string }>;
  meta: {
    advisor_id: number;
    advisor_name: string;
    google_connected: boolean;
    from: string;
    to: string;
  };
};

export async function fetchMeetingSlotsAction(opts: {
  from: string;
  to: string;
  userId?: number;
}): Promise<ActionResult<SlotResponse>> {
  try {
    const qs = new URLSearchParams({ from: opts.from, to: opts.to });
    if (opts.userId) qs.set("user_id", String(opts.userId));
    const res = await apiFetch<SlotResponse>(`/api/admin/meetings/slots?${qs.toString()}`);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export async function cancelMeetingAction(uuid: string, meetingId: number): Promise<ActionResult<{ meeting: Meeting }>> {
  try {
    const res = await apiFetch<{ meeting: Meeting }>(`/api/admin/meetings/${meetingId}`, { method: "DELETE" });
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export async function rescheduleMeetingAction(
  uuid: string,
  meetingId: number,
  scheduled_at: string,
): Promise<ActionResult<{ meeting: Meeting }>> {
  try {
    const res = await apiFetch<{ meeting: Meeting }>(`/api/admin/meetings/${meetingId}/reschedule`, {
      method: "PATCH",
      json: { scheduled_at },
    });
    revalidate(uuid);
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}

export async function convertLeadToClientAction(
  uuid: string,
  body: { program: ClientProgram; consultant_id?: number | null },
): Promise<ActionResult<{ client: Client; lead: LeadDetail; already_converted?: boolean }>> {
  try {
    const res = await apiFetch<{
      client: Client;
      lead: LeadDetail;
      already_converted?: boolean;
    }>(`/api/admin/leads/${uuid}/convert`, { method: "POST", json: body });
    revalidate(uuid);
    revalidatePath("/admin/clients");
    return { ok: true, data: res };
  } catch (e) {
    return fail(e);
  }
}
