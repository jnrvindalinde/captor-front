import Link from "next/link";
import { fetchAdminCollections } from "@/lib/cms/collectionsAdmin";
import type { CollectionSummary } from "@/lib/cms/collections";

export const metadata = { title: "Collections · Captor admin" };

async function load(): Promise<{ rows: CollectionSummary[]; live: boolean; error: string | null }> {
  try {
    const res = await fetchAdminCollections();
    return { rows: res.data, live: true, error: null };
  } catch (e) {
    return { rows: [], live: false, error: e instanceof Error ? e.message : "Backend unreachable." };
  }
}

export default async function CollectionsIndexPage() {
  const { rows, live, error } = await load();

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <span className="kicker">CMS</span>
          <h1 className="h2">Collections</h1>
          <p className="admin-muted">
            Reusable lists that appear in marketing sections — partners, countries, badges, and more.
            Edits push to the public site within one revalidate cycle.
          </p>
        </div>
      </header>

      {!live && (
        <p className="admin-gated" role="status">
          Backend unavailable — {error}.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="admin-muted">
          {live
            ? "No collections seeded yet. Run "
            : "No collections to show. Once the backend is reachable, run "}
          <code>php artisan db:seed --class=CmsSeeder</code>.
        </p>
      ) : (
        <ul className="cms-collections__list">
          {rows.map((c) => (
            <li key={c.slug}>
              <Link href={`/admin/cms/collections/${c.slug}`} className="cms-collections__row">
                <div>
                  <strong>{c.name}</strong>
                  <span className="admin-muted">{c.slug}</span>
                  {c.description && <p className="admin-muted">{c.description}</p>}
                </div>
                <span className="admin-pill">{c.items_count ?? 0} item{(c.items_count ?? 0) === 1 ? "" : "s"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
