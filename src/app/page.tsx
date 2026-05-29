"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Section, Container } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink, ArrowLink, Button } from "@/components/ui/Button";
import { OrgInquiryModal } from "@/components/forms/OrgInquiryModal";
import { Card, CardMediaThumb, CardMediaBody, IconTile } from "@/components/ui/Card";
import { CmsPartnersMarquee } from "@/components/sections/CmsPartnersMarquee";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";
import {
  BadgeCheck,
  BadgeCard,
  BadgeFree,
  ShieldIcon,
  CompassIcon,
  SparkIcon,
} from "@/components/ui/Icons";

/* ========================== DATA ========================== */
import { resources } from "@/app/resources/_data";

// Structural data — text comes from `home.reasons.{key}.{title|copy}`.
const reasons = [
  { Icon: ShieldIcon, key: "advisory" as const },
  { Icon: CompassIcon, key: "specialists" as const },
  { Icon: SparkIcon, key: "endToEnd" as const },
];

const services = [
  { image: "/imports/18702.jpg", key: "admissions" as const },
  { image: "/imports/scholarship.jpg", key: "scholarship" as const },
  { image: "/imports/working-from-home-ergonomic-workstation.jpg", key: "career" as const },
];

const steps = [
  { n: "01", key: "submit" as const },
  { n: "02", key: "review" as const },
  { n: "03", key: "meet" as const },
];

const trustBadges = [
  { I: BadgeCheck, key: "senior" as const },
  { I: BadgeCard, key: "noUpfront" as const },
  { I: BadgeFree, key: "freeReview" as const },
];

const partners = [
  "Chevening",
  "Mastercard Foundation",
  "Commonwealth",
  "Fulbright",
  "DAAD",
  "British Council",
  "Erasmus+",
];

type StoryEntry = {
  slug: string;
  initials: string;
  image: string;
  name: string;
};

