"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Crumb = { label: string; href: string };

const LABELS: Record<string, string> = {
  admin: "Admin",
  leads: "Leads",
  clients: "Clients",
  blog: "Blog",
  resources: "Resources",
  stories: "Stories",
  calendar: "Calendar",
  new: "New",
  edit: "Edit",
};

function toLabel(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  // Decode URI components and prettify
  try {
    segment = decodeURIComponent(segment);
  } catch {
    // ignore
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let acc = "";
  for (const part of parts) {
    acc += "/" + part;
    crumbs.push({ label: toLabel(part), href: acc });
  }
  // When on the admin root, treat the dashboard as the current page.
  if (pathname === "/admin") {
    crumbs.push({ label: "Dashboard", href: "/admin" });
  }
  return crumbs;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminTopBar({
  user,
}: {
  user: { name: string; email: string };
}) {
  const pathname = usePathname() || "/admin";
  const crumbs = buildCrumbs(pathname);

  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="admin-topbar">
      <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={`${i}-${c.href}`} className="admin-breadcrumbs__item">
                {isLast ? (
                  <span aria-current="page">{c.label}</span>
                ) : (
                  <Link href={c.href}>{c.label}</Link>
                )}
                {!isLast && <span className="admin-breadcrumbs__sep" aria-hidden>/</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="admin-topbar__actions">
        <div className="admin-topbar__notif" ref={notifRef}>
          <button
            type="button"
            className="admin-topbar__icon-btn"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((v) => !v);
              setAvatarOpen(false);
            }}
          >
            <BellIcon />
            <span className="admin-topbar__badge" aria-hidden>•</span>
          </button>
          {notifOpen && (
            <div className="admin-popover" role="menu">
              <div className="admin-popover__head">Notifications</div>
              <div className="admin-popover__empty">You're all caught up.</div>
            </div>
          )}
        </div>

        <div className="admin-topbar__avatar" ref={avatarRef}>
          <button
            type="button"
            className="admin-avatar"
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={avatarOpen}
            onClick={() => {
              setAvatarOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <span aria-hidden>{initialsOf(user.name) || "?"}</span>
          </button>
          {avatarOpen && (
            <div className="admin-popover admin-popover--right" role="menu">
              <div className="admin-popover__head">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2h15Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
