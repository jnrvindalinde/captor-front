"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { Section, Container } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink, ArrowLink } from "@/components/ui/Button";
import { Button } from "@/components/ui/Button";
import { OrgInquiryModal } from "@/components/forms/OrgInquiryModal";
import { Card, CardMediaThumb, CardMediaBody, IconTile } from "@/components/ui/Card";
import { Marquee } from "@/components/ui/Marquee";
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
const reasons = [
  {
    Icon: ShieldIcon,
    title: "Application-Based Advisory",
    copy: "We don't take walk-ins. Every consultation begins with a structured intake so your time with our advisor is focused, prepared, and outcome-driven.",
  },
  {
    Icon: CompassIcon,
    title: "Career & Education Specialists",
    copy: "Twelve years guiding Ghanaian students into top universities, scholarships, and global careers. You get senior insight, not generic web advice.",
  },
  {
    Icon: SparkIcon,
    title: "End-to-End Support",
    copy: "From shortlist to admission, scholarship application to visa interview — one consultancy walks the full path with you.",
  },
];

const services = [
  {
    image: "/imports/18702.jpg",
    title: "University Admissions",
    copy: "Shortlist building, application strategy, personal statement coaching, and decision support for undergraduate and postgraduate study.",
  },
  {
    image: "/imports/scholarship.jpg",
    title: "Scholarship Strategy",
    copy: "Funding fit analysis, essay review, and interview preparation for Chevening, Mastercard Foundation, Commonwealth, and Fulbright pathways.",
  },
  {
    image: "/imports/working-from-home-ergonomic-workstation.jpg",
    title: "Career Transition",
    copy: "Repositioning, CV strategy, and interview readiness for professionals moving across industries, geographies, or seniority levels.",
  },
];

