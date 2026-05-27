export type NavLinkItem = {
  href: string;
  label: string;
};

/**
 * Canonical site-wide primary navigation.
 * Single source of truth — used by SiteNav on every page.
 */
export const siteNavLinks: NavLinkItem[] = [
  { href: "/services", label: "Services" },
  { href: "/stories", label: "Stories" },
  { href: "/placements", label: "Placements" },
  { href: "/resources", label: "Resources" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];
