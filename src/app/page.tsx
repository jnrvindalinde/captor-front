import { fetchPublicPosts, mapApiPostToBlogPost } from "@/lib/posts";
import {
  fetchPublicResources,
  mapApiResourceToResource,
} from "@/lib/resources";
import { fetchPublicStories, type ApiStory } from "@/lib/stories";
import { resources as mockResources } from "@/app/resources/_data";
import {
  HomeClient,
  type HomeLatestPost,
  type HomeStory,
} from "./_HomeClient";

export const dynamic = "force-dynamic";

const DEFAULT_HERO = "/imports/18702.jpg";

function mapApiStoryToHomeStory(s: ApiStory): HomeStory {
  const quote = s.quote?.trim()
    ? s.quote
    : (s.summary ?? "").trim() || s.title;
  return {
    slug: s.slug,
    name: s.person_name,
    role: s.person_role ?? "",
    quote,
    outcome: (s.outcome_label?.trim() ? s.outcome_label : s.outcome) ?? "",
    image: s.cover_image ?? "",
  };
}

export default async function HomePage() {
  const [apiPosts, apiResources, apiStories] = await Promise.all([
    fetchPublicPosts({ perPage: 1 }),
    fetchPublicResources({ perPage: 3 }),
    fetchPublicStories({ perPage: 6 }),
  ]);

  const latestApi = apiPosts && apiPosts.length > 0 ? apiPosts[0] : null;
  const latestPost: HomeLatestPost = latestApi
    ? (() => {
        const view = mapApiPostToBlogPost(latestApi);
        return {
          slug: view.slug,
          title: view.title,
          excerpt: view.excerpt,
          image: view.hero || DEFAULT_HERO,
          date: view.date,
          readTime: view.readTime,
          category: view.tags[0] ?? "Article",
          tags: view.tags,
        };
      })()
    : {
        slug: "chevening-essay-mistakes",
        title:
          "Five mistakes Ghanaian applicants make on Chevening essays — and how to fix them",
        excerpt:
          "Most rejections come from the same source: applicants write what they think the panel wants to hear instead of what only they can say.",
        image:
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=75",
        date: "May 6, 2026",
        readTime: "9 min read",
        category: "Scholarships",
        tags: ["Chevening", "SOP", "Essay writing"],
      };

  const previewResources =
    apiResources && apiResources.length > 0
      ? apiResources.map(mapApiResourceToResource)
      : mockResources.slice(0, 3);

  const liveStories =
    apiStories && apiStories.length > 0
      ? apiStories.map(mapApiStoryToHomeStory)
      : null;

  return (
    <HomeClient
      liveStories={liveStories}
      latestPost={latestPost}
      previewResources={previewResources}
    />
  );
}
