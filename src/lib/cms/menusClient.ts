/**
 * Client-side fetcher for the public menu endpoint. Used by SiteNav to
 * progressively enhance the hardcoded nav with CMS-managed labels and links.
 */
export type PublicMenuItem = {
  uuid: string;
  label: { en: string | null; fr: string | null };
  href: string;
  target: "_self" | "_blank";
  sort_order: number;
  visible: boolean;
};

export type PublicMenu = {
  slug: string;
  name: string;
  items: PublicMenuItem[];
};

export async function fetchPublicMenu(slug: string): Promise<PublicMenu | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/public/menus/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data: PublicMenu };
    return json.data ?? null;
  } catch {
    return null;
  }
}
