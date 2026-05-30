import { notFound } from "next/navigation";
import {
  fetchPublicResource,
  fetchPublicResources,
  mapApiResourceToResource,
} from "@/lib/resources";
import {
  getResource,
  getAllSlugs,
  resources as mockResources,
  type Resource,
} from "../_data";
import ResourceDetailClient from "../ResourceDetailClient";

export const dynamic = "force-dynamic";

async function loadAll(): Promise<{ list: Resource[]; live: boolean }> {
  const api = await fetchPublicResources({ perPage: 100 });
  if (api) return { list: api.map(mapApiResourceToResource), live: true };
  return { list: mockResources, live: false };
}

async function loadOne(slug: string): Promise<Resource | null> {
  const api = await fetchPublicResource(slug);
  if (api) return mapApiResourceToResource(api);
  return getResource(slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await loadOne(slug);
  if (!resource) return { title: "Resource not found" };
  const description = resource.excerpt || undefined;
  const image = resource.hero || undefined;
  return {
    title: resource.title,
    description,
    openGraph: {
      type: "article" as const,
      title: resource.title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: resource.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await loadOne(slug);
  if (!resource) notFound();

  const { list } = await loadAll();
  const idx = list.findIndex((r) => r.slug === slug);
  const prev = idx > 0 ? { slug: list[idx - 1].slug, title: list[idx - 1].title } : null;
  const next =
    idx >= 0 && idx < list.length - 1
      ? { slug: list[idx + 1].slug, title: list[idx + 1].title }
      : null;

  return <ResourceDetailClient resource={resource} prev={prev} next={next} />;
}

export async function generateStaticParams() {
  const api = await fetchPublicResources({ perPage: 100 });
  if (api && api.length > 0) {
    return api.map((r) => ({ slug: r.slug }));
  }
  return getAllSlugs().map((slug) => ({ slug }));
}
