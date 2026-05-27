import Link from "next/link";
import { Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { getBlog, getAllSlugs, blogs } from "../_data";
import { BlogDetailClient } from "./BlogDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = getBlog(slug);

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

  const currentIndex = blogs.findIndex((b) => b.slug === slug);
  const prev = currentIndex > 0 ? blogs[currentIndex - 1] : null;
  const next = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;

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
  return getAllSlugs().map((slug) => ({
    slug,
  }));
}
