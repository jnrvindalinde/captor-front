"use client";
/* eslint-disable @next/next/no-img-element */

import { motion, type Variants } from "framer-motion";
import { Section, Container } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink, ArrowLink } from "@/components/ui/Button";

const offerings = [
  {
    badge: "Admissions",
    title: "University Admissions",
    image: "/imports/18702.jpg",
    excerpt:
      "From a long-list of dreams to a short-list of real, fit-tested options. We help you build an application that reads like you on your sharpest day — not a template, not a brag sheet. Our advisors have walked applicants through every step of the funnel for over a decade, across UK, US, EU, Canadian, Australian, and South African admissions cycles. We tell you when a school is a stretch, when it's a fit, and when it's a quiet mistake — early enough for the answer to matter.",
    points: [
      "Shortlist building tied to fit, funding, and admit probability across geographies",
      "Personal statement & SOP coaching across multiple drafts, with line-level feedback",
      "Application timeline, references, and decision support all the way to offer day",
      "Post-offer guidance: deferral strategy, scholarship negotiation, visa preparation",
    ],
    href: "/apply",
    cta: "Apply for admissions advisory",
  },
  {
    badge: "Funding",
    title: "Scholarship Strategy",
    image: "/imports/scholarship.jpg",
    excerpt:
      "Scholarships reward applicants who can connect their story to a funder's mission — clearly, credibly, and without performance. We walk you through fit analysis, essays, and interviews for the awards you actually have a real chance at, not the ones that simply sound prestigious. Every funder has a thesis about the kind of leader they want to back; the work is helping yours come into focus on the page and in the room.",
    points: [
      "Funder-fit analysis before you write a single essay — Chevening, Mastercard, Commonwealth, Fulbright, DAAD",
      "Essay coaching that protects your voice while sharpening your argument",
      "Interview preparation with structured mock sessions and recorded feedback",
      "Application logistics: references, endorsements, and submission strategy",
    ],
    href: "/apply",
    cta: "Apply for scholarship strategy",
  },
  {
    badge: "Career",
    title: "Career Transition",
    image: "/imports/working-from-home-ergonomic-workstation.jpg",
    excerpt:
      "Whether you're crossing industries, geographies, or seniority levels, the question is the same: how do you tell the story so the next hire feels obvious? We help you reposition without losing the thread of who you are — the people who hire well don't reward repackaging, they reward clarity. From CV and LinkedIn to negotiation framing, we focus on the parts of the move that actually compound.",
    points: [
      "CV & LinkedIn strategy framed for your next-level role, not your last one",
      "Interview readiness across technical, behavioural, and case rounds",
      "Negotiation framing for offers, relocations, equity, and counter-offers",
      "Six-month positioning plan so the next move sets up the one after",
    ],
    href: "/apply",
    cta: "Apply for career advisory",
  },
];

const heroFadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.05 + i * 0.07,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const processSteps = [
  {
    n: "01",
    title: "Apply",
    meta: "6 min · Private",
    copy: "A structured intake on your goals, background, and the decision you're navigating — read by a senior advisor.",
  },
  {
    n: "02",
    title: "Review & Qualify",
    meta: "Within 48 hours",
    copy: "Within 48 hours we confirm whether a consultation fits and which advisor on the team is right for you.",
  },
  {
    n: "03",
    title: "Advisory Session",
    meta: "60-min · 1-on-1",
    copy: "A focused one-on-one with your advisor — we surface options you missed and leave you with a clear next step.",
  },
  {
    n: "04",
    title: "Ongoing Support",
    meta: "Through to outcome",
    copy: "If you continue, we walk the full path with you — drafts, deadlines, interviews — until you have an outcome.",
  },
];

