"use client";

import { useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { Section, Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";

type PlacementCategory = "university" | "scholarship" | "employer";

type Placement = {
  name: string;
  short: string;
  monogram: string;
  country: string;
  category: PlacementCategory;
  logo: string;
};

const placements: Placement[] = [
  // Universities
  {
    name: "University of Edinburgh",
    short: "Edinburgh",
    monogram: "Ed",
    country: "United Kingdom",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=ed.ac.uk&sz=128",
  },
  {
    name: "University of Toronto",
    short: "Toronto",
    monogram: "UofT",
    country: "Canada",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=utoronto.ca&sz=128",
  },
  {
    name: "TU Munich",
    short: "TU Munich",
    monogram: "TUM",
    country: "Germany",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=tum.de&sz=128",
  },
  {
    name: "University of Cape Town",
    short: "Cape Town",
    monogram: "UCT",
    country: "South Africa",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=uct.ac.za&sz=128",
  },
  {
    name: "Sciences Po",
    short: "Sciences Po",
    monogram: "SP",
    country: "France",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=sciencespo.fr&sz=128",
  },
  {
    name: "New York University",
    short: "NYU",
    monogram: "NYU",
    country: "United States",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=nyu.edu&sz=128",
  },
  {
    name: "University of Melbourne",
    short: "Melbourne",
    monogram: "UoM",
    country: "Australia",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=unimelb.edu.au&sz=128",
  },
  {
    name: "KAIST",
    short: "KAIST",
    monogram: "KAIST",
    country: "South Korea",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=kaist.ac.kr&sz=128",
  },
  {
    name: "Rotman School of Management",
    short: "Rotman",
    monogram: "RSM",
    country: "Canada",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=rotman.utoronto.ca&sz=128",
  },
  {
    name: "Schulich School of Business",
    short: "Schulich",
    monogram: "SSB",
    country: "Canada",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=schulich.yorku.ca&sz=128",
  },
  {
    name: "TU Berlin",
    short: "TU Berlin",
    monogram: "TUB",
    country: "Germany",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=tu.berlin&sz=128",
  },
  {
    name: "TU Darmstadt",
    short: "TU Darmstadt",
    monogram: "TUD",
    country: "Germany",
    category: "university",
    logo: "https://www.google.com/s2/favicons?domain=tu-darmstadt.de&sz=128",
  },

  // Scholarships
  {
    name: "Mastercard Foundation Scholars Program",
    short: "Mastercard Foundation",
    monogram: "MCF",
    country: "Global",
    category: "scholarship",
    logo: "https://www.google.com/s2/favicons?domain=mastercardfdn.org&sz=128",
  },
  {
    name: "DAAD Scholarship",
    short: "DAAD",
    monogram: "DAAD",
    country: "Germany",
    category: "scholarship",
    logo: "https://www.google.com/s2/favicons?domain=daad.de&sz=128",
  },
  {
    name: "Chevening Scholarship",
    short: "Chevening",
    monogram: "CHV",
    country: "United Kingdom",
    category: "scholarship",
    logo: "https://www.google.com/s2/favicons?domain=chevening.org&sz=128",
  },
  {
    name: "Commonwealth Scholarship",
    short: "Commonwealth",
    monogram: "CWS",
    country: "United Kingdom",
    category: "scholarship",
    logo: "https://www.google.com/s2/favicons?domain=cscuk.fcdo.gov.uk&sz=128",
  },
  {
    name: "Fulbright Program",
    short: "Fulbright",
    monogram: "FB",
    country: "United States",
    category: "scholarship",
    logo: "https://www.google.com/s2/favicons?domain=fulbrightprogram.org&sz=128",
  },
  {
    name: "Erasmus Mundus",
    short: "Erasmus Mundus",
    monogram: "EM",
    country: "European Union",
    category: "scholarship",
    logo: "https://www.google.com/s2/favicons?domain=erasmus-plus.ec.europa.eu&sz=128",
  },

  // Employers
  {
    name: "Google",
    short: "Google",
    monogram: "G",
    country: "Remote",
    category: "employer",
    logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
  },
  {
    name: "Stripe",
    short: "Stripe",
    monogram: "S",
    country: "Remote, EU",
    category: "employer",
    logo: "https://www.google.com/s2/favicons?domain=stripe.com&sz=128",
  },
  {
    name: "McKinsey & Company",
    short: "McKinsey",
    monogram: "McK",
    country: "Lagos / Accra",
    category: "employer",
    logo: "https://www.google.com/s2/favicons?domain=mckinsey.com&sz=128",
  },
  {
    name: "Flutterwave",
    short: "Flutterwave",
    monogram: "FW",
    country: "Pan-African",
    category: "employer",
    logo: "https://www.google.com/s2/favicons?domain=flutterwave.com&sz=128",
  },
  {
    name: "Unilever",
    short: "Unilever",
    monogram: "UL",
    country: "Global",
    category: "employer",
    logo: "https://www.google.com/s2/favicons?domain=unilever.com&sz=128",
  },
  {
    name: "GIZ",
    short: "GIZ",
    monogram: "GIZ",
    country: "Germany / Africa",
    category: "employer",
    logo: "https://www.google.com/s2/favicons?domain=giz.de&sz=128",
  },
];

const stats: { value: string; label: string }[] = [
  { value: "500+", label: "Admissions secured" },
  { value: "40+", label: "Countries placed in" },
  { value: "$5M+", label: "Scholarship funding won" },
  { value: "92%", label: "Acceptance rate among coached applicants" },
];

const categoryMeta: Record<
  PlacementCategory,
  { title: string; subtitle: string }
> = {
  university: {
    title: "Universities & programs",
    subtitle: "Schools that have admitted our clients across undergrad, master's, MBA, and PhD tracks.",
  },
  scholarship: {
    title: "Scholarships & funding",
    subtitle: "Funding bodies our clients have won — from fully funded master's to research fellowships.",
  },
  employer: {
    title: "Employers",
    subtitle: "Companies and organizations our career-track clients have joined.",
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

type FilterValue = "all" | PlacementCategory;

const filterOptions: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "university", label: "Universities" },
  { value: "scholarship", label: "Scholarships" },
  { value: "employer", label: "Employers" },
];

function PlacementCard({ p }: { p: Placement }) {
  const [failed, setFailed] = useState(!p.logo);
  return (
    <motion.div className="placement-item" variants={fadeUp}>
      <div className="placement-item__logo">
        {failed ? (
          <span className="placement-item__monogram">{p.monogram}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.logo}
            alt={`${p.name} logo`}
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

function CategoryBlock({
  category,
  items,
}: {
  category: PlacementCategory;
  items: Placement[];
}): ReactNode {
  if (items.length === 0) return null;
  const meta = categoryMeta[category];
  return (
    <div className="placements-category">
      <div className="placements-category__head">
        <h2 className="h2">{meta.title}</h2>
        <p className="placements-category__subtitle">{meta.subtitle}</p>
      </div>
      <motion.div
        className="placement-grid"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {items.map((p) => (
          <PlacementCard key={p.name} p={p} />
        ))}
      </motion.div>
    </div>
  );
}

export default function PlacementsPage() {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered =
    filter === "all" ? placements : placements.filter((p) => p.category === filter);

  const categoriesToShow: PlacementCategory[] =
    filter === "all" ? ["university", "scholarship", "employer"] : [filter];

  return (
    <>
      <main className="placements-page">
        <SiteNav tone="light" />
        <header className="placements-hero">
          <Container className="placements-hero__inner">
            <motion.h1
              className="h1"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Where our clients
              <br />
              <span className="serif">have landed</span>.
            </motion.h1>
            <motion.p
              className="placements-hero__subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              A snapshot of the universities, scholarship programs, and employers our
              clients have joined over the last decade.
            </motion.p>
          </Container>
        </header>

        {/* Stats strip */}
        <Section tight>
          <motion.div
            className="placements-stats"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {stats.map((s) => (
              <motion.div key={s.label} className="placements-stat" variants={fadeUp}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </Section>

        {/* Filters + grid */}
        <Section tight id="placements">
          <div className="placements-filters" role="tablist" aria-label="Filter placements">
            {filterOptions.map((opt) => {
              const count =
                opt.value === "all"
                  ? placements.length
                  : placements.filter((p) => p.category === opt.value).length;
              const isActive = filter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`placements-filter${isActive ? " is-active" : ""}`}
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                  <span className="placements-filter__count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="placements-results">
            {categoriesToShow.map((cat) => (
              <CategoryBlock
                key={cat}
                category={cat}
                items={filtered.filter((p) => p.category === cat)}
              />
            ))}
          </div>
        </Section>
      </main>
      <CmsInjectedSections slug="placements-before-footer" />
      <Footer />
    </>
  );
}
