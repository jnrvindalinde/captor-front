/**
 * Client-side fetcher for the public site-globals endpoint. Footer + (later)
 * SiteNav use this to progressively enhance hardcoded content with CMS data.
 */
export type PublicGlobals = {
  company_name: string;
  tagline: { en: string | null; fr: string | null };
  logo: { light: string | null; dark: string | null };
  contact: { email: string | null; phone: string | null };
  address: { en: string | null; fr: string | null };
  socials: Record<string, string | null>;
  footer_copyright: { en: string | null; fr: string | null };
};

export async function fetchPublicGlobals(): Promise<PublicGlobals | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/public/globals`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data: PublicGlobals };
    return json.data ?? null;
  } catch {
    return null;
  }
}
