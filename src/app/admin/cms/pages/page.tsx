import Link from "next/link";
import type { Metadata } from "next";
import { fetchAdminPages } from "@/lib/cms/pages";
import { createPageAction } from "./_actions";

export const metadata: Metadata = { title: "Pages — CMS" };
export const dynamic = "force-dynamic";

export default async function CmsPagesIndex() {
  let pages: Awaited<ReturnType<typeof fetchAdminPages>> = [];
  let banner: string | null = null;

  try {
    pages = await fetchAdminPages();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Backend unavailable";
    banner = `Backend not reachable — ${message}. Showing empty state.`;
  }

  return (
    <div className="cms-pages">
      {banner ? <div className="admin-gated">{banner}</div> : null}

      <header className="cms-pages__head">
        <div>
          <h1>Pages</h1>
          <p className="admin-muted">Landing pages and marketing pages built from typed sections.</p>
        </div>
      </header>

      <section className="cms-pages__create">
        <h2>Create a new page</h2>
        <form action={createPageAction} className="cms-pages__create-form">
          <label className="admin-field">
            <span>Slug</span>
            <input name="slug" required pattern="[a-z0-9-]+" placeholder="black-friday-2026" />
            <small className="admin-muted">Lowercase, numbers, dashes. URL will be /p/{`{slug}`}.</small>
          </label>
          <label className="admin-field">
            <span>Title (English)</span>
            <input name="title_en" required placeholder="Black Friday 2026" />
          </label>
          <label className="admin-field">
            <span>Title (Français)</span>
            <input name="title_fr" placeholder="Black Friday 2026" />
          </label>
          <button type="submit" className="admin-btn admin-btn--primary">Create draft</button>
        </form>
      </section>

      <section>
        <h2>All pages</h2>
        {pages.length === 0 ? (
          <p className="admin-muted">No pages yet. Create one above.</p>
        ) : (
          <ul className="cms-pages__list">
            {pages.map((p) => (
              <li key={p.uuid}>
                <Link href={`/admin/cms/pages/${p.uuid}`} className="cms-pages__row">
                  <div>
                    <strong>{p.title.en || p.slug}</strong>
                    <span className="admin-muted"> /p/{p.slug}</span>
                  </div>
                  <span className={`admin-pill ${p.status === "draft" ? "admin-pill--warn" : ""}`}>
                    {p.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
