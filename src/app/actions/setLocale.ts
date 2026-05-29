"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, localeCookieName, type Locale } from "@/i18n/locales";

/**
 * Persist the user's locale choice in a cookie and revalidate the current
 * page so the server re-renders with the new messages bundle.
 */
export async function setLocale(next: Locale, revalidate: string = "/") {
  if (!isLocale(next)) return;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, next, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath(revalidate, "layout");
}
