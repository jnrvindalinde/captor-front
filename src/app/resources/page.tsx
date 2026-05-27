"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Section, Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import {
  resources,
  resourceTypeMeta,
  type Resource,
  type ResourceType,
} from "./_data";

type FilterValue = "all" | ResourceType;

const filterOrder: FilterValue[] = ["all", "guide", "pdf", "audio", "video"];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function ResourceTypeIcon({ type }: { type: ResourceType }) {
  switch (type) {
    case "audio":
      return (
        <div
          className="resource-card__type-icon resource-card__type-icon--audio"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <path d="M8.5 11c0-2.21 1.79-4 4-4s4 1.79 4 4" />
            <path d="M5.5 11c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" />
          </svg>
        </div>
      );
    case "video":
      return (
        <div
          className="resource-card__type-icon resource-card__type-icon--video"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="1.5" />
            <path d="M9 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
          </svg>
        </div>
      );
    case "pdf":
      return (
        <div
          className="resource-card__type-icon resource-card__type-icon--pdf"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        </div>
      );
    default:
      return (
        <div
          className="resource-card__type-icon resource-card__type-icon--guide"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        </div>
      );
  }
}

function ResourceCard({ r }: { r: Resource }) {
  return (
    <motion.article variants={fadeUp} className="resource-card resource-card--linked">
      <Link href={`/resources/${r.slug}`} className="resource-card__link" aria-label={r.title}>
        <div className="resource-card__hero">
          <Image
            src={r.hero}
            alt={r.title}
            width={400}
            height={224}
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="resource-card__hero-img"
          />
          <div className="resource-card__media">
            <ResourceTypeIcon type={r.type} />
            <span className="resource-card__type-label">{r.typeLabel}</span>
          </div>
        </div>
        <div className="resource-card__content">
          <h3>{r.title}</h3>
          <p>{r.excerpt}</p>
          <div className="resource-card__meta">
            <span>{r.meta}</span>
            <span className="resource-card__arrow" aria-hidden="true">→</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function ResourcesPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = { all: resources.length, guide: 0, pdf: 0, audio: 0, video: 0 };
    resources.forEach((r) => {
      c[r.type] += 1;
    });
    return c;
  }, []);

  const visible = useMemo(() => {
    const byType = filter === "all" ? resources : resources.filter((r) => r.type === filter);
    const q = query.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((r) =>
      [r.title, r.excerpt, r.meta, r.typeLabel].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [filter, query]);

  return (
    <div className="resources-page">
      <SiteNav tone="light" />
      <header className="resources-hero">
        <Container>
          <div className="resources-hero__inner">
            <motion.h1
              className="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Free resources for serious applicants.
            </motion.h1>
            <motion.p
              className="resources-hero__subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Guides, checklists, audio primers, and screen-by-screen video teardowns —
              built from the questions our applicants ask us most.
            </motion.p>
          </div>
        </Container>
      </header>

      <Section tight>
        <div className="resources-toolbar">
          <div className="resources-filters" role="tablist" aria-label="Filter resources">
            {filterOrder.map((key) => {
              const isActive = filter === key;
              const label =
                key === "all" ? "All" : resourceTypeMeta[key].pluralLabel;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  key={key}
                  className={`resources-filter${isActive ? " is-active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  <span>{label}</span>
                  <span className="resources-filter__count">{counts[key]}</span>
                </button>
              );
            })}
          </div>

          <label className="resources-search">
            <span className="resources-search__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources…"
              aria-label="Search resources"
            />
            {query && (
              <button
                type="button"
                className="resources-search__clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>
        </div>

        <motion.div
          className="grid-3 resources-grid"
          variants={stagger}
          initial="hidden"
          animate="show"
          key={filter}
        >
          {visible.map((r) => (
            <ResourceCard key={r.slug} r={r} />
          ))}
        </motion.div>

        {visible.length === 0 && (
          <p className="resources-empty">
            Nothing here yet for this filter — try another category.
          </p>
        )}
      </Section>

      <Footer />
    </div>
  );
}
