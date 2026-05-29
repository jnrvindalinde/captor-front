import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { mockResources, type ResourceItem } from "../../../_mock";
import { ResourceForm } from "../../_form";

export const metadata = { title: "Edit resource · Captor admin" };

async function loadResource(id: number): Promise<{ resource: ResourceItem | null; live: boolean }> {
  try {
    const r = await apiFetch<{ resource: ResourceItem }>(`/api/admin/resources/${id}`);
    return { resource: r.resource, live: true };
  } catch (e) {
    const err = e as { status?: number };
    if (err?.status === 404) return { resource: null, live: true };
    return { resource: mockResources.find((r) => r.id === id) ?? null, live: false };
  }
}

export default async function EditResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const { resource, live } = await loadResource(Number(id));
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
      {sp.saved && <p className="admin-gated admin-gated--ok" role="status">Saved.</p>}
      <ResourceForm resource={resource} live={live} />
    </div>
  );
}
