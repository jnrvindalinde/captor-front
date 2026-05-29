import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAdminCollection } from "@/lib/cms/collectionsAdmin";
import type { CollectionDetail } from "@/lib/cms/collections";
import { CollectionItemsEditor } from "./_ItemsEditor";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return { title: `${slug} · Collections · Captor admin` };
}

async function load(slug: string): Promise<{ collection: CollectionDetail | null; error: string | null }> {
  try {
    const res = await fetchAdminCollection(slug);
    return { collection: res.data, error: null };
  } catch (e) {
    const err = e as { status?: number; message?: string };
    if (err.status === 404) return { collection: null, error: null };
    return { collection: null, error: err.message ?? "Backend unreachable." };
  }
}

export default async function CollectionEditPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { collection, error } = await load(slug);

  if (!collection && !error) notFound();

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <span className="kicker">
            <Link href="/admin/cms/collections">Collections</Link> · {slug}
          </span>
          <h1 className="h2">{collection?.name ?? slug}</h1>
          {collection?.description && <p className="admin-muted">{collection.description}</p>}
        </div>
      </header>

      {error && (
        <p className="admin-gated" role="status">
          Backend unavailable — {error}.
        </p>
      )}

      {collection && (
        <CollectionItemsEditor
          slug={collection.slug}
          schema={collection.schema}
          initialItems={collection.items}
        />
      )}
    </div>
  );
}
