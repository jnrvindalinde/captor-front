import Link from "next/link";
import { mockPosts, type Post } from "../_mock";

export const metadata = { title: "Blog · Captor admin" };

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").toLowerCase().trim();
  const status = sp.status ?? "";

  const rows = mockPosts.filter((p) => {
    if (status && p.status !== status) return false;
    if (q && !(p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))) return false;
    return true;
  });

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <span className="kicker">Content</span>
          <h1 className="h2">Blog posts</h1>
          <p className="admin-muted">Articles published to the public blog.</p>
        </div>
        <Link href="/admin/blog/new" className="admin-btn admin-btn--solid">
          New post
        </Link>
      </header>

      <form className="admin-filters" method="get">
        <input type="search" name="q" defaultValue={sp.q ?? ""} placeholder="Search title or slug…" />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filter</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Published</th>
              <th>Updated</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p: Post) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/blog/${p.id}/edit`} className="admin-table__primary">
                    {p.title}
                  </Link>
                  <div className="admin-muted admin-muted--sm">/{p.slug}</div>
                </td>
                <td><span className={`admin-pill admin-pill--${p.status}`}>{p.status}</span></td>
                <td>{p.author.name}</td>
                <td>{p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}</td>
                <td>{new Date(p.updated_at).toLocaleDateString()}</td>
                <td>
                  <Link href={`/admin/blog/${p.id}/edit`} className="admin-link">Edit</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">No posts match those filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