const faqs = [
  {
    q: "How much does a consultation cost, and what do I get?",
    a: "Pricing is shared after the 48-hour review so you receive a quote tied to the actual scope of your situation — not a generic rate card. Every engagement includes a senior advisor, a 60-minute private session, and a written summary of agreed next steps.",
  },
  {
    q: "How is this different from a free chat or a generic consultancy?",
    a: "Two things. First, every consultation is taken by a senior advisor — not a junior associate, not a chatbot. Second, we don't sell volume. The application gate exists so we only work with people we can genuinely move forward.",
  },
  {
    q: "What happens after the 48-hour review if I'm not accepted?",
    a: "You'll get a short, honest note explaining why we're not the right fit — and where applicable, a pointer to a resource or peer firm that is. No upsell, no waitlist tricks. Roughly 4 in 10 applications don't move past this stage.",
  },
  {
    q: "Do you guarantee admissions, scholarships, or job offers?",
    a: "No, and you should be cautious of any advisor who does. What we guarantee is honest senior judgment, a clear strategy, and the same level of preparation we'd want for our own family. The decisions still belong to the schools, funders, and employers.",
  },
  {
    q: "How are advisors matched, and can I choose mine?",
    a: "After your intake we match based on country focus, industry, and the specific decision you're navigating. You'll know your advisor's name and background before the session is confirmed — and you can decline and request a different match, no questions asked.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <main className="svc-page">
      <SiteNav tone="light" />
      <header className="svc-hero">
        <Container className="svc-hero__inner">
          <motion.span
            className="kicker"
            variants={heroFadeUp}
            initial="hidden"
            animate="show"
            custom={0}
          >
            Our Services
          </motion.span>

          <motion.h1
            variants={heroFadeUp}
            initial="hidden"
            animate="show"
            custom={1}
          >
            Advisory that turns <span className="serif">ambition</span>
            <br />
            into a clear next step.
          </motion.h1>

          <motion.p
            className="svc-hero__lede"
            variants={heroFadeUp}
            initial="hidden"
            animate="show"
            custom={2}
          >
            Application-based consultations across admissions, scholarships, and
            career strategy — designed for students and professionals who want
            senior guidance, not generic advice.
          </motion.p>

          <motion.div
            className="svc-hero__cta"
            variants={heroFadeUp}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <ButtonLink href="/apply" variant="inverse" size="md" withArrow>
              Start your application
            </ButtonLink>
            <ButtonLink href="#offerings" variant="outline" size="md">
              Browse offerings
            </ButtonLink>
          </motion.div>
        </Container>
      </header>


      {/* WHAT WE OFFER =================================================== */}
      <Section id="offerings" className="svc-offerings">
        <SectionHeader
          kicker="— What We Offer"
          title={
            <>
              Three advisory tracks,
              <br />
              <span className="serif">one standard</span>.
            </>
          }
          lede="Application-based, senior-led consultations across admissions, scholarships, and career strategy — built for clients who want clarity over template advice."
          align="center"
        />

        <div className="svc-detail-list">
          {offerings.map((o, i) => (
            <motion.article
              key={o.title}
              className={`svc-detail${i % 2 === 1 ? " svc-detail--reverse" : ""}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="svc-detail__thumb">
                <img src={o.image} alt={o.title} loading="lazy" />
              </div>

              <div className="svc-detail__body">
                <h2 className="svc-detail__title">{o.title}</h2>
                <p className="svc-detail__excerpt">{o.excerpt}</p>

                <ul className="svc-detail__points">
                  {o.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>

                <div className="svc-detail__cta">
                  <ArrowLink href={o.href}>{o.cta}</ArrowLink>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* PROCESS ========================================================= */}
      <Section id="process" className="svc-process">
        <SectionHeader
          kicker="— Our Process"
          title={
            <>
              How an engagement
              <br />
              <span className="serif">actually runs</span>.
            </>
          }
          lede="Application-based, structured, and senior from the first reply. No walk-ins, no generic templates."
          align="center"
        />

        <motion.ol
          className="svc-steps-row"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {processSteps.map((s) => (
            <motion.li key={s.n} className="svc-step" variants={fadeUp}>
              <div className="svc-step__rail" aria-hidden="true">
                <span className="svc-step__node">{s.n}</span>
                <span className="svc-step__line" />
              </div>
              <div className="svc-step__body">
                <span className="svc-step__meta">{s.meta}</span>
                <h3 className="svc-step__title">{s.title}</h3>
                <p className="svc-step__copy">{s.copy}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </Section>

      {/* QUALIFICATION =================================================== */}
      <Section id="qualification" className="svc-qualification">
        <SectionHeader
          kicker="— Qualification"
          title={
            <>
              This isn't
              <br />
              <span className="serif">for everyone</span>.
            </>
          }
          lede="We turn down more applications than we accept. Senior advisory takes time — we'd rather be straight about fit than burn yours."
          align="center"
        />

        <div className="svc-qual-grid">
          <motion.article
            className="svc-qual svc-qual--fit"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="svc-qual__badge">A fit</span>
            <h3 className="svc-qual__title">
              You'll get the most out of this if you...
            </h3>
            <ul className="svc-qual__list">
              <li>Are 6–24 months from a real decision point — admissions cycle, funding deadline, or career move.</li>
              <li>Have done your own homework and want senior advisory on what to do with it.</li>
              <li>Will commit to drafts, deadlines, and honest feedback — even when it's uncomfortable.</li>
              <li>Value clarity and direction over reassurance.</li>
              <li>Are willing to invest in getting the decision right the first time.</li>
            </ul>
          </motion.article>

          <motion.article
            className="svc-qual svc-qual--miss"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="svc-qual__badge">Not a fit</span>
            <h3 className="svc-qual__title">
              You'll be better served elsewhere if you...
            </h3>
            <ul className="svc-qual__list">
              <li>Are looking for free advice or quick chatbot-style answers.</li>
              <li>Need someone to do the application work for you, no questions asked.</li>
              <li>Want to be told only what you want to hear.</li>
              <li>Aren't ready to commit to a structured process.</li>
              <li>Are treating this as a last-minute backup with days to a deadline.</li>
            </ul>
          </motion.article>
        </div>
      </Section>

      {/* FAQ ============================================================= */}
      <Section id="faq" className="svc-faq">
        <SectionHeader
          kicker="— FAQ"
          title={
            <>
              Questions worth
              <br />
              <span className="serif">answering plainly</span>.
            </>
          }
          lede="The things people actually want to know before they apply — answered straight."
          align="center"
        />

        <div className="svc-faq__list">
          {faqs.map((f, i) => (
            <details key={f.q} className="svc-faq__item" {...(i === 0 ? { open: true } : {})}>
              <summary className="svc-faq__q">
                <span className="svc-faq__q-num">Q{String(i + 1).padStart(2, "0")}</span>
                <span className="svc-faq__q-text">{f.q}</span>
                <span className="svc-faq__icon" aria-hidden="true">
                  <span className="svc-faq__icon-bar" />
                  <span className="svc-faq__icon-bar svc-faq__icon-bar--v" />
                </span>
              </summary>
              <div className="svc-faq__a">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </Section>

      {/* FINAL CTA ======================================================= */}
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
            animate={{ opacity: [0.55, 0.85, 0.55], rotate: [0, 6, 0] }}
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
              Apply in three minutes.
              <br />
              <span className="serif">We&apos;ll take it from there.</span>
            </motion.h2>
            <motion.p className="lede lede--light" variants={fadeUp}>
              We read every application, decide within 48 hours whether we&apos;re the right fit,
              and let you know either way. No fee, no obligation.
            </motion.p>
            <motion.div variants={fadeUp}>
              <ButtonLink href="#" variant="primary" size="lg" withArrow>
                Start your application
              </ButtonLink>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>
    </main>
    <Footer />
    </>
  );
}
