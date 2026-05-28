import "server-only";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin" | string;
  google_calendar_id?: string | null;
};

/** Returns the authenticated user, or null if no/invalid session. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const { user } = await apiFetch<{ user: AuthUser }>("/api/auth/me");
    return user;
  } catch {
    return null;
  }
}

/** Redirects to /login if the user is not authenticated. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects to /login (or /) if the user is not an admin. */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (!["admin", "super_admin"].includes(user.role)) {
    redirect("/");
  }
  return user;
}
