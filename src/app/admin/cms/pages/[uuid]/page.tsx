import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchAdminPage, fetchAdminPageAudits, fetchSectionRegistry } from "@/lib/cms/pages";
import { PageEditor } from "./_PageEditor";

export const metadata: Metadata = { title: "Edit page — CMS" };
export const dynamic = "force-dynamic";

export default async function CmsPageEditorPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  let page: Awaited<ReturnType<typeof fetchAdminPage>>;
  let registry: Awaited<ReturnType<typeof fetchSectionRegistry>> = {};
  let audits: Awaited<ReturnType<typeof fetchAdminPageAudits>> = [];
  try {
    [page, registry, audits] = await Promise.all([
      fetchAdminPage(uuid),
      fetchSectionRegistry(),
      fetchAdminPageAudits(uuid).catch(() => []),
    ]);
  } catch (err) {
    const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : 0;
    if (status === 404) notFound();
    throw err;
  }

  const previewBase = process.env.NEXT_PUBLIC_SITE_URL || "";
  const previewHref =
    page.preview_token
      ? `${previewBase}/p/${page.slug}?preview=${page.preview_token}`
      : null;

  return (
    <div className="cms-pages">
      <p>
        <Link href="/admin/cms/pages" className="admin-link">← All pages</Link>
      </p>

      {previewHref ? (
        <div className="cms-preview-link">
          <strong>Preview link:</strong>{" "}
          <a href={previewHref} target="_blank" rel="noreferrer" className="admin-link">
            {previewHref}
          </a>
          <p className="cms-preview-link__help">
            Anyone with this URL can view the current draft of this page. Re-publish or rotate the page UUID to invalidate.
          </p>
        </div>
      ) : null}

      <PageEditor page={page} registry={registry} />

      {audits.length ? (
        <section className="cms-audits">
          <h3>Activity</h3>
          <ol className="cms-audits__list">
            {audits.map((a) => (
              <li key={a.id} className="cms-audits__item">
                <span className="cms-audits__action">{a.action}</span>
                <span className="cms-audits__user">{a.user?.name ?? a.user?.email ?? "system"}</span>
                <span className="cms-audits__time">{new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
