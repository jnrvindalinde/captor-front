import Link from "next/link";
import { mockStories } from "../_mock";

export const metadata = { title: "Stories · Captor admin" };

export default async function StoriesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; outcome?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").toLowerCase().trim();
  const status = sp.status ?? "";
  const outcome = sp.outcome ?? "";

  const rows = mockStories.filter((s) => {
    if (status && s.status !== status) return false;
    if (outcome && s.outcome !== outcome) return false;
    if (q && !(s.title.toLowerCase().includes(q) || s.person_name.toLowerCase().includes(q))) return false;
    return true;
  });

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <span className="kicker">Content</span>
          <h1 className="h2">Success stories</h1>
          <p className="admin-muted">Client outcomes showcased on the website.</p>
        </div>
        <Link href="/admin/stories/new" className="admin-btn admin-btn--solid">New story</Link>
      </header>

      <form className="admin-filters" method="get">
        <input type="search" name="q" defaultValue={sp.q ?? ""} placeholder="Search title or person…" />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select name="outcome" defaultValue={outcome}>
          <option value="">All outcomes</option>
          <option value="admission">Admission</option>
          <option value="scholarship">Scholarship</option>
          <option value="placement">Placement</option>
          <option value="transition">Transition</option>
          <option value="achievement">Achievement</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filter</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Person</th>
              <th>Outcome</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/admin/stories/${s.id}/edit`} className="admin-table__primary">{s.title}</Link>
                  <div className="admin-muted admin-muted--sm">/{s.slug}</div>
                </td>
                <td>{s.person_name}{s.person_role && <div className="admin-muted admin-muted--sm">{s.person_role}</div>}</td>
                <td>{s.outcome ? <span className="admin-pill admin-pill--ghost">{s.outcome}</span> : "—"}</td>
                <td><span className={`admin-pill admin-pill--${s.status}`}>{s.status}</span></td>
                <td>{new Date(s.updated_at).toLocaleDateString()}</td>
                <td><Link href={`/admin/stories/${s.id}/edit`} className="admin-link">Edit</Link></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">No stories match those filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
