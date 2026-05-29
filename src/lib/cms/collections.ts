// CMS Collections client. Admin helpers are server-only; the public helper
// is safe to import from client components too.

export type CollectionSchemaField = {
  key: string;
  type: "string" | "text" | "url" | "boolean" | "number";
  label?: string;
  required?: boolean;
  help?: string;
};

export type CollectionSummary = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  schema: CollectionSchemaField[];
  items_count?: number;
  updated_at: string | null;
};

export type CollectionItem = {
  id: number;
  uuid: string;
  position: number;
  status: "draft" | "published";
  data: Record<string, unknown>;
  updated_at: string | null;
};

export type CollectionDetail = CollectionSummary & {
  items: CollectionItem[];
};

export type PublicCollection = {
  slug: string;
  name: string;
  items: Array<{ uuid: string; data: Record<string, unknown> }>;
};

/**
 * Anonymous, safe from client. Returns null on failure so callers can fall
 * back to hardcoded defaults.
 */
export async function fetchPublicCollection(slug: string): Promise<PublicCollection | null> {
  const base =
    typeof window === "undefined"
      ? process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      : process.env.NEXT_PUBLIC_API_URL ?? "";
  try {
    const url = `${base}/api/public/collections/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PublicCollection;
  } catch {
    return null;
  }
}
