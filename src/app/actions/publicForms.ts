"use server";

import { apiFetch, type ApiError } from "@/lib/api";

export type PublicFormResult =
  | { ok: true; id: number }
  | { ok: false; message: string; errors?: Record<string, string[]> };

function fail(e: unknown): PublicFormResult {
  const err = e as ApiError;
  return {
    ok: false,
    message: err?.message ?? "Submission failed. Please try again.",
    errors: err?.errors,
  };
}

export async function submitContactAction(input: {
  name: string;
  email: string;
  topic: "applications" | "advising" | "partnerships" | "press" | "other";
  message: string;
}): Promise<PublicFormResult> {
  try {
    const r = await apiFetch<{ id: number }>("/api/public/contact", {
      method: "POST",
      json: input,
      anonymous: true,
    });
    return { ok: true, id: r.id };
  } catch (e) {
    return fail(e);
  }
}

export async function submitOrgInquiryAction(input: {
  name: string;
  role: string;
  organization: string;
  about: string;
  contact: string;
}): Promise<PublicFormResult> {
  try {
    const r = await apiFetch<{ id: number }>("/api/public/org-inquiry", {
      method: "POST",
      json: input,
      anonymous: true,
    });
    return { ok: true, id: r.id };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Apply form uses multipart/form-data because of file uploads. The caller is
 * responsible for building the FormData with all required + optional fields.
 */
export async function submitApplicationAction(
  formData: FormData,
): Promise<PublicFormResult> {
  try {
    const r = await apiFetch<{ id: number }>("/api/public/applications", {
      method: "POST",
      body: formData,
      anonymous: true,
    });
    return { ok: true, id: r.id };
  } catch (e) {
    return fail(e);
  }
}
