import Link from "next/link";
import type { Metadata } from "next";
import { fetchAdminMenus } from "@/lib/cms/menus";

export const metadata: Metadata = { title: "Navigation — CMS" };
export const dynamic = "force-dynamic";

export default async function CmsMenusIndex() {
  let menus: Awaited<ReturnType<typeof fetchAdminMenus>> = [];
  let banner: string | null = null;
  try {
    menus = await fetchAdminMenus();
  } catch (err) {
    banner = `Backend not reachable — ${err instanceof Error ? err.message : "unknown error"}.`;
  }

  return (
    <div className="cms-pages">
      {banner ? <div className="admin-gated">{banner}</div> : null}
      <header className="cms-pages__head">
        <div>
          <h1>Navigation menus</h1>
          <p className="admin-muted">Header and footer link lists. Adding or reordering items publishes immediately.</p>
        </div>
      </header>

      {menus.length === 0 ? (
        <p className="admin-muted">No menus defined. Run the CMS seeder to create the defaults.</p>
      ) : (
        <ul className="cms-collections__list">
          {menus.map((m) => (
            <li key={m.slug}>
              <Link href={`/admin/cms/menus/${m.slug}`} className="cms-collections__row">
                <div>
                  <strong>{m.name}</strong>
                  <span className="admin-muted"> {m.slug}</span>
                  {m.description ? <p>{m.description}</p> : null}
                </div>
                <span className="admin-pill">edit</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
