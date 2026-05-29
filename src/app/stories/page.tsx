"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Section, Container, Container2 } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";

type StoryCategory = "School" | "Scholarship" | "Job" | "Career";

const stories: ReadonlyArray<{
  slug: string;
  initials: string;
  quote: string;
  name: string;
  role: string;
  outcome: string;
  color: string;
  image: string;
  categories: ReadonlyArray<StoryCategory>;
}> = [
  {
    slug: "akosua-b",
    initials: "AB",
    quote:
      "I came in unsure between two career paths and walked out with a one-year plan that finally felt like mine.",
    name: "Akosua B.",
    role: "Mid-career professional · Accra",
    outcome: "Career repositioned",
    color: "var(--color-sky)",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&auto=format&fit=crop&q=80",
    categories: ["Career"],
  },
  {
    slug: "kwadwo-m",
    initials: "KM",
    quote:
      "They helped me shape an SOP that actually sounded like me, then walked me through every step.",
    name: "Kwadwo M.",
    role: "MSc Public Health · Edinburgh, 2025",
    outcome: "Fully funded — Mastercard",
    color: "#72b4d6",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&auto=format&fit=crop&q=80",
    categories: ["School", "Scholarship"],
  },
  {
    slug: "nana-a",
    initials: "NA",
    quote:
      "Career 360 reviewed my CV, prepped me for interviews, and connected me with mentors in my field.",
    name: "Nana A.",
    role: "Software Engineer · Remote, EU",
    outcome: "Two offers in six weeks",
    color: "rgba(165, 206, 0, 0.8)",
    image: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=400&h=400&auto=format&fit=crop&q=80",
    categories: ["Job"],
  },
  {
    slug: "efua-o",
    initials: "EO",
    quote:
      "I had three rejections before I came in. We rebuilt my application from scratch and reframed my story.",
    name: "Efua O.",
    role: "MA International Relations · Sciences Po",
    outcome: "Admitted with funding",
    color: "var(--color-sky)",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&auto=format&fit=crop&q=80",
    categories: ["School", "Scholarship"],
  },
  {
    slug: "jojo-k",
    initials: "JK",
    quote:
      "The intake form felt rigorous before the call — and it was. By the time we met, my advisor knew exactly what to challenge.",
    name: "Jojo K.",
    role: "MBA candidate · Toronto",
    outcome: "Two MBA offers",
    color: "#72b4d6",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&auto=format&fit=crop&q=80",
    categories: ["School"],
  },
  {
    slug: "adwoa-y",
    initials: "AY",
    quote:
      "What I valued most was the honesty. They told me which schools were a stretch and which were a fit.",
    name: "Adwoa Y.",
    role: "BSc Computer Science · TU Munich",
    outcome: "Undergrad admission, DAAD funded",
    color: "rgba(165, 206, 0, 0.8)",
    image: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=400&h=400&auto=format&fit=crop&q=80",
    categories: ["School", "Scholarship"],
  },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function StoriesPage() {
  const filteredStories = stories;

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
            <motion.div
              className="stories-grid"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {filteredStories.map((story) => (
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
                        <span className="story-card__outcome">{story.outcome}</span>
                        <div className="story-card__person">
                          <div className="story-card__person-meta">
                            <strong>{story.name}</strong>
                            <span>{story.role}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </Container2>
        </Section>
      </main>
      <CmsInjectedSections slug="stories-before-footer" />
      <Footer />
    </>
  );
}
