import { notFound } from "next/navigation";
import {
  fetchPublicStories,
  fetchPublicStory,
  mapApiStoryToView,
  type ApiStory,
} from "@/lib/stories";
import { mockStories } from "@/app/admin/_mock";
import StoryDetailClient from "./StoryDetailClient";

export const dynamic = "force-dynamic";

function mockToApi(s: (typeof mockStories)[number]): ApiStory {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    quote: s.quote ?? null,
    body: s.body,
    person_name: s.person_name,
    person_role: s.person_role,
    outcome: s.outcome,
    outcome_label: s.outcome_label ?? null,
    categories: s.categories ?? [],
    cover_image: s.cover_image,
    gallery: s.gallery ?? [],
    status: s.status,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    author: null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const api = await fetchPublicStory(slug);
  const story =
    api ?? (mockStories.find((s) => s.slug === slug) ? mockToApi(mockStories.find((s) => s.slug === slug)!) : null);
  if (!story) return { title: "Story not found" };
  const description = story.summary ?? story.quote ?? undefined;
  const image = story.cover_image ?? undefined;
  return {
    title: `${story.person_name} — ${story.outcome}`,
    description,
    openGraph: {
      type: "article" as const,
      title: `${story.person_name} — ${story.outcome}`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${story.person_name} — ${story.outcome}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let api: ApiStory | null = await fetchPublicStory(slug);
  let usedMock = false;
  if (!api) {
    const m = mockStories.find((s) => s.slug === slug && s.status === "published");
    if (!m) notFound();
    api = mockToApi(m);
    usedMock = true;
  }

  const all = usedMock
    ? mockStories.filter((s) => s.status === "published").map(mockToApi)
    : ((await fetchPublicStories({ perPage: 50 })) ?? [mockToApi(mockStories[0])]);

  const idx = Math.max(0, all.findIndex((s) => s.slug === slug));
  const story = mapApiStoryToView(api, idx);
  const nextApi = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const nextStory = nextApi ? { slug: nextApi.slug, name: nextApi.person_name } : null;

  return <StoryDetailClient story={story} nextStory={nextStory} />;
}
