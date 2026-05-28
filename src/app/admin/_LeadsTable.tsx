"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, type DataTableColumn, type DataTableTab } from "@/components/ui/DataTable";
import { mockLeads, type Lead, type LeadKind, type LeadStatus } from "./_mock";

type TabKey = "all" | LeadKind;

const tabLabels: Record<TabKey, string> = {
  all: "All",
  application: "Applications",
  org: "Organizations",
  contact: "Contact messages",
};

const kindLabels: Record<LeadKind, string> = {
  contact: "Contact",
  org: "Org",
  application: "Application",
};

const statusTone: Record<LeadStatus, string> = {
  new: "dt-pill dt-pill--blue",
  contacted: "dt-pill dt-pill--amber",
  scheduled: "dt-pill dt-pill--violet",
  qualified: "dt-pill dt-pill--teal",
  won: "dt-pill dt-pill--green",
  lost: "dt-pill dt-pill--slate",
};

// Locale-locked, time-independent fallback used for SSR + first paint to avoid
// hydration mismatches. Replaced with relative time after mount.
function fmtStableDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtRelative(iso: string, nowMs: number) {
  const d = new Date(iso);
  const diff = Math.round((nowMs - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LeadsTable() {
  const [tab, setTab] = useState<TabKey>("all");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: mockLeads.length,
      application: 0,
      org: 0,
      contact: 0,
    };
    for (const l of mockLeads) c[l.kind]++;
    return c;
  }, []);

  const tabs: DataTableTab<TabKey>[] = [
    { key: "all", label: tabLabels.all, count: counts.all },
    { key: "application", label: tabLabels.application, count: counts.application },
    { key: "org", label: tabLabels.org, count: counts.org },
    { key: "contact", label: tabLabels.contact, count: counts.contact },
  ];

  const columns: DataTableColumn<Lead>[] = [
    {
      key: "name",
      header: "Name",
      width: "22%",
      render: (l) => (
        <div className="dt-name">
          <span className="dt-name__main">{l.name}</span>
          <span className="dt-name__sub">{l.email ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "kind",
      header: "Type",
      width: "10rem",
      render: (l) => <span className="dt-kind">{kindLabels[l.kind]}</span>,
      hideOnSm: true,
    },
    {
      key: "status",
      header: "Status",
      width: "9rem",
      render: (l) => <span className={statusTone[l.status]}>{l.status}</span>,
    },
    {
      key: "assigned",
      header: "Owner",
      width: "12rem",
      hideOnSm: true,
      render: (l) =>
        l.assigned_user ? (
          <span className="dt-owner">{l.assigned_user.name}</span>
        ) : (
          <span className="dt-muted">Unassigned</span>
        ),
    },
    {
      key: "updated_at",
      header: "Updated",
      width: "8rem",
      align: "right",
      hideOnSm: true,
      render: (l) => (
        <span className="dt-muted" suppressHydrationWarning>
          {now === null ? fmtStableDate(l.updated_at) : fmtRelative(l.updated_at, now)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Lead, TabKey>
      title="Leads"
      description="Filter by type, then drill into any record."
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      searchable
      columns={columns}
      rows={mockLeads}
      rowKey={(l) => l.id}
      rowHref={(l) => `/admin/leads/${l.id}`}
      filter={tab === "all" ? undefined : (l) => l.kind === tab}
      emptyMessage="No leads in this view."
    />
  );
}

export default LeadsTable;

