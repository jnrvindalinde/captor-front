// Server-only session helpers. The session cookie just stores the
// Laravel Sanctum bearer token; user info is hydrated by calling /api/auth/me.
import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "captor_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
