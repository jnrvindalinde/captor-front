import "server-only";
import { apiFetch } from "@/lib/api";

export type SectionStatus = "draft" | "published";
export type PageStatus = "draft" | "published";

export type SectionRegistryField = {
  key: string;
  type: "string" | "text" | "richtext" | "url" | "image" | "bool" | "number" | "json";
  label?: string;
  required?: boolean;
  help?: string;
  default?: unknown;
};
export type SectionRegistryEntry = {
  label: string;
  fields: SectionRegistryField[];
};
export type SectionRegistry = Record<string, SectionRegistryEntry>;

export type PageSection = {
  id: number;
  uuid: string;
  type: string;
  position: number;
  status: SectionStatus;
  data: Record<string, unknown>;
  updated_at?: string | null;
};

export type LocalizedString = { en: string | null; fr: string | null };

export type CmsPage = {
  id: number;
  uuid: string;
  slug: string;
  kind: "marketing" | "landing";
  status: PageStatus;
  title: LocalizedString;
  seo: {
    title: LocalizedString;
    description: LocalizedString;
  };
  og_image?: unknown;
  sections?: PageSection[];
  preview_token?: string;
  published_at?: string | null;
  updated_at?: string | null;
};

export type CmsPageSummary = Omit<CmsPage, "sections">;

export type PageAuditEntry = {
  id: number;
  action: string;
  payload: Record<string, unknown> | null;
  user: { id: number; name: string; email: string } | null;
  created_at: string;
};

export async function fetchAdminPages(): Promise<CmsPageSummary[]> {
  const res = await apiFetch<{ data: CmsPageSummary[] }>("/api/admin/pages?per_page=200");
  return res.data ?? [];
}

export async function fetchAdminPage(uuid: string): Promise<CmsPage> {
  const res = await apiFetch<{ data: CmsPage }>(`/api/admin/pages/${uuid}`);
  return res.data;
}

export async function fetchAdminPageAudits(uuid: string): Promise<PageAuditEntry[]> {
  const res = await apiFetch<{ data: PageAuditEntry[] }>(`/api/admin/pages/${uuid}/audits`);
  return res.data ?? [];
}

export async function fetchSectionRegistry(): Promise<SectionRegistry> {
  const res = await apiFetch<{ data: SectionRegistry }>("/api/admin/cms/section-registry");
  return res.data ?? {};
}

/** Client-safe fetch via the public endpoint. */
export type PublicCmsPage = {
  uuid: string;
  slug: string;
  title: LocalizedString;
  seo: { title: LocalizedString; description: LocalizedString };
  sections: PageSection[];
};

export async function fetchPublicPage(slug: string): Promise<PublicCmsPage | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/public/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [`cms:page:${slug}`] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: PublicCmsPage };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Preview fetch: bypasses cache, returns drafts when token matches. */
export async function fetchPreviewPage(slug: string, token: string): Promise<PublicCmsPage | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(
      `${base.replace(/\/$/, "")}/api/public/pages/${encodeURIComponent(slug)}/preview/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data: PublicCmsPage };
    return json.data ?? null;
  } catch {
    return null;
  }
}
