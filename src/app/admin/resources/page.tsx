import Link from "next/link";
import { mockResources } from "../_mock";

export const metadata = { title: "Resources · Captor admin" };

export default async function ResourcesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; format?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").toLowerCase().trim();
  const status = sp.status ?? "";
  const format = sp.format ?? "";

  const rows = mockResources.filter((r) => {
    if (status && r.status !== status) return false;
    if (format && r.format !== format) return false;
    if (q && !(r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q))) return false;
    return true;
  });

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <span className="kicker">Content</span>
          <h1 className="h2">Resources</h1>
          <p className="admin-muted">Guides, videos, documents, and external links.</p>
        </div>
        <Link href="/admin/resources/new" className="admin-btn admin-btn--solid">New resource</Link>
      </header>

      <form className="admin-filters" method="get">
        <input type="search" name="q" defaultValue={sp.q ?? ""} placeholder="Search…" />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select name="format" defaultValue={format}>
          <option value="">All formats</option>
          <option value="guide">Guide</option>
          <option value="document">Document</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="external">External link</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filter</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Format</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/resources/${r.id}/edit`} className="admin-table__primary">{r.title}</Link>
                  <div className="admin-muted admin-muted--sm">/{r.slug}</div>
                </td>
                <td><span className="admin-pill admin-pill--ghost">{r.format}</span></td>
                <td><span className={`admin-pill admin-pill--${r.status}`}>{r.status}</span></td>
                <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                <td><Link href={`/admin/resources/${r.id}/edit`} className="admin-link">Edit</Link></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">No resources match those filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
