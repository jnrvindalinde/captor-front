"use client";
/* eslint-disable @next/next/no-img-element */

import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Section, Container } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";
import { ButtonLink, ArrowLink } from "@/components/ui/Button";

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

const offeringKeys = ["admissions", "scholarship", "career"] as const;
const offeringImages: Record<(typeof offeringKeys)[number], string> = {
  admissions: "/imports/18702.jpg",
  scholarship: "/imports/scholarship.jpg",
  career: "/imports/working-from-home-ergonomic-workstation.jpg",
};

const stepKeys = ["apply", "review", "session", "ongoing"] as const;
const stepNumbers: Record<(typeof stepKeys)[number], string> = {
  apply: "01",
  review: "02",
  session: "03",
  ongoing: "04",
};

const richSerif = {
  serif: (chunks: React.ReactNode) => <span className="serif">{chunks}</span>,
};

export default function ServicesPage() {
  const t = useTranslations("servicesPage");

  const offerings = offeringKeys.map((k) => ({
    key: k,
    image: offeringImages[k],
    badge: t(`items.${k}.badge`),
    title: t(`items.${k}.title`),
    excerpt: t(`items.${k}.excerpt`),
    points: t.raw(`items.${k}.points`) as string[],
    cta: t(`items.${k}.cta`),
  }));

  const steps = stepKeys.map((k) => ({
    key: k,
    n: stepNumbers[k],
    title: t(`process.steps.${k}.title`),
    meta: t(`process.steps.${k}.meta`),
    copy: t(`process.steps.${k}.copy`),
  }));

  const fitItems = t.raw("qualification.fit.items") as string[];
  const missItems = t.raw("qualification.miss.items") as string[];
  const faqs = t.raw("faq.items") as { q: string; a: string }[];

  return (
    <>
      <main className="svc-page">
        <SiteNav tone="light" />
        <header className="svc-hero">
          <Container className="svc-hero__inner">
            <motion.span className="kicker" variants={heroFadeUp} initial="hidden" animate="show" custom={0}>
              {t("hero.kicker")}
            </motion.span>

            <motion.h1 variants={heroFadeUp} initial="hidden" animate="show" custom={1}>
              {t.rich("hero.titleLine1", richSerif)}
              <br />
              {t("hero.titleLine2")}
            </motion.h1>

            <motion.p className="svc-hero__lede" variants={heroFadeUp} initial="hidden" animate="show" custom={2}>
              {t("hero.lede")}
            </motion.p>

            <motion.div className="svc-hero__cta" variants={heroFadeUp} initial="hidden" animate="show" custom={3}>
              <ButtonLink href="/apply" variant="inverse" size="md" withArrow>
                {t("hero.cta")}
              </ButtonLink>
            </motion.div>
          </Container>
        </header>

        {/* WHAT WE OFFER */}
        <Section id="offerings" className="svc-offerings">
          <SectionHeader
            kicker={t("offerings.kicker")}
            title={
              <>
                {t("offerings.titleLine1")}
                <br />
                {t.rich("offerings.titleLine2", richSerif)}
              </>
            }
            lede={t("offerings.lede")}
            align="center"
          />

          <div className="svc-detail-list">
            {offerings.map((o, i) => (
              <motion.article
                key={o.key}
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
                    <ArrowLink href="/apply">{o.cta}</ArrowLink>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </Section>

        {/* PROCESS */}
        <Section id="process" className="svc-process">
          <SectionHeader
            kicker={t("process.kicker")}
            title={
              <>
                {t("process.titleLine1")}
                <br />
                {t.rich("process.titleLine2", richSerif)}
              </>
            }
            lede={t("process.lede")}
            align="center"
          />

          <motion.ol
            className="svc-steps-row"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((s) => (
              <motion.li key={s.key} className="svc-step" variants={fadeUp}>
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

        {/* QUALIFICATION */}
        <Section id="qualification" className="svc-qualification">
          <SectionHeader
            kicker={t("qualification.kicker")}
            title={
              <>
                {t("qualification.titleLine1")}
                <br />
                {t.rich("qualification.titleLine2", richSerif)}
              </>
            }
            lede={t("qualification.lede")}
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
              <span className="svc-qual__badge">{t("qualification.fit.badge")}</span>
              <h3 className="svc-qual__title">{t("qualification.fit.title")}</h3>
              <ul className="svc-qual__list">
                {fitItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </motion.article>

            <motion.article
              className="svc-qual svc-qual--miss"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="svc-qual__badge">{t("qualification.miss.badge")}</span>
              <h3 className="svc-qual__title">{t("qualification.miss.title")}</h3>
              <ul className="svc-qual__list">
                {missItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </motion.article>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="svc-faq">
          <SectionHeader
            kicker={t("faq.kicker")}
            title={
              <>
                {t("faq.titleLine1")}
                <br />
                {t.rich("faq.titleLine2", richSerif)}
              </>
            }
            lede={t("faq.lede")}
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

        {/* FINAL CTA */}
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
                {t("finalCta.kicker")}
              </motion.span>
              <motion.h2 className="h2" variants={fadeUp} style={{ color: "#fff", marginTop: "14px" }}>
                {t("finalCta.titleLine1")}
                <br />
                {t.rich("finalCta.titleLine2", richSerif)}
              </motion.h2>
              <motion.p className="lede lede--light" variants={fadeUp}>
                {t("finalCta.lede")}
              </motion.p>
              <motion.div variants={fadeUp}>
                <ButtonLink href="/apply" variant="primary" size="lg" withArrow>
                  {t("finalCta.cta")}
                </ButtonLink>
              </motion.div>
            </motion.div>
          </motion.div>
        </Section>
      </main>
      <CmsInjectedSections slug="services-before-footer" />
      <Footer />
    </>
  );
}
