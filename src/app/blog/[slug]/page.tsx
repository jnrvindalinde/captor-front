import Link from "next/link";
import { Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { fetchPublicPost, fetchPublicPosts, mapApiPostToBlogPost } from "@/lib/posts";
import { getBlog, getAllSlugs, blogs as mockBlogs, type BlogPost } from "../_data";
import { BlogDetailClient } from "./BlogDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const api = await fetchPublicPost(slug);
  const post = api ? mapApiPostToBlogPost(api) : getBlog(slug);
  if (!post) return { title: "Post not found" };
  const description = post.excerpt || undefined;
  const image = post.hero || undefined;
  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: post.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const apiPost = await fetchPublicPost(slug);
  let blog: BlogPost | undefined = apiPost ? mapApiPostToBlogPost(apiPost) : undefined;
  let prev: BlogPost | null = null;
  let next: BlogPost | null = null;

  if (blog) {
    const apiList = await fetchPublicPosts({ perPage: 100 });
    const list = (apiList ?? []).map(mapApiPostToBlogPost);
    const idx = list.findIndex((b) => b.slug === slug);
    if (idx >= 0) {
      prev = idx > 0 ? list[idx - 1] : null;
      next = idx < list.length - 1 ? list[idx + 1] : null;
    }
  } else {
    blog = getBlog(slug);
    if (blog) {
      const idx = mockBlogs.findIndex((b) => b.slug === slug);
      prev = idx > 0 ? mockBlogs[idx - 1] : null;
      next = idx < mockBlogs.length - 1 ? mockBlogs[idx + 1] : null;
    }
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <SiteNav tone="light" />
        <Container>
          <div className="blog-not-found">
            <span className="kicker">404 — Post not found</span>
            <h1 className="h1 blog-not-found__title">
              That post has <span className="serif">drifted</span>.
            </h1>
            <p className="blog-not-found__lede">
              We couldn&apos;t find a post at <code>/blog/{slug}</code>. It may have
              been renamed or removed. Head back to the index — there&apos;s plenty
              else worth reading.
            </p>
            <div className="blog-not-found__actions">
              <Link href="/blog" className="blog-not-found__primary">
                Back to all posts
              </Link>
              <Link href="/" className="blog-not-found__secondary">
                Home
              </Link>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <SiteNav tone="light" />

      <Container>
        <BlogDetailClient blog={blog} prev={prev} next={next} />
      </Container>

      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  const apiList = await fetchPublicPosts({ perPage: 100 });
  if (apiList && apiList.length > 0) {
    return apiList.map((p) => ({ slug: p.slug }));
  }
  return getAllSlugs().map((slug) => ({ slug }));
}
