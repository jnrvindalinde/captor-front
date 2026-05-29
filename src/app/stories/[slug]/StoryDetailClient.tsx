"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Section, Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { ArrowLink } from "@/components/ui/Button";
import type { StoryView } from "@/lib/stories";

export default function StoryDetailClient({
  story,
  nextStory,
}: {
  story: StoryView;
  nextStory: { slug: string; name: string } | null;
}) {
  return (
    <>
      <main className="story-detail-page">
        <SiteNav tone="light" />
        <header className="story-detail-hero">
          <Container className="story-detail-hero__inner">
            <motion.div
              className="story-detail-hero__avatar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={story.image}
                alt={story.name}
                width={160}
                height={160}
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="h1" style={{ marginBottom: "8px", color: "var(--color-navy)" }}>
                {story.name}
              </h1>
              {story.role && (
                <p className="lede" style={{ color: "var(--color-ink-muted)" }}>
                  {story.role}
                </p>
              )}
              {story.categories.length > 0 && (
                <div className="story-detail-tags">
                  {story.categories.map((c) => (
                    <span key={c} className="story-detail-tag">{c}</span>
                  ))}
                </div>
              )}
            </motion.div>
          </Container>
        </header>

        <Section id="story-detail">
          <Container>
            <div className="story-detail-content">
              {story.quote && (
                <motion.div
                  className="story-detail-quote-block"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="story-detail-quote">{story.quote}</p>
                  {story.outcome && (
                    <span className="story-detail-outcome">{story.outcome}</span>
                  )}
                </motion.div>
              )}

              <motion.div
                className="story-detail-body"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {story.bodyHtml ? (
                  <div
                    className="story-detail-rich"
                    dangerouslySetInnerHTML={{ __html: story.bodyHtml }}
                  />
                ) : (
                  story.bodyParagraphs.map((paragraph, i) => (
                    <p key={i} className="story-detail-paragraph">
                      {paragraph}
                    </p>
                  ))
                )}
              </motion.div>

              {story.gallery.length > 0 && (
                <motion.div
                  className="story-detail-gallery"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {story.gallery.map((src, i) => {
                    const aspects = [
                      { w: 800, h: 533 },
                      { w: 800, h: 1067 },
                      { w: 800, h: 800 },
                    ];
                    const { w, h } = aspects[i % aspects.length];
                    return (
                      <div key={i} className="story-detail-gallery__item">
                        <Image
                          src={src}
                          alt={`${story.name} — gallery ${i + 1}`}
                          width={w}
                          height={h}
                          loading="lazy"
                        />
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {nextStory && (
                <motion.div
                  className="story-detail-nav"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/stories/${nextStory.slug}`} className="story-detail-nav-link">
                    <div className="story-detail-nav-content">
                      <span className="story-detail-nav-label">Next story</span>
                      <strong>{nextStory.name}</strong>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                </motion.div>
              )}

              <div className="story-detail-back">
                <ArrowLink href="/stories">Back to all stories</ArrowLink>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
