import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { fetchPublicPage, fetchPreviewPage } from "@/lib/cms/pages";
import { PageRenderer } from "@/cms/sections/registry";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

type Params = { slug: string };
type Search = { preview?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPublicPage(slug);
  if (!page) return { title: "Not found" };
  const locale = (await getLocale()) as "en" | "fr";
  const title =
    page.seo.title[locale] ?? page.seo.title.en ?? page.title[locale] ?? page.title.en ?? "";
  const description =
    page.seo.description[locale] ?? page.seo.description.en ?? undefined;
  return { title, description };
}

export default async function CmsLandingPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const page = preview
    ? await fetchPreviewPage(slug, preview)
    : await fetchPublicPage(slug);
  if (!page) notFound();
  const locale = (await getLocale()) as "en" | "fr";

  return (
    <>
      {preview ? (
        <div className="cms-preview-banner" role="status">
          Preview mode &mdash; this page may be a draft. Token: <code>{preview.slice(0, 8)}&hellip;</code>
        </div>
      ) : null}
      <main className="cms-page">
        <SiteNav tone="light" />
        <PageRenderer sections={page.sections ?? []} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
