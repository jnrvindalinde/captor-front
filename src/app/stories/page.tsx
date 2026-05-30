import { fetchPublicStories, mapApiStoryToView, type ApiStory, type StoryView } from "@/lib/stories";
import { mockStories } from "@/app/admin/_mock";
import StoriesIndexClient from "./StoriesIndexClient";

export const metadata = {
  title: "Stories",
  description:
    "Real outcomes from real applicants — the offers, the funding, the post-arrival stretch.",
  openGraph: {
    title: "Stories · Career 360 Consult",
    description:
      "Real outcomes from real applicants — the offers, the funding, the post-arrival stretch.",
  },
};
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

export default async function StoriesPage() {
  const api = await fetchPublicStories({ perPage: 50 });
  let stories: StoryView[];
  if (api && api.length > 0) {
    stories = api.map((s, i) => mapApiStoryToView(s, i));
  } else {
    stories = mockStories
      .filter((s) => s.status === "published")
      .map((s, i) => mapApiStoryToView(mockToApi(s), i));
  }
  return <StoriesIndexClient stories={stories} />;
}
