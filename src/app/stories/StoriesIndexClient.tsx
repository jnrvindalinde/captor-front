"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Section, Container, Container2 } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";
import type { StoryView } from "@/lib/stories";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function StoriesIndexClient({ stories }: { stories: StoryView[] }) {
  return (
    <>
      <main className="stories-page">
        <SiteNav tone="light" />
        <header className="stories-hero">
          <Container className="stories-hero__inner">
            <motion.h1
              className="h1"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Real people,
              <br />
              <span className="serif">real outcomes</span>.
            </motion.h1>
            <motion.p
              className="stories-hero__subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Career pivots, funded scholarships, and offers in hand — a few of the
              students and professionals we&rsquo;ve walked alongside.
            </motion.p>
          </Container>
        </header>

        <Section tight id="all-stories">
          <Container2>
            {stories.length === 0 ? (
              <p className="admin-muted" style={{ textAlign: "center" }}>
                No stories published yet. Check back soon.
              </p>
            ) : (
              <motion.div
                className="stories-grid"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
              >
                {stories.map((story) => (
                  <motion.div
                    key={story.slug}
                    className="stories-grid__item"
                    variants={fadeUp}
                  >
                    <Link href={`/stories/${story.slug}`}>
                      <article className="story-card--masonry">
                        <div className="story-card--masonry__image">
                          <Image
                            src={story.image}
                            alt={story.name}
                            width={400}
                            height={400}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="story-card--masonry__content">
                          <p className="story-card--masonry__quote">{story.quote}</p>
                          {story.outcome && (
                            <span className="story-card__outcome">{story.outcome}</span>
                          )}
                          <div className="story-card__person">
                            <div className="story-card__person-meta">
                              <strong>{story.name}</strong>
                              {story.role && <span>{story.role}</span>}
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Container2>
        </Section>
      </main>
      <CmsInjectedSections slug="stories-before-footer" />
      <Footer />
    </>
  );
}
