import { fetchPublicPosts, mapApiPostToBlogPost } from "@/lib/posts";
import { blogs as mockBlogs } from "./_data";
import { BlogIndexClient } from "./BlogIndexClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const apiPosts = await fetchPublicPosts({ perPage: 24 });
  const live = apiPosts !== null;
  const blogs = apiPosts && apiPosts.length > 0
    ? apiPosts.map(mapApiPostToBlogPost)
    : mockBlogs;

  return <BlogIndexClient blogs={blogs} live={live} />;
}