const stories: StoryEntry[] = [
  { slug: "akosua-b", initials: "AB", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&auto=format&fit=crop&q=80", name: "Akosua B." },
  { slug: "kwadwo-m", initials: "KM", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&q=80", name: "Kwadwo M." },
  { slug: "nana-a",   initials: "NA", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&q=80", name: "Nana A." },
  { slug: "efua-o",   initials: "EO", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&auto=format&fit=crop&q=80", name: "Efua O." },
  { slug: "jojo-k",   initials: "JK", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&auto=format&fit=crop&q=80", name: "Jojo K." },
  { slug: "adwoa-y",  initials: "AY", image: "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=100&h=100&auto=format&fit=crop&q=80", name: "Adwoa Y." },
];

type CountryKey = "uk" | "canada" | "germany" | "southAfrica" | "southKorea" | "australia" | "france" | "usa";

type PlacementEntry = {
  school: string;
  short: string;
  monogram: string;
  countryKey: CountryKey;
  logo: string;
};

const placements: PlacementEntry[] = [
  { school: "University of Edinburgh",  short: "Edinburgh",   monogram: "Ed",    countryKey: "uk",          logo: "https://www.google.com/s2/favicons?domain=ed.ac.uk&sz=128" },
  { school: "University of Toronto",    short: "Toronto",     monogram: "UofT",  countryKey: "canada",      logo: "https://www.google.com/s2/favicons?domain=utoronto.ca&sz=128" },
  { school: "TU Munich",                short: "TU Munich",   monogram: "TUM",   countryKey: "germany",     logo: "https://www.google.com/s2/favicons?domain=tum.de&sz=128" },
  { school: "University of Cape Town",  short: "Cape Town",   monogram: "UCT",   countryKey: "southAfrica", logo: "https://www.google.com/s2/favicons?domain=uct.ac.za&sz=128" },
  { school: "KAIST",                    short: "KAIST",       monogram: "KAIST", countryKey: "southKorea",  logo: "https://www.google.com/s2/favicons?domain=kaist.ac.kr&sz=128" },
  { school: "University of Melbourne",  short: "Melbourne",   monogram: "UoM",   countryKey: "australia",   logo: "https://www.google.com/s2/favicons?domain=unimelb.edu.au&sz=128" },
  { school: "Sciences Po",              short: "Sciences Po", monogram: "SP",    countryKey: "france",      logo: "https://www.google.com/s2/favicons?domain=sciencespo.fr&sz=128" },
  { school: "New York University",      short: "NYU",         monogram: "NYU",   countryKey: "usa",         logo: "https://www.google.com/s2/favicons?domain=nyu.edu&sz=128" },
];

type ResourceType = "guide" | "audio" | "video" | "pdf";

/* Latest blog post — long-form content stays in author language per plan. */
const latestPost = {
  title: "Five mistakes Ghanaian applicants make on Chevening essays — and how to fix them",
  excerpt:
    "Most rejections come from the same source: applicants write what they think the panel wants to hear instead of what only they can say. We looked at 40 essays across four cohorts and found five patterns that kept showing up in shortlisted applications — and five that kept showing up in rejections.",
  image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=75",
  date: "May 6, 2026",
  readTime: "9 min read",
  category: "Scholarships",
  tags: ["Chevening", "SOP", "Essay writing"],
  href: "/blog/chevening-essay-mistakes",
};

/* ========================== MOTION ========================== */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ========================== RESOURCE TYPE ICONS ========================== */
function ResourceTypeIcon({ type }: { type: ResourceType }) {
  switch (type) {
    case "audio":
      return (
        <div className="resource-card__type-icon resource-card__type-icon--audio" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0118 0M5 19v-7a7 7 0 0114 0v7" />
            <rect x="3" y="14" width="4" height="6" rx="1.4" fill="currentColor" stroke="none" />
            <rect x="17" y="14" width="4" height="6" rx="1.4" fill="currentColor" stroke="none" />
          </svg>
        </div>
      );
    case "video":
      return (
        <div className="resource-card__type-icon resource-card__type-icon--video" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="5.5" width="14" height="13" rx="2" />
            <path d="M16.5 10.5L22 7v10l-5.5-3.5z" fill="currentColor" stroke="none" />
          </svg>
        </div>
      );
    case "pdf":
      return (
        <div className="resource-card__type-icon resource-card__type-icon--pdf" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
            <text x="7.5" y="17.5" fontSize="6" fontWeight="800" fill="currentColor" stroke="none" fontFamily="system-ui, sans-serif">PDF</text>
          </svg>
        </div>
      );
    default:
      return (
        <div className="resource-card__type-icon resource-card__type-icon--guide" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h11a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" />
            <path d="M4 4v12a4 4 0 014-4h11" />
          </svg>
        </div>
      );
  }
}

/* ========================== STORIES CAROUSEL ========================== */
function StoriesCarousel() {
  const reduce = useReducedMotion();
  const t = useTranslations("home.stories");
  const tc = useTranslations("home.storiesCarousel");
  const pageSize = 3;
  const totalPages = Math.ceil(stories.length / pageSize);
  const [page, setPage] = useState(0);
  const start = page * pageSize;
  const visible = stories.slice(start, start + pageSize);

  const go = (delta: number) => {
    setPage((p) => Math.min(Math.max(p + delta, 0), totalPages - 1));
  };

  return (
    <div className="stories-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="stories-track"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {visible.map((s) => (
            <Link key={s.name} href={`/stories/${s.slug}`}>
              <motion.article
                className="story-card"
                whileHover={reduce ? {} : { y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <span className="story-card__quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <p className="story-card__quote">{t(`${s.slug}.quote`)}</p>
                <span className="story-card__outcome">{t(`${s.slug}.outcome`)}</span>
                <div className="story-card__person">
                  <div className="story-card__avatar" aria-hidden="true">
                    {s.image ? <img src={s.image} alt={s.name} /> : s.initials}
                  </div>
                  <div className="story-card__person-meta">
                    <strong>{s.name}</strong>
                    <span>{t(`${s.slug}.role`)}</span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="stories-controls">
        <div className="stories-dots" role="tablist" aria-label={tc("pagesAriaLabel")}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={tc("pageLabel", { n: i + 1, total: totalPages })}
              aria-current={page === i ? "true" : "false"}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
        <div className="stories-arrows">
          <button type="button" aria-label={tc("prevLabel")} onClick={() => go(-1)} disabled={page === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" aria-label={tc("nextLabel")} onClick={() => go(1)} disabled={page === totalPages - 1}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================== PLACEMENT ITEM ========================== */
function PlacementItem({ p }: { p: PlacementEntry }) {
  const [failed, setFailed] = useState(false);
  const t = useTranslations("home.placementsSection");
  return (
    <motion.div className="placement-item" variants={fadeUp}>
      <div className="placement-item__logo">
        {failed ? (
          <span className="placement-item__monogram">{p.monogram}</span>
        ) : (
          <img
            src={p.logo}
            alt={t("logoAlt", { school: p.school })}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <span className="placement-item__name">{p.short}</span>
      <span className="placement-item__country">{t(`countries.${p.countryKey}`)}</span>
    </motion.div>
  );
}

/* ========================== PAGE ========================== */
export default function Home() {
  const reduce = useReducedMotion();
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  const em = (chunks: React.ReactNode) => <span className="serif">{chunks}</span>;
  const br = () => <br />;

  return (
    <main>
      {/* HERO ============================================================ */}
      <header className="hero">
        <SiteNav tone="dark" />
        <motion.div
          className="hero__rays"
          aria-hidden="true"
          animate={reduce ? { opacity: 0.7 } : { opacity: [0.55, 0.8, 0.55], rotate: [0, 4, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% -10%" }}
        />
        <motion.div
          className="hero__glow"
          aria-hidden="true"
          animate={reduce ? { opacity: 0.6 } : { opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <Container>
          <motion.div className="hero__inner" variants={stagger} initial="hidden" animate="show">
            <motion.h1 className="hero__title" variants={fadeUp}>
              {t.rich("hero.title", { em, br })}
            </motion.h1>
            <motion.p className="hero__lede" variants={fadeUp}>
              {t("hero.lede")}
            </motion.p>

            <motion.div variants={fadeUp}>
              <ButtonLink href="/apply" variant="primary" size="lg" withArrow>
                {t("hero.cta")}
              </ButtonLink>
            </motion.div>

            <motion.ul className="hero__trust" aria-label={t("hero.trustAriaLabel")} variants={stagger}>
              {trustBadges.map(({ I, key }) => (
                <motion.li key={key} variants={fadeUp}>
                  <I />
                  <span>{t(`hero.trust.${key}`)}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </Container>
      </header>

      {/* MARQUEE ========================================================= */}
      <CmsPartnersMarquee defaultItems={partners} />

      {/* CMS-injected sections (after hero) ============================== */}
      <CmsInjectedSections slug="home-after-hero" />

      {/* REASONS ========================================================= */}
      <Section id="about">
        <SectionHeader
          kicker={t("why.kicker")}
          title={t.rich("why.title", { em })}
          lede={t("why.lede")}
          align="split"
        />

        <motion.div
          className="grid-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {reasons.map(({ Icon, key }) => (
            <Card
              key={key}
              interactive
              variants={fadeUp}
              whileHover={reduce ? {} : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <IconTile>
                <Icon />
              </IconTile>
              <h3 className="h3" style={{ marginBottom: "10px" }}>
                {t(`reasons.${key}.title`)}
              </h3>
              <p className="lede" style={{ fontSize: "0.94rem", marginBottom: "20px" }}>
                {t(`reasons.${key}.copy`)}
              </p>
              <ArrowLink href="#services">{tCommon("readMore")}</ArrowLink>
            </Card>
          ))}
        </motion.div>
      </Section>

      {/* HOW IT WORKS ==================================================== */}
      <Section id="howitworks">
        <SectionHeader
          kicker={t("howItWorks.kicker")}
          title={t.rich("howItWorks.title", { em })}
          align="center"
        />

        <div className="grid-split">
          <motion.div
            className="how-figure"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="how-figure__blob" />
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80"
              alt=""
            />
          </motion.div>

          <motion.ol
            className="how-list"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((s) => (
              <motion.li key={s.n} variants={fadeUp}>
                <span className="how-list__num">{s.n}</span>
                <div>
                  <h3>{t(`steps.${s.key}.title`)}</h3>
                  <p>{t(`steps.${s.key}.copy`)}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </Section>

      {/* SERVICES ======================================================== */}
      <Section id="services">
        <SectionHeader
          kicker={t("services.kicker")}
          title={t.rich("services.title", { em })}
          lede={t("services.lede")}
          align="split"
        />

        <motion.div
          className="grid-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {services.map((s) => (
            <Card
              key={s.key}
              variant="media"
              interactive
              variants={fadeUp}
              whileHover={reduce ? {} : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <CardMediaThumb src={s.image} />
              <CardMediaBody>
                <h3 className="h3" style={{ marginBottom: "10px" }}>
                  {t(`services.items.${s.key}.title`)}
                </h3>
                <p className="lede" style={{ fontSize: "0.94rem", marginBottom: "20px" }}>
                  {t(`services.items.${s.key}.copy`)}
                </p>
                <ArrowLink href="/apply">{t("services.applyCta")}</ArrowLink>
              </CardMediaBody>
            </Card>
          ))}
        </motion.div>

        {/* CORPORATE STRIP */}
        <motion.div
          className="corp-strip"
          style={{ marginTop: "var(--space-7)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="corp-strip__copy">
            <h3>{t.rich("corp.title", { em })}</h3>
            <p>{t("corp.copy")}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            withArrow
            onClick={() => setOrgModalOpen(true)}
          >
            {t("corp.cta")}
          </Button>
        </motion.div>
      </Section>

      {/* STORY HIGHLIGHTS ================================================ */}
      <Section id="stories">
        <SectionHeader
          kicker={t("storiesSection.kicker")}
          title={t.rich("storiesSection.title", { em, br })}
          lede={t("storiesSection.lede")}
          align="split"
        />

        <StoriesCarousel />
      </Section>

      {/* PLACEMENTS ====================================================== */}
      <Section id="placements">
        <SectionHeader
          kicker={t("placementsSection.kicker")}
          title={t.rich("placementsSection.title", { em })}
          lede={t("placementsSection.lede")}
          align="center"
        />

        <motion.div
          className="placement-wall"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="placement-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {placements.map((p) => (
              <PlacementItem key={p.school} p={p} />
            ))}
          </motion.div>

          <div className="placement-stat">
            <div>
              <strong>240+</strong>
              <span>{t("placementsSection.stats.applicants")}</span>
            </div>
            <div>
              <strong>$1.8M</strong>
              <span>{t("placementsSection.stats.funding")}</span>
            </div>
            <div>
              <strong>8</strong>
              <span>{t("placementsSection.stats.countries")}</span>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* RESOURCES ======================================================= */}
      <Section id="resources">
        <SectionHeader
          kicker={t("resourcesSection.kicker")}
          title={t.rich("resourcesSection.title", { em, br })}
          align="split"
        />

        <motion.div
          className="grid-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {resources.slice(0, 3).map((r) => (
            <motion.article
              key={r.title}
              className="resource-card"
              variants={fadeUp}
              whileHover={reduce ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div className="resource-card__media">
                <ResourceTypeIcon type={r.type} />
                <span className="resource-card__type-label">{r.typeLabel}</span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.excerpt}</p>
              <div className="resource-card__meta">
                <span>{r.meta}</span>
                <ArrowLink href={`/resources/${r.slug}`}>{t("resourcesSection.open")}</ArrowLink>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="resources-more">
          <ButtonLink href="/resources" variant="secondary" withArrow>
            {t("resourcesSection.seeAll")}
          </ButtonLink>
        </div>
      </Section>

      {/* LATEST BLOG POST =============================================== */}
      <Section id="blog">
        <SectionHeader
          kicker={t("blogSection.kicker")}
          title={t.rich("blogSection.title", { em })}
          lede={t("blogSection.lede")}
          align="split"
        />

        <motion.article
          className="blog-latest"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="blog-latest__thumb">
            <img src={latestPost.image} alt="" loading="lazy" />
            <span className="blog-latest__badge">{latestPost.category}</span>
          </div>

          <div className="blog-latest__body">
            <div className="blog-latest__meta">
              <span>{latestPost.date}</span>
              <span className="blog-latest__meta-dot" aria-hidden="true" />
              <span>{latestPost.readTime}</span>
            </div>

            <h2 className="blog-latest__title">{latestPost.title}</h2>

            <p className="blog-latest__excerpt">{latestPost.excerpt}</p>

            <div className="blog-latest__tags">
              {latestPost.tags.map((tg) => (
                <span key={tg} className="blog-latest__tag">{tg}</span>
              ))}
            </div>

            <div className="blog-latest__cta">
              <ArrowLink href={latestPost.href}>{t("blogSection.readPost")}</ArrowLink>
            </div>
          </div>
        </motion.article>
      </Section>

      {/* APPLY CTA ======================================================= */}
      <Section id="apply" tight>
        <motion.div
          className="apply-card"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="hero__rays"
            aria-hidden="true"
            animate={reduce ? { opacity: 0.7 } : { opacity: [0.55, 0.85, 0.55], rotate: [0, 6, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "50% -10%" }}
          />
          <motion.div
            className="apply-card__inner"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.span className="kicker kicker--light" variants={fadeUp}>
              {t("applyCta.kicker")}
            </motion.span>
            <motion.h2 className="h2" variants={fadeUp} style={{ color: "#fff", marginTop: "14px" }}>
              {t.rich("applyCta.title", { em, br })}
            </motion.h2>
            <motion.p className="lede lede--light" variants={fadeUp}>
              {t("applyCta.lede")}
            </motion.p>
            <motion.div variants={fadeUp}>
              <ButtonLink href="/apply" variant="primary" size="lg" withArrow>
                {t("applyCta.cta")}
              </ButtonLink>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* CMS-injected sections (before footer) =========================== */}
      <CmsInjectedSections slug="home-before-footer" />

      {/* FOOTER ========================================================== */}
      <Footer />

      <OrgInquiryModal open={orgModalOpen} onClose={() => setOrgModalOpen(false)} />
    </main>
  );
}