const steps = [
  {
    n: "01",
    title: "Submit Your Application",
    copy: "Tell us about your goals, background, and the decision you're trying to make. Six minutes, structured and private.",
  },
  {
    n: "02",
    title: "We Review and Qualify",
    copy: "Our team reviews your context within 48 hours and confirms whether a consultation is the right next step.",
  },
  {
    n: "03",
    title: "Meet Your Advisor",
    copy: "If approved, you receive a calendar invite and a Google Meet link for your one-on-one advisory session.",
  },
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

const stories = [
  {
    slug: "akosua-b",
    initials: "AB",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&auto=format&fit=crop&q=80",
    quote:
      "I came in unsure between two career paths and walked out with a one-year plan that finally felt like mine. The advisory was practical, kind, and never generic.",
    name: "Akosua B.",
    role: "Mid-career professional · Accra",
    outcome: "Career repositioned",
  },
  {
    slug: "kwadwo-m",
    initials: "KM",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&q=80",
    quote:
      "They helped me shape an SOP that actually sounded like me, then walked me through every step of my Mastercard Foundation application until the offer came in.",
    name: "Kwadwo M.",
    role: "MSc Public Health · Edinburgh, 2025",
    outcome: "Fully funded — Mastercard",
  },
  {
    slug: "nana-a",
    initials: "NA",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&q=80",
    quote:
      "Career 360 reviewed my CV, prepped me for three interviews, and connected me with mentors in my field. I had two offers within six weeks.",
    name: "Nana A.",
    role: "Software Engineer · Remote, EU",
    outcome: "Two offers in six weeks",
  },
  {
    slug: "efua-o",
    initials: "EO",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&auto=format&fit=crop&q=80",
    quote:
      "I had three rejections before I came in. We rebuilt my application from scratch, reframed my story, and the next round produced two acceptances.",
    name: "Efua O.",
    role: "MA International Relations · Sciences Po",
    outcome: "Admitted with funding",
  },
  {
    slug: "jojo-k",
    initials: "JK",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&auto=format&fit=crop&q=80",
    quote:
      "The intake form felt rigorous before the call — and it was. By the time we met, my advisor already knew exactly what to challenge me on.",
    name: "Jojo K.",
    role: "MBA candidate · Toronto",
    outcome: "Two MBA offers",
  },
  {
    slug: "adwoa-y",
    initials: "AY",
    image: "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=100&h=100&auto=format&fit=crop&q=80",
    quote:
      "What I valued most was the honesty. They told me which schools were a stretch and which were a fit. That clarity saved me a year.",
    name: "Adwoa Y.",
    role: "BSc Computer Science · TU Munich",
    outcome: "Undergrad admission, DAAD funded",
  },
];

const placements = [
  {
    school: "University of Edinburgh",
    short: "Edinburgh",
    monogram: "Ed",
    country: "United Kingdom",
    logo: "https://www.google.com/s2/favicons?domain=ed.ac.uk&sz=128",
  },
  {
    school: "University of Toronto",
    short: "Toronto",
    monogram: "UofT",
    country: "Canada",
    logo: "https://www.google.com/s2/favicons?domain=utoronto.ca&sz=128",
  },
  {
    school: "TU Munich",
    short: "TU Munich",
    monogram: "TUM",
    country: "Germany",
    logo: "https://www.google.com/s2/favicons?domain=tum.de&sz=128",
  },
  {
    school: "University of Cape Town",
    short: "Cape Town",
    monogram: "UCT",
    country: "South Africa",
    logo: "https://www.google.com/s2/favicons?domain=uct.ac.za&sz=128",
  },
  {
    school: "KAIST",
    short: "KAIST",
    monogram: "KAIST",
    country: "South Korea",
    logo: "https://www.google.com/s2/favicons?domain=kaist.ac.kr&sz=128",
  },
  {
    school: "University of Melbourne",
    short: "Melbourne",
    monogram: "UoM",
    country: "Australia",
    logo: "https://www.google.com/s2/favicons?domain=unimelb.edu.au&sz=128",
  },
  {
    school: "Sciences Po",
    short: "Sciences Po",
    monogram: "SP",
    country: "France",
    logo: "https://www.google.com/s2/favicons?domain=sciencespo.fr&sz=128",
  },
  {
    school: "New York University",
    short: "NYU",
    monogram: "NYU",
    country: "United States",
    logo: "https://www.google.com/s2/favicons?domain=nyu.edu&sz=128",
  },
];

type ResourceType = "guide" | "audio" | "video" | "pdf";

/* --- Latest blog post (swap this object when a new post goes live) --- */
const latestPost = {
  title: "Five mistakes Ghanaian applicants make on Chevening essays — and how to fix them",
  excerpt:
    "Most rejections come from the same source: applicants write what they think the panel wants to hear instead of what only they can say. We looked at 40 essays across four cohorts and found five patterns that kept showing up in shortlisted applications — and five that kept showing up in rejections.",
  image:
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=75",
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
                <p className="story-card__quote">{s.quote}</p>
                <span className="story-card__outcome">{s.outcome}</span>
                <div className="story-card__person">
                  <div className="story-card__avatar" aria-hidden="true">
                    {s.image ? (
                      <img src={s.image} alt={s.name} />
                    ) : (
                      s.initials
                    )}
                  </div>
                  <div className="story-card__person-meta">
                    <strong>{s.name}</strong>
                    <span>{s.role}</span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="stories-controls">
        <div className="stories-dots" role="tablist" aria-label="Story pages">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Page ${i + 1} of ${totalPages}`}
              aria-current={page === i ? "true" : "false"}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
        <div className="stories-arrows">
          <button
            type="button"
            aria-label="Previous stories"
            onClick={() => go(-1)}
            disabled={page === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next stories"
            onClick={() => go(1)}
            disabled={page === totalPages - 1}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================== PLACEMENT ITEM (logo + fallback monogram) ========================== */
function PlacementItem({ p }: { p: typeof placements[number] }) {
  const [failed, setFailed] = useState(false);
  return (
    <motion.div className="placement-item" variants={fadeUp}>
      <div className="placement-item__logo">
        {failed ? (
          <span className="placement-item__monogram">{p.monogram}</span>
        ) : (
          <img
            src={p.logo}
            alt={`${p.school} logo`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <span className="placement-item__name">{p.short}</span>
      <span className="placement-item__country">{p.country}</span>
    </motion.div>
  );
}

/* ========================== PAGE ========================== */
export default function Home() {
  const reduce = useReducedMotion();
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  return (
    <main>
      {/* HERO ============================================================ */}
      <header className="hero">
        <SiteNav tone="dark" />
        <motion.div
          className="hero__rays"
          aria-hidden="true"
          animate={
            reduce
              ? { opacity: 0.7 }
              : { opacity: [0.55, 0.8, 0.55], rotate: [0, 4, 0] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% -10%" }}
        />
        <motion.div
          className="hero__glow"
          aria-hidden="true"
          animate={
            reduce
              ? { opacity: 0.6 }
              : { opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <Container>
          <motion.div
            className="hero__inner"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.h1 className="hero__title" variants={fadeUp}>
              Your <span className="serif">Future</span> deserves
              <br />
              a <span className="serif">real</span> plan.
            </motion.h1>
            <motion.p className="hero__lede" variants={fadeUp}>
              Career 360 Consult is a career and education consultancy for
              students and professionals serious about their next move —
              connecting applicants, advisors, and institutions inside one
              cohesive advisory environment.
            </motion.p>

            <motion.div variants={fadeUp}>
              <ButtonLink href="/apply" variant="primary" size="lg" withArrow>
                Start your application
              </ButtonLink>
            </motion.div>

            <motion.ul
              className="hero__trust"
              aria-label="Why apply with us"
              variants={stagger}
            >
              {[
                { I: BadgeCheck, t: "Senior advisors only" },
                { I: BadgeCard, t: "No upfront payment" },
                { I: BadgeFree, t: "Free initial review" },
              ].map(({ I, t }) => (
                <motion.li key={t} variants={fadeUp}>
                  <I />
                  <span>{t}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </Container>
      </header>

      {/* MARQUEE ========================================================= */}
      <Marquee items={partners} />

      {/* REASONS ========================================================= */}
      <Section id="about">
        <SectionHeader
          kicker="Why Career 360"
          title={
            <>
              Built on <span className="serif">qualified</span> conversations.
            </>
          }
          lede="We replaced instant booking with a quiet application process. The people we meet with arrive prepared, and so do we."
          align="split"
        />

        <motion.div
          className="grid-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {reasons.map(({ Icon, title, copy }) => (
            <Card
              key={title}
              interactive
              variants={fadeUp}
              whileHover={reduce ? {} : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <IconTile>
                <Icon />
              </IconTile>
              <h3 className="h3" style={{ marginBottom: "10px" }}>
                {title}
              </h3>
              <p className="lede" style={{ fontSize: "0.94rem", marginBottom: "20px" }}>
                {copy}
              </p>
              <ArrowLink href="#services">Read more</ArrowLink>
            </Card>
          ))}
        </motion.div>
      </Section>

      {/* HOW IT WORKS ==================================================== */}
      <Section id="howitworks">
        <SectionHeader
          kicker="— How It Works"
          title={
            <>
              Three steps from <span className="serif">enquiry</span> to confirmed session.
            </>
          }
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
                  <h3>{s.title}</h3>
                  <p>{s.copy}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </Section>

      {/* SERVICES ======================================================== */}
      <Section id="services">
        <SectionHeader
          kicker="— Most Requested"
          title={
            <>
              Where we do our <span className="serif">best</span> work.
            </>
          }
          lede="Pick the area closest to your goal. Every engagement starts the same way — a short application, a real review, then a real session."
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
              key={s.title}
              variant="media"
              interactive
              variants={fadeUp}
              whileHover={reduce ? {} : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <CardMediaThumb src={s.image} />
              <CardMediaBody>
                <h3 className="h3" style={{ marginBottom: "10px" }}>
                  {s.title}
                </h3>
                <p className="lede" style={{ fontSize: "0.94rem", marginBottom: "20px" }}>
                  {s.copy}
                </p>
                <ArrowLink href="/apply">Apply for this service</ArrowLink>
              </CardMediaBody>
            </Card>
          ))}
        </motion.div>

        {/* CORPORATE STRIP — small, secondary CTA */}
        <motion.div
          className="corp-strip"
          style={{ marginTop: "var(--space-7)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="corp-strip__copy">
            <h3>
              Building a team? We work with{" "}
              <span className="serif">organizations</span> too.
            </h3>
            <p>
              Onboarding programs, internal mobility, leadership transitions. Same
              application-first process, scoped to your organization.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            withArrow
            onClick={() => setOrgModalOpen(true)}
          >
            Talk to us
          </Button>
        </motion.div>
      </Section>

      {/* STORY HIGHLIGHTS ================================================ */}
      <Section id="stories">
        <SectionHeader
          kicker="— Story Highlights"
          title={
            <>
              Real <span className="serif">people</span>,
              <br />
              real outcomes.
            </>
          }
          lede="A small selection of clients we've worked with recently. Names shortened for privacy; outcomes confirmed by the applicants themselves."
          align="split"
        />

        <StoriesCarousel />
      </Section>

      {/* PLACEMENTS ====================================================== */}
      <Section id="placements">
        <SectionHeader
          kicker="— Where They Landed"
          title={
            <>
              Universities our clients now <span className="serif">call home</span>.
            </>
          }
          lede="Twelve years of admissions and scholarship work, across eight countries and counting."
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
              <span>Applicants advised</span>
            </div>
            <div>
              <strong>$1.8M</strong>
              <span>Scholarship funding secured</span>
            </div>
            <div>
              <strong>8</strong>
              <span>Countries</span>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* RESOURCES ======================================================= */}
      <Section id="resources">
        <SectionHeader
          kicker="— Free Resources"
          title={
            <>
              Tools, guides,
              <br />
              and short <span className="serif">primers</span>.
            </>
          }
          // lede="A small library of free reading, listening, and downloads. Built from real questions our applicants ask us most often."
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
                <ArrowLink href={`/resources/${r.slug}`}>Open</ArrowLink>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="resources-more">
          <ButtonLink href="/resources" variant="secondary" withArrow>
            See all resources
          </ButtonLink>
        </div>
      </Section>

      {/* LATEST BLOG POST =============================================== */}
      <Section id="blog">
        <SectionHeader
          kicker="— From the Blog"
          title={
            <>
              Latest from our <span className="serif">writing desk</span>.
            </>
          }
          lede="We write about the questions our applicants ask most. No SEO filler — only things that change how you apply."
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
            <img
              src={latestPost.image}
              alt=""
              loading="lazy"
            />
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
              {latestPost.tags.map((t) => (
                <span key={t} className="blog-latest__tag">{t}</span>
              ))}
            </div>

            <div className="blog-latest__cta">
              <ArrowLink href={latestPost.href}>Read the post</ArrowLink>
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
            animate={
              reduce
                ? { opacity: 0.7 }
                : { opacity: [0.55, 0.85, 0.55], rotate: [0, 6, 0] }
            }
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
              — Ready when you are
            </motion.span>
            <motion.h2 className="h2" variants={fadeUp} style={{ color: "#fff", marginTop: "14px" }}>
              Begin with an <span className="serif">application</span>.
              <br />
              We&apos;ll take it from there.
            </motion.h2>
            <motion.p className="lede lede--light" variants={fadeUp}>
              Most applicants hear back from us within 48 hours. There is no
              obligation, and there is no charge to apply.
            </motion.p>
            <motion.div variants={fadeUp}>
              <ButtonLink href="/apply" variant="primary" size="lg" withArrow>
                Start your application
              </ButtonLink>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* FOOTER ========================================================== */}
      <Footer />

      <OrgInquiryModal
        open={orgModalOpen}
        onClose={() => setOrgModalOpen(false)}
      />
    </main>
  );
}
