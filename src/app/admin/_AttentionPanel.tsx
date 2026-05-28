import Link from "next/link";
import { mockLeads } from "./_mock";

type Item = { id: number; title: string; href: string; meta: string };

export function AttentionPanel() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  // 1. New leads with no assignee
  const newUnassigned: Item[] = mockLeads
    .filter((l) => l.status === "new" && !l.assigned_user)
    .map((l) => ({
      id: l.id,
      title: l.name,
      href: `/admin/leads/${l.id}`,
      meta: "New · unassigned",
    }));

  // 2. Meetings today or tomorrow
  const upcomingSoon: Item[] = mockLeads
    .filter((l) => {
      if (!l.scheduled_at) return false;
      const d = new Date(l.scheduled_at);
      return d >= now && d <= new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
    })
    .map((l) => ({
      id: l.id,
      title: l.name,
      href: `/admin/leads/${l.id}`,
      meta: `Meeting · ${new Date(l.scheduled_at as string).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })}`,
    }));

  // 3. Stale "contacted" — sat in contacted for over a week
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const stale: Item[] = mockLeads
    .filter((l) => l.status === "contacted" && new Date(l.updated_at) < sevenDaysAgo)
    .map((l) => ({
      id: l.id,
      title: l.name,
      href: `/admin/leads/${l.id}`,
      meta: "Contacted · no reply 7d+",
    }));

  const sections: Array<{ label: string; items: Item[] }> = [
    { label: "New leads · unassigned", items: newUnassigned },
    { label: "Meetings · next 48h", items: upcomingSoon },
    { label: "Stale follow-ups", items: stale },
  ];

  const totalCount = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Needs attention</h2>
        <span className="admin-attention__count">{totalCount}</span>
      </header>

      {totalCount === 0 ? (
        <p className="admin-empty">Inbox zero — nothing pending.</p>
      ) : (
        <div className="admin-attention">
          {sections.map((s) =>
            s.items.length === 0 ? null : (
              <div key={s.label} className="admin-attention__group">
                <h3 className="admin-attention__label">{s.label}</h3>
                <ul className="admin-attention__list">
                  {s.items.map((it) => (
                    <li key={`${s.label}-${it.id}`}>
                      <Link href={it.href}>
                        <span className="admin-attention__title">{it.title}</span>
                        <span className="admin-attention__meta">{it.meta}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      )}
    </article>
  );
}
