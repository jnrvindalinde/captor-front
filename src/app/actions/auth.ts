"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearSession, setSessionToken } from "@/lib/session";

export type LoginState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let result: {
    token: string;
    user: { id: number; role: string };
  };
  try {
    result = await apiFetch("/api/auth/login", {
      method: "POST",
      json: { email, password },
      anonymous: true,
    });
  } catch (e) {
    const err = e as { status?: number; message?: string; errors?: Record<string, string[]> };
    if (err.status === 422) {
      return {
        error: err.message ?? "Invalid credentials.",
        fieldErrors: err.errors,
      };
    }
    return { error: err.message ?? "Sign-in failed. Please try again." };
  }

  await setSessionToken(result.token);

  // Honor ?next=… from the middleware bounce, but only if it's a safe local
  // path (starts with "/" and not "//" or "/\"). Otherwise role-route.
  const requestedNext = String(formData.get("next") ?? "").trim();
  const safeNext =
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.startsWith("/\\")
      ? requestedNext
      : null;

  const roleHome = ["admin", "super_admin"].includes(result.user.role) ? "/admin" : "/";
  redirect(safeNext ?? roleHome);
}

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Best-effort; we still clear the local cookie below.
  }
  await clearSession();
  redirect("/login");
}
