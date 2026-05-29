import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, localeCookieName } from "./locales";

/**
 * next-intl server config — cookie-based, no URL prefix.
 *
 * UI chrome strings live in `messages/{locale}.json`. Editable site content
 * is served by the CMS (pages, collections, globals, menus).
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(localeCookieName)?.value;
  const locale = isLocale(cookieValue) ? cookieValue : defaultLocale;

  const messages = (await import(`../messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;

  return { locale, messages };
});
