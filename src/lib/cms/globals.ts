import "server-only";
import { apiFetch } from "@/lib/api";

export type Localized = { en: string | null; fr: string | null };

export type SiteGlobals = {
  company_name: string;
  tagline: Localized;
  logo: { light: string | null; dark: string | null };
  contact: { email: string | null; phone: string | null };
  address: Localized;
  socials: Record<string, string | null>;
  footer_copyright: Localized;
};

export async function fetchAdminGlobals(): Promise<SiteGlobals> {
  const res = await apiFetch<{ data: SiteGlobals }>("/api/admin/globals");
  return res.data;
}

export async function fetchPublicGlobalsServer(): Promise<SiteGlobals | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/public/globals`, {
      next: { revalidate: 60, tags: ["cms:globals"] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: SiteGlobals };
    return json.data ?? null;
  } catch {
    return null;
  }
}
