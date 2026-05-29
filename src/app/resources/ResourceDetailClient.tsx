"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Section, Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import type { Resource, ResourceType } from "./_data";

const typePillCopy: Record<ResourceType, string> = {
  guide: "Read the guide",
  pdf: "Download the PDF",
  audio: "Listen now",
  video: "Watch the teardown",
};

export default function ResourceDetailClient({
  resource,
  prev,
  next,
}: {
  resource: Resource;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
  return (
    <div className="resource-detail-page">
      <SiteNav tone="light" />
      <Container>
        <header className="resource-detail-hero">
          <div className="resource-detail-hero__bg">
            <Image
              src={resource.hero}
              alt={resource.title}
              width={1400}
              height={700}
              priority
              sizes="(max-width: 900px) 100vw, 1400px"
              className="resource-detail-hero__bg-img"
            />
            <div className="resource-detail-hero__overlay" />
          </div>
          <div className="resource-detail-hero__inner">
            <motion.div
              className="resource-detail-hero__meta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="resource-detail-hero__type">{resource.typeLabel}</span>
              <span className="resource-detail-hero__dot" aria-hidden="true">·</span>
              <span>{resource.meta}</span>
              <span className="resource-detail-hero__dot" aria-hidden="true">·</span>
              <span>{resource.date}</span>
            </motion.div>

            <motion.h1
              className="h1"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              {resource.title}
            </motion.h1>

            <motion.p
              className="resource-detail-hero__excerpt"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {resource.excerpt}
            </motion.p>

            <motion.div
              className="resource-detail-hero__author"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="resource-detail-hero__author-label">By</span>
              <strong>{resource.author.name}</strong>
              {resource.author.role && <span>· {resource.author.role}</span>}
            </motion.div>
          </div>
        </header>
      </Container>

      <Section tight>
        {resource.video && (
          <div className="resource-detail-media resource-detail-media--video">
            <iframe
              src={resource.video.src}
              title={resource.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {resource.audio && (
          <div className="resource-detail-media resource-detail-media--audio">
            <AudioPlayer
              src={resource.audio.src}
              title={resource.title}
              downloadUrl={resource.download?.url ?? resource.audio.src}
              downloadName={resource.download?.fileName}
            />
          </div>
        )}

        <article className="resource-detail-body">
          {resource.sections.map((section, sIdx) => (
            <motion.section
              key={`${sIdx}-${section.heading}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="resource-detail-section"
            >
              {section.heading && <h2>{section.heading}</h2>}
              {section.blocks.map((block, i) => {
                if (block.type === "paragraph") {
                  return <p key={i}>{block.content}</p>;
                } else if (block.type === "bulletList") {
                  return (
                    <ul key={i} className="resource-detail-list resource-detail-list--bullets">
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                } else if (block.type === "numberedList") {
                  return (
                    <ol key={i} className="resource-detail-list resource-detail-list--numbered">
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ol>
                  );
                } else if (block.type === "indented") {
                  return <p key={i} className="resource-detail-indented">{block.content}</p>;
                } else if ((block as { type: string }).type === "html") {
                  const html = (block as unknown as { html: string }).html;
                  return (
                    <div
                      key={i}
                      className="blog-detail-rte"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  );
                }
                return null;
              })}
            </motion.section>
          ))}
        </article>

        {resource.download && (
          <aside className="resource-detail-download">
            <div>
              <span className="resource-detail-download__kicker">{typePillCopy[resource.type]}</span>
              <strong>{resource.download.fileName}</strong>
              <span className="resource-detail-download__size">
                {resource.download.sizeLabel}
              </span>
            </div>
            <a
              href={resource.download.url}
              download
              className="resource-detail-download-btn"
              aria-label={`Download ${resource.download.fileName}`}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
          </aside>
        )}

        {resource.tags.length > 0 && (
          <aside className="resource-detail-tags">
            <ul>
              {resource.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
        )}

        <nav className="resource-detail-nav" aria-label="More resources">
          {prev ? (
            <Link href={`/resources/${prev.slug}`} className="resource-detail-nav-btn resource-detail-nav-btn--prev" title={prev.title}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Previous</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/resources/${next.slug}`} className="resource-detail-nav-btn resource-detail-nav-btn--next" title={next.title}>
              <span>Next</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : <span />}
        </nav>

        <div className="resource-detail-back">
          <ButtonLink href="/resources" variant="secondary" size="md">
            ← Back to all resources
          </ButtonLink>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
