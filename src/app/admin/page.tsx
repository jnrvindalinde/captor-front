import Link from "next/link";
import { mockDashboard } from "./_mock";
import { CalendarOverview } from "./_CalendarOverview";
import { AttentionPanel } from "./_AttentionPanel";
import { LeadsTable } from "./_LeadsTable";

export default async function AdminDashboardPage() {
  const data = mockDashboard;

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h1 className="admin-page__title">Dashboard</h1>
        <p className="lede">Where things stand right now.</p>
      </header>

      <section className="admin-stats">
        <Stat label="Total leads"   value={data.totals.leads} />
        <Stat label="New"           value={data.totals.new} />
        <Stat label="Applications"  value={data.totals.applications} />
      </section>

      <section className="admin-twocol">
        <div className="admin-twocol__col">
          <CalendarOverview />
        </div>

        <div className="admin-twocol__col">
          <AttentionPanel />
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
                    <Link href={`/admin/leads/${m.id}`}>
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

      <LeadsTable />
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
