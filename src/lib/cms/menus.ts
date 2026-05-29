import "server-only";
import { apiFetch } from "@/lib/api";

export type LocalizedLabel = { en: string | null; fr: string | null };

export type NavMenuItem = {
  uuid: string;
  label: LocalizedLabel;
  href: string;
  target: "_self" | "_blank";
  sort_order: number;
  visible: boolean;
};

export type NavMenu = {
  slug: string;
  name: string;
  description?: string | null;
  items: NavMenuItem[];
};

export type NavMenuSummary = Omit<NavMenu, "items"> & { items_count?: number };

export async function fetchAdminMenus(): Promise<NavMenuSummary[]> {
  const res = await apiFetch<{ data: NavMenuSummary[] }>("/api/admin/menus");
  return res.data ?? [];
}

export async function fetchAdminMenu(slug: string): Promise<NavMenu> {
  const res = await apiFetch<{ data: NavMenu }>(`/api/admin/menus/${slug}`);
  return res.data;
}

export type PublicMenuResponse = NavMenu;
