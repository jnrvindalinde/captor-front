import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { logoutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";
import { AdminTopBar } from "./_TopBar";
import { AdminSideNav } from "./_SideNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Link href="/admin" aria-label="Captor admin home">
            <img
              src="/imports/c360 logo main dark.png"
              alt="Career360 Consult"
              className="admin-sidebar__logo"
            />
          </Link>
        </div>

        <nav className="admin-nav-wrap">
          <Suspense fallback={null}>
            <AdminSideNav />
          </Suspense>
        </nav>

        <div className="admin-sidebar__foot">
          <div className="admin-sidebar__user">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="admin-link-btn">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">
        <AdminTopBar user={{ name: user.name, email: user.email }} />
        <div className="admin-main__inner">{children}</div>
      </main>
    </div>
  );
}
