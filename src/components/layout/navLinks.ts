/**
 * Canonical site-wide primary navigation.
 *
 * Each entry pairs a `href` with a translation `key` (under the `nav.*`
 * namespace in `src/messages/{locale}.json`). Components resolve the visible
 * label via `useTranslations('nav')(item.key)` so the same list works for
 * every locale.
 */

export type NavLinkKey =
  | "home"
  | "services"
  | "stories"
  | "placements"
  | "resources"
  | "blog"
  | "contact";

export type NavLinkItem = {
  href: string;
  /** Translation key under `nav.*`. Used when `label` is not provided. */
  key: NavLinkKey | string;
  /** Pre-resolved label (used by CMS-driven nav). Wins over `key`. */
  label?: string;
  /** Defaults to `_self`. CMS nav items may set `_blank`. */
  target?: "_self" | "_blank";
};

export const siteNavLinks: NavLinkItem[] = [
  { href: "/", key: "home" },
  { href: "/services", key: "services" },
  { href: "/stories", key: "stories" },
  { href: "/placements", key: "placements" },
  { href: "/resources", key: "resources" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
];
