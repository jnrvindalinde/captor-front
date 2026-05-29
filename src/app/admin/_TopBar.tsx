"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { mockLeads, mockClients } from "./_mock";
import { useNotifications } from "./_NotificationsContext";

type Crumb = { label: string; href: string };

/**
 * Live breadcrumb-label registry. Detail pages call `setBreadcrumbLabel(uuid, name)`
 * after fetching from the API so the topbar shows e.g. "Richard Somda" instead of
 * a raw UUID. Falls back to the mock lookups (and then to the prettified segment)
 * when no live entry has been registered yet.
 */
const breadcrumbLabels = new Map<string, string>();
const breadcrumbListeners = new Set<() => void>();
let breadcrumbVersion = 0;

export function setBreadcrumbLabel(segment: string, label: string): void {
  if (!segment || !label) return;
  if (breadcrumbLabels.get(segment) === label) return;
  breadcrumbLabels.set(segment, label);
  breadcrumbVersion += 1;
  breadcrumbListeners.forEach((l) => l());
}

function subscribeBreadcrumbs(listener: () => void): () => void {
  breadcrumbListeners.add(listener);
  return () => breadcrumbListeners.delete(listener);
}

function getBreadcrumbVersion(): number {
  return breadcrumbVersion;
}

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

/**
 * Resolve a dynamic segment (e.g. uuid) to a human label based on its parent.
 * Returns null if no override applies; the caller falls back to toLabel().
 */
function resolveDynamicLabel(parent: string | undefined, segment: string): string | null {
  const live = breadcrumbLabels.get(segment);
  if (live) return live;
  if (parent === "leads") {
    const lead = mockLeads.find((l) => l.uuid === segment);
    if (lead) return lead.name;
  }
  if (parent === "clients") {
    const client = mockClients.find((c) => c.uuid === segment);
    if (client) return client.name;
  }
  return null;
}

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    acc += "/" + part;
    const dynamic = resolveDynamicLabel(parts[i - 1], part);
    crumbs.push({ label: dynamic ?? toLabel(part), href: acc });
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
  // Re-render when a detail page registers a live breadcrumb label.
  useSyncExternalStore(subscribeBreadcrumbs, getBreadcrumbVersion, getBreadcrumbVersion);
  const crumbs = buildCrumbs(pathname);

  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { items: notifItems } = useNotifications();

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
            {notifItems.length > 0 && (
              <span className="admin-topbar__badge admin-topbar__badge--count" aria-hidden>
                {notifItems.length > 9 ? "9+" : notifItems.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="admin-popover admin-popover--notif" role="menu">
              <div className="admin-popover__head">Notifications</div>
              {notifItems.length === 0 ? (
                <div className="admin-popover__empty">You&apos;re all caught up.</div>
              ) : (
                <ul className="admin-popover__list">
                  {notifItems.map((n) => (
                    <li key={n.id} className="admin-popover__item">
                      {n.source && (
                        <Link href={`/admin/leads/${n.source.leadUuid}`} className="admin-popover__item-src">
                          {n.source.leadName}
                        </Link>
                      )}
                      <p className="admin-popover__item-body">{n.body}</p>
                      <span className="admin-popover__item-time" suppressHydrationWarning>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
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
