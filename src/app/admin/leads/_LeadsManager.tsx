"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type DataTableColumn, type DataTableTab } from "@/components/ui/DataTable";
import { mockLeads, type Lead, type LeadKind, type LeadStatus } from "../_mock";

type TabKey = "all" | LeadKind | "lost";

const tabLabels: Record<TabKey, string> = {
  all: "All leads",
  application: "Applications",
  org: "Org inquiries",
  contact: "Contact messages",
  lost: "Archived",
};

const kindLabels: Record<LeadKind, string> = {
  contact: "Contact",
  org: "Org",
  application: "Application",
};

const statusOrder: LeadStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "qualified",
  "won",
  "lost",
];

const statusTone: Record<LeadStatus, string> = {
  new: "dt-pill dt-pill--blue",
  contacted: "dt-pill dt-pill--amber",
  scheduled: "dt-pill dt-pill--violet",
  qualified: "dt-pill dt-pill--teal",
  won: "dt-pill dt-pill--green",
  lost: "dt-pill dt-pill--slate",
};

function fmtStableDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function isTabKey(v: string | null): v is TabKey {
  return (
    v === "all" ||
    v === "application" ||
    v === "org" ||
    v === "contact" ||
    v === "lost"
  );
}

export type LeadsManagerProps = {
  initialLeads?: Lead[];
  initialCounts?: Record<TabKey, number>;
  live?: boolean;
  offlineMessage?: string;
};

export function LeadsManager({
  initialLeads,
  initialCounts,
  live = true,
  offlineMessage,
}: LeadsManagerProps = {}) {
  const leads = initialLeads ?? mockLeads;
  const router = useRouter();
  const search = useSearchParams();
  const router$push = (params: URLSearchParams) => {
    const qs = params.toString();
    router.replace(`/admin/leads${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // Initial state from URL (kind → tab; status/assignee/q → filters)
  const initialTab: TabKey = isTabKey(search.get("kind")) ? (search.get("kind") as TabKey) : "all";
  const initialStatus = (search.get("status") as LeadStatus | "") ?? "";
  const initialAssignee = (search.get("assignee") as "" | "mine" | "unassigned") ?? "";
  const initialQ = search.get("q") ?? "";

  const [tab, setTab] = useState<TabKey>(initialTab);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">(initialStatus);
  const [assigneeFilter, setAssigneeFilter] =
    useState<"" | "mine" | "unassigned">(initialAssignee);
  const [q, setQ] = useState<string>(initialQ);

  // Sync state → URL so links remain shareable.
  useEffect(() => {
    const p = new URLSearchParams();
    if (tab !== "all") p.set("kind", tab);
    if (statusFilter) p.set("status", statusFilter);
    if (assigneeFilter) p.set("assignee", assigneeFilter);
    if (q.trim()) p.set("q", q.trim());
    router$push(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter, assigneeFilter, q]);

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe "now"
    setNow(Date.now());
  }, []);

  const counts = useMemo(() => {
    if (initialCounts) return initialCounts;
    const c: Record<TabKey, number> = {
      all: 0,
      application: 0,
      org: 0,
      contact: 0,
      lost: 0,
    };
    for (const l of leads) {
      if (l.status === "lost") {
        c.lost++;
        continue;
      }
      c.all++;
      c[l.kind]++;
    }
    return c;
  }, [leads, initialCounts]);

  const tabs: DataTableTab<TabKey>[] = [
    { key: "all", label: tabLabels.all, count: counts.all },
    { key: "application", label: tabLabels.application, count: counts.application },
    { key: "org", label: tabLabels.org, count: counts.org },
    { key: "contact", label: tabLabels.contact, count: counts.contact },
    { key: "lost", label: tabLabels.lost, count: counts.lost },
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
      width: "8rem",
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
      key: "source",
      header: "Source",
      width: "9rem",
      hideOnSm: true,
      render: (l) =>
        l.source ? <span className="dt-muted">{l.source}</span> : <span className="dt-muted">—</span>,
    },
    {
      key: "assigned",
      header: "Owner",
      width: "11rem",
      hideOnSm: true,
      render: (l) =>
        l.assigned_user ? (
          <span className="dt-owner">{l.assigned_user.name}</span>
        ) : (
          <span className="dt-muted">Unassigned</span>
        ),
    },
    {
      key: "activity",
      header: "Activity",
      width: "6rem",
      align: "right",
      hideOnSm: true,
      render: (l) => (
        <span className="dt-muted">
          {l.notes_count + l.meetings_count > 0
            ? `${l.notes_count}n · ${l.meetings_count}m`
            : "—"}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      width: "7rem",
      align: "right",
      render: (l) => (
        <span className="dt-muted" suppressHydrationWarning>
          {now === null ? fmtStableDate(l.updated_at) : fmtRelative(l.updated_at, now)}
        </span>
      ),
    },
  ];

  // Combine all filters in a single predicate. Lost leads are archived: they
  // only show up under the "Archived" tab (or when the user explicitly picks
  // `lost` from the Status dropdown).
  const filter = (l: Lead) => {
    if (tab === "lost") {
      if (l.status !== "lost") return false;
    } else {
      if (tab !== "all" && l.kind !== tab) return false;
      if (statusFilter !== "lost" && l.status === "lost") return false;
    }
    if (statusFilter && l.status !== statusFilter) return false;
    if (assigneeFilter === "mine" && !l.assigned_user) return false;
    if (assigneeFilter === "unassigned" && l.assigned_user) return false;
    return true;
  };

  const sortedRows = useMemo(
    () => [...leads].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [leads]
  );

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1 className="admin-page__title">Leads</h1>
        <p className="lede">All incoming applications, organization inquiries, and contact messages.</p>
        {!live && (
          <p className="admin-gated" role="status">
            {offlineMessage ?? "Backend unavailable — showing demo data."}
          </p>
        )}
      </header>

      <div className="dt-toolbar">
        <label className="dt-toolbar__field">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "")}
          >
            <option value="">All statuses</option>
            {statusOrder.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="dt-toolbar__field">
          <span>Owner</span>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value as "" | "mine" | "unassigned")}
          >
            <option value="">Any owner</option>
            <option value="mine">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </label>
        {(statusFilter || assigneeFilter || tab !== "all" || q) && (
          <button
            type="button"
            className="dt-toolbar__reset"
            onClick={() => {
              setStatusFilter("");
              setAssigneeFilter("");
              setTab("all");
              setQ("");
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      <DataTable<Lead, TabKey>
        title="All leads"
        description="Tap a row to open the record."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        searchable
        query={q}
        onQueryChange={setQ}
        columns={columns}
        rows={sortedRows}
        rowKey={(l) => l.id}
        rowHref={(l) => `/admin/leads/${l.uuid}`}
        filter={filter}
        emptyMessage="No leads match these filters."
      />
    </div>
  );
}

export default LeadsManager;
