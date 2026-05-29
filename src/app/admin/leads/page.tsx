import { Suspense } from "react";
import { LeadsManager } from "./_LeadsManager";
import { mockLeads, type Lead, type LeadKind, type LeadStatus } from "../_mock";
import { apiFetch, type ApiError } from "@/lib/api";

export const metadata = { title: "Leads · Captor Admin" };

type Counts = { all: number; application: number; org: number; contact: number; lost: number };

type LeadsResponse = {
  data: Lead[];
  counts: Counts;
};

type ServerFilters = {
  kind?: LeadKind | "lost";
  status?: LeadStatus;
  assignee?: "mine" | "unassigned";
  q?: string;
};

function computeCounts(leads: Lead[]): Counts {
  const c: Counts = { all: 0, application: 0, org: 0, contact: 0, lost: 0 };
  for (const l of leads) {
    if (l.status === "lost") {
      c.lost++;
      continue;
    }
    c.all++;
    c[l.kind]++;
  }
  return c;
}

function applyMockFilters(leads: Lead[], f: ServerFilters): Lead[] {
  return leads.filter((l) => {
    if (f.kind === "lost") {
      if (l.status !== "lost") return false;
    } else if (f.kind) {
      if (l.kind !== f.kind) return false;
    }
    if (f.status && l.status !== f.status) return false;
    if (f.assignee === "mine" && !l.assigned_user) return false;
    if (f.assignee === "unassigned" && l.assigned_user) return false;
    if (f.q) {
      const t = f.q.toLowerCase();
      if (!l.name.toLowerCase().includes(t) && !(l.email ?? "").toLowerCase().includes(t)) {
        return false;
      }
    }
    return true;
  });
}

async function loadLeads(f: ServerFilters): Promise<{
  leads: Lead[];
  counts: Counts;
  live: boolean;
  error?: string;
}> {
  const qs = new URLSearchParams({ per_page: "100" });
  // The backend treats "lost" as a status, not a kind. Translate.
  if (f.kind && f.kind !== "lost") qs.set("kind", f.kind);
  if (f.kind === "lost") qs.set("status", "lost");
  else if (f.status) qs.set("status", f.status);
  if (f.q) qs.set("q", f.q);
  // `assignee=mine|unassigned` is a UI-only shape; the backend wants a user id.
  // We refine these client-side until a "me" alias lands server-side.

  try {
    const res = await apiFetch<LeadsResponse>(`/api/admin/leads?${qs.toString()}`);
    let leads = res.data ?? [];
    if (f.assignee === "mine") leads = leads.filter((l) => !!l.assigned_user);
    if (f.assignee === "unassigned") leads = leads.filter((l) => !l.assigned_user);
    return { leads, counts: res.counts, live: true };
  } catch (e) {
    const err = e as ApiError;
    return {
      leads: applyMockFilters(mockLeads, f),
      counts: computeCounts(mockLeads),
      live: false,
      error: err?.message ?? "Backend unavailable — showing demo data.",
    };
  }
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const filters: ServerFilters = {
    kind: pick("kind") as ServerFilters["kind"],
    status: pick("status") as ServerFilters["status"],
    assignee: pick("assignee") as ServerFilters["assignee"],
    q: pick("q"),
  };

  const { leads, counts, live, error } = await loadLeads(filters);

  return (
    <Suspense fallback={null}>
      <LeadsManager
        initialLeads={leads}
        initialCounts={counts}
        live={live}
        offlineMessage={error}
      />
    </Suspense>
  );
}
