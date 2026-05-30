"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type DataTableColumn, type DataTableTab } from "@/components/ui/DataTable";
import {
  mockClients,
  clientProgramLabels,
  clientStatusLabels,
  type Client,
  type ClientProgram,
  type ClientStatus,
} from "../_mock";

type TabKey = "all" | ClientStatus;

const tabLabels: Record<TabKey, string> = {
  all: "All",
  active: "Active",
  onboarding: "Onboarding",
  on_hold: "On hold",
  completed: "Completed",
  churned: "Churned",
};

const statusTone: Record<ClientStatus, string> = {
  active: "dt-pill dt-pill--green",
  onboarding: "dt-pill dt-pill--blue",
  on_hold: "dt-pill dt-pill--amber",
  completed: "dt-pill dt-pill--teal",
  churned: "dt-pill dt-pill--slate",
};

const programs: ClientProgram[] = [
  "study-abroad",
  "scholarship",
  "career-coaching",
  "test-prep",
  "org-partnership",
];

function fmtStableDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtRelative(iso: string, nowMs: number) {
  const d = new Date(iso);
  const diff = Math.round((nowMs - d.getTime()) / 1000);
  if (diff < 0) {
    const future = -diff;
    if (future < 86400) return `in ${Math.max(1, Math.floor(future / 3600))}h`;
    if (future < 86400 * 14) return `in ${Math.floor(future / 86400)}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isTabKey(v: string | null): v is TabKey {
  return (
    v === "all" ||
    v === "active" ||
    v === "onboarding" ||
    v === "on_hold" ||
    v === "completed" ||
    v === "churned"
  );
}

export type ClientCounts = Record<TabKey, number>;

export interface ClientsManagerProps {
  initialClients?: Client[];
  initialCounts?: Partial<ClientCounts>;
  live?: boolean;
}

export function ClientsManager({
  initialClients,
  initialCounts,
  live = true,
}: ClientsManagerProps = {}) {
  const router = useRouter();
  const search = useSearchParams();
  const data = initialClients ?? mockClients;
  const initialTab: TabKey = isTabKey(search.get("status")) ? (search.get("status") as TabKey) : "all";
  const initialProgram = (search.get("program") as ClientProgram | "") ?? "";
  const initialConsultant = (search.get("consultant") as "" | "assigned" | "unassigned") ?? "";

  const [tab, setTab] = useState<TabKey>(initialTab);
  const [programFilter, setProgramFilter] = useState<ClientProgram | "">(initialProgram);
  const [consultantFilter, setConsultantFilter] =
    useState<"" | "assigned" | "unassigned">(initialConsultant);

  useEffect(() => {
    const p = new URLSearchParams();
    if (tab !== "all") p.set("status", tab);
    if (programFilter) p.set("program", programFilter);
    if (consultantFilter) p.set("consultant", consultantFilter);
    const qs = p.toString();
    router.replace(`/admin/clients${qs ? `?${qs}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, programFilter, consultantFilter]);

  const [now, setNow] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe "now"
  useEffect(() => setNow(Date.now()), []);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: data.length,
      active: 0,
      onboarding: 0,
      on_hold: 0,
      completed: 0,
      churned: 0,
    };
    for (const cl of data) c[cl.status]++;
    if (initialCounts) {
      for (const k of Object.keys(initialCounts) as TabKey[]) {
        const v = initialCounts[k];
        if (typeof v === "number") c[k] = v;
      }
    }
    return c;
  }, [data, initialCounts]);

  const tabs: DataTableTab<TabKey>[] = [
    { key: "all", label: tabLabels.all, count: counts.all },
    { key: "active", label: tabLabels.active, count: counts.active },
    { key: "onboarding", label: tabLabels.onboarding, count: counts.onboarding },
    { key: "on_hold", label: tabLabels.on_hold, count: counts.on_hold },
    { key: "completed", label: tabLabels.completed, count: counts.completed },
  ];

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "Client",
      width: "22%",
      render: (c) => (
        <div className="dt-name">
          <span className="dt-name__main">{c.name}</span>
          <span className="dt-name__sub">{c.email ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "program",
      header: "Program",
      width: "11rem",
      render: (c) => <span className="dt-kind">{clientProgramLabels[c.program]}</span>,
      hideOnSm: true,
    },
    {
      key: "consultant",
      header: "Consultant",
      width: "11rem",
      render: (c) =>
        c.consultant ? (
          <span className="dt-owner">{c.consultant.name}</span>
        ) : (
          <span className="dt-muted">Unassigned</span>
        ),
      hideOnSm: true,
    },
    {
      key: "status",
      header: "Status",
      width: "8rem",
      render: (c) => <span className={statusTone[c.status]}>{clientStatusLabels[c.status]}</span>,
    },
    {
      key: "next_milestone",
      header: "Next milestone",
      width: "16rem",
      render: (c) =>
        c.next_milestone ? (
          <div className="dt-name">
            <span className="dt-name__main">{c.next_milestone.label}</span>
            <span className="dt-name__sub" suppressHydrationWarning>
              {now === null
                ? fmtStableDate(c.next_milestone.due_at)
                : fmtRelative(c.next_milestone.due_at, now)}
            </span>
          </div>
        ) : (
          <span className="dt-muted">—</span>
        ),
      hideOnSm: true,
    },
    {
      key: "start_date",
      header: "Started",
      width: "7rem",
      align: "right",
      render: (c) => (
        <span className="dt-muted" suppressHydrationWarning>
          {fmtStableDate(c.start_date)}
        </span>
      ),
    },
  ];

  const filter = (c: Client) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (programFilter && c.program !== programFilter) return false;
    if (consultantFilter === "assigned" && !c.consultant) return false;
    if (consultantFilter === "unassigned" && c.consultant) return false;
    return true;
  };

  const sortedRows = useMemo(
    () => [...data].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [data]
  );

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1 className="admin-page__title">Clients</h1>
        <p className="lede">Active engagements and the consultants delivering them.</p>
        {!live && (
          <p className="admin-gated" role="status">
            Backend unavailable — showing mock clients.
          </p>
        )}
      </header>

      <div className="dt-toolbar">
        <label className="dt-toolbar__field">
          <span>Program</span>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value as ClientProgram | "")}
          >
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p} value={p}>{clientProgramLabels[p]}</option>
            ))}
          </select>
        </label>
        <label className="dt-toolbar__field">
          <span>Consultant</span>
          <select
            value={consultantFilter}
            onChange={(e) =>
              setConsultantFilter(e.target.value as "" | "assigned" | "unassigned")
            }
          >
            <option value="">Any consultant</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </label>
        {(programFilter || consultantFilter || tab !== "all") && (
          <button
            type="button"
            className="dt-toolbar__reset"
            onClick={() => {
              setProgramFilter("");
              setConsultantFilter("");
              setTab("all");
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      <DataTable<Client, TabKey>
        title="All clients"
        description="Tap a row to open the engagement."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        searchable
        columns={columns}
        rows={sortedRows}
        rowKey={(c) => c.id}
        rowHref={(c) => `/admin/clients/${c.uuid}`}
        filter={filter}
        emptyMessage="No clients match these filters."
      />
    </div>
  );
}

export default ClientsManager;
