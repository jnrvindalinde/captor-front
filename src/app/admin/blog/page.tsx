import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { mockPosts, type Post } from "../_mock";

export const metadata = { title: "Blog · Captor admin" };

type PaginatedPosts = { data: Post[] };

async function loadPosts(qs: URLSearchParams): Promise<{
  rows: Post[];
  live: boolean;
}> {
  try {
    const res = await apiFetch<PaginatedPosts>(`/api/admin/posts?${qs.toString()}`);
    return { rows: res.data, live: true };
  } catch {
    return { rows: mockPosts, live: false };
  }
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";

  const qs = new URLSearchParams();
  qs.set("per_page", "100");
  if (q) qs.set("q", q);
  if (status) qs.set("status", status);

  const { rows: serverRows, live } = await loadPosts(qs);

  // When mock-fallback, apply filters client-side to keep behaviour consistent.
  const rows = live
    ? serverRows
    : serverRows.filter((p) => {
        if (status && p.status !== status) return false;
        if (q && !(p.title.toLowerCase().includes(q.toLowerCase()) || p.slug.toLowerCase().includes(q.toLowerCase()))) return false;
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

      {!live && (
        <p className="admin-gated" role="status">
          Backend unavailable — showing seed/mock posts. Changes won&apos;t persist.
        </p>
      )}
      {sp.deleted && (
        <p className="admin-gated admin-gated--ok" role="status">
          Post deleted.
        </p>
      )}

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
