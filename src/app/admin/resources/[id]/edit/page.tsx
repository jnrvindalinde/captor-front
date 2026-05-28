import Link from "next/link";
import { notFound } from "next/navigation";
import { mockResources } from "../../../_mock";
import { ResourceForm } from "../../_form";

export const metadata = { title: "Edit resource · Captor admin" };

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = mockResources.find((r) => r.id === Number(id));
  if (!resource) notFound();

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/resources" className="admin-link">← Back to resources</Link>
          <h1 className="h2">{resource.title}</h1>
          <p className="admin-muted admin-muted--sm">/{resource.slug} · {resource.format}</p>
        </div>
        <span className={`admin-pill admin-pill--${resource.status}`}>{resource.status}</span>
      </header>
      <ResourceForm resource={resource} />
    </div>
  );
}
