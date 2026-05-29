import Link from "next/link";
import { mockDashboard, type DashboardData, type Lead } from "./_mock";
import { CalendarOverview } from "./_CalendarOverview";
import { AttentionPanel } from "./_AttentionPanel";
import { LeadsTable } from "./_LeadsTable";
import { apiFetch, type ApiError } from "@/lib/api";

type MeetingRow = {
  id: number;
  scheduled_at: string;
  lead: { id: number; uuid: string; kind: Lead["kind"]; name: string; email: string | null; status: Lead["status"] };
};

async function loadDashboard(): Promise<{
  data: DashboardData;
  calendar: Lead[];
  live: boolean;
  error?: string;
}> {
  try {
    const data = await apiFetch<DashboardData>("/api/admin/dashboard");
    // Pull a wider meeting window for the calendar widget so it can show
    // past + future events, independent of recent-leads paging.
    let calendar: Lead[] = data.recent as Lead[];
    try {
      const meetings = await apiFetch<{ data: MeetingRow[] }>(
        "/api/admin/meetings?from=" +
          new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) +
          "&to=" +
          new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      );
      // Project meetings into the Lead shape the calendar widget understands.
      calendar = meetings.data.map((m) => ({
        id: m.lead.id,
        uuid: m.lead.uuid,
        kind: m.lead.kind,
        status: m.lead.status,
        assigned_user: null,
        name: m.lead.name,
        email: m.lead.email,
        phone: null,
        source: null,
        scheduled_at: m.scheduled_at,
        tags: null,
        created_at: m.scheduled_at,
        updated_at: m.scheduled_at,
        notes_count: 0,
        meetings_count: 1,
      }));
    } catch {
      /* fall back silently to recent leads */
    }
    return { data, calendar, live: true };
  } catch (e) {
    const err = e as ApiError;
    return {
      data: mockDashboard,
      calendar: mockDashboard.recent as Lead[],
      live: false,
      error: err?.message ?? "Backend unavailable — showing demo data.",
    };
  }
}

export default async function AdminDashboardPage() {
  const { data, calendar, live, error } = await loadDashboard();
  const recent: Lead[] = data.recent as Lead[];

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1 className="admin-page__title">Dashboard</h1>
        <p className="lede">Where things stand right now.</p>
        {!live && (
          <p className="admin-gated" role="status">
            {error ?? "Backend unavailable — showing demo data."}
          </p>
        )}
      </header>

      <section className="admin-stats">
        <Stat label="Total leads"   value={data.totals.leads} />
        <Stat label="New"           value={data.totals.new} />
        <Stat label="Applications"  value={data.totals.applications} />
      </section>

      <section className="admin-twocol">
        <div className="admin-twocol__col">
          <CalendarOverview leads={calendar} />
        </div>

        <div className="admin-twocol__col">
          <AttentionPanel leads={recent} />
          <article className="admin-panel">
            <header className="admin-panel__head">
              <h2 className="h3">Upcoming meetings</h2>
            </header>
            {data.upcoming_meetings.length === 0 ? (
              <p className="admin-empty">No meetings scheduled.</p>
            ) : (
              <ul className="admin-list">
                {data.upcoming_meetings.map((m) => (
                  <li key={m.id}>
                    <Link href={`/admin/leads/${m.uuid}`}>
                      <span className="admin-list__name">{m.name}</span>
                      <span className="admin-list__meta">
                        {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      <LeadsTable rows={recent} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat__label">{label}</span>
      <strong className="admin-stat__value">{value}</strong>
    </div>
  );
}
