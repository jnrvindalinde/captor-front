"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Item = { href: string; label: string; match?: (pathname: string, search: URLSearchParams) => boolean };
type Group = { label: string; items: Item[] };

const GROUPS: Group[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        match: (p) => p === "/admin",
      },
      {
        href: "/admin/calendar",
        label: "Calendar",
        match: (p) => p.startsWith("/admin/calendar"),
      },
    ],
  },
  {
    label: "Leads",
    items: [
      {
        href: "/admin/leads",
        label: "All leads",
        match: (p) => p.startsWith("/admin/leads"),
      },
    ],
  },
  {
    label: "Clients",
    items: [
      {
        href: "/admin/clients",
        label: "All clients",
        match: (p) => p.startsWith("/admin/clients"),
      },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", match: (p) => p.startsWith("/admin/blog") },
      { href: "/admin/resources", label: "Resources", match: (p) => p.startsWith("/admin/resources") },
      { href: "/admin/stories", label: "Stories", match: (p) => p.startsWith("/admin/stories") },
    ],
  },
  {
    label: "CMS",
    items: [
      { href: "/admin/cms/media", label: "Media library", match: (p) => p.startsWith("/admin/cms/media") },
      { href: "/admin/cms/collections", label: "Collections", match: (p) => p.startsWith("/admin/cms/collections") },
      { href: "/admin/cms/pages", label: "Pages", match: (p) => p.startsWith("/admin/cms/pages") },
      { href: "/admin/cms/menus", label: "Navigation", match: (p) => p.startsWith("/admin/cms/menus") },
      { href: "/admin/cms/globals", label: "Site globals", match: (p) => p.startsWith("/admin/cms/globals") },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/availability", label: "Availability", match: (p) => p.startsWith("/admin/availability") },
      { href: "/admin/settings/google", label: "Google Calendar", match: (p) => p.startsWith("/admin/settings/google") },
    ],
  },
];

export function AdminSideNav() {
  const pathname = usePathname() || "";
  const sp = useSearchParams();
  const search = new URLSearchParams(sp?.toString() ?? "");

  return (
    <nav className="admin-nav" aria-label="Admin">
      {GROUPS.map((group) => (
        <div className="admin-nav__group" key={group.label}>
          <span className="admin-nav__sep">{group.label}</span>
          {group.items.map((item) => {
            const active = item.match
              ? item.match(pathname, search)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
