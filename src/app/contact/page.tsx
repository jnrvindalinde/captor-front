"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Section, Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";
import { Button, ButtonLink } from "@/components/ui/Button";
import { submitContactAction } from "@/app/actions/publicForms";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

type Channel = {
  label: string;
  value: string;
  href: string;
  hint: string;
  icon: React.ReactNode;
};

const channels: Channel[] = [
  {
    label: "Email",
    value: "hello@career360consult.com",
    href: "mailto:hello@career360consult.com",
    hint: "We reply within 48 hours.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m3.5 6.5 8.5 7 8.5-7" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+233 (0) 30 000 0000",
    href: "tel:+233300000000",
    hint: "Mon–Fri, 9am – 5pm GMT.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    label: "Office",
    value: "Accra, Ghana",
    href: "https://maps.google.com/?q=Accra,Ghana",
    hint: "By appointment only.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

type Topic = "applications" | "advising" | "partnerships" | "press" | "other";

const topicOptions: { value: Topic; label: string }[] = [
  { value: "applications", label: "Application support" },
  { value: "advising", label: "1:1 advising" },
  { value: "partnerships", label: "Partnerships" },
  { value: "press", label: "Press & media" },
  { value: "other", label: "Something else" },
];

const faqs = [
  {
    q: "How quickly will I hear back?",
    a: "Most enquiries get a reply within 48 hours. If you write over a weekend, expect us on Monday.",
  },
  {
    q: "Is there a charge to enquire?",
    a: "No. The first conversation is free and there is no obligation to proceed.",
  },
  {
    q: "Do you work with applicants outside Ghana?",
    a: "Yes — we work with applicants across Africa and the diaspora. Sessions are remote by default.",
  },
];

export default function ContactPage() {
  const [topic, setTopic] = useState<Topic>("applications");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      topic: (fd.get("topic") ?? topic) as Topic,
      message: String(fd.get("message") ?? "").trim(),
    };
    setStatus("sending");
    startTransition(async () => {
      const r = await submitContactAction(payload);
      if (r.ok) {
        setStatus("sent");
      } else {
        setStatus("idle");
        setErrorMessage(r.message);
      }
    });
  };

  return (
    <main className="contact-page">
      <SiteNav tone="light" />

      {/* HERO */}
      <header className="contact-hero">
        <Container className="contact-hero__inner">
          <motion.span
            className="kicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            — Contact
          </motion.span>
          <motion.h1
            className="h1"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Let&apos;s <span className="serif">talk</span>.
          </motion.h1>
          <motion.p
            className="contact-hero__lede"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Tell us where you&apos;re headed and what you&apos;re weighing. We&apos;ll
            read every word and reply with a real human, not a form letter.
          </motion.p>
        </Container>
      </header>

      {/* CHANNELS */}
      <Section tight>
        <motion.div
          className="contact-channels"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {channels.map((c) => (
            <motion.a
              key={c.label}
              href={c.href}
              className="contact-channel"
              variants={fadeUp}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noreferrer" : undefined}
            >
              <span className="contact-channel__icon" aria-hidden="true">
                {c.icon}
              </span>
              <span className="contact-channel__label">{c.label}</span>
              <span className="contact-channel__value">{c.value}</span>
              <span className="contact-channel__hint">{c.hint}</span>
            </motion.a>
          ))}
        </motion.div>
      </Section>

      {/* FORM */}
      <Section tight id="form">
        <div className="contact-form-grid">
          <motion.div
            className="contact-form-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="kicker">Send a message</span>
            <h2 className="h2 contact-form-title">
              Tell us where <span className="serif">you are</span>.
            </h2>
            <p className="lede contact-form-subtext">
              A few details so the right person on our team can reply within 48 hours.
            </p>
          </motion.div>

          <motion.div
            className="contact-form-card-wrap"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
            {status === "sent" ? (
              <motion.div
                key="sent"
                className="contact-success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                role="status"
                aria-live="polite"
              >
                <span className="contact-success__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h3 className="contact-success__title">
                  Message <span className="serif">received</span>.
                </h3>
                <p className="contact-success__lede">
                  Thank you. A real person on our team will read what you sent and
                  reply within 48 hours — usually sooner. Keep an eye on your inbox
                  (and spam folder, just in case).
                </p>
                <div className="contact-success__actions">
                  <button
                    type="button"
                    className="contact-success__again"
                    onClick={() => setStatus("idle")}
                  >
                    Send another message
                  </button>
                  <Link href="/" className="contact-success__home">
                    Back to home
                  </Link>
                </div>
              </motion.div>
            ) : (
            <motion.form
              key="form"
              className="contact-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="contact-form__row">
            <label className="contact-field">
              <span className="contact-field__label">Full name</span>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                placeholder="Akua Mensah"
              />
            </label>
            <label className="contact-field">
              <span className="contact-field__label">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="contact-field">
            <span className="contact-field__label">I&apos;m writing about</span>
            <div className="contact-select">
              <select
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value as Topic)}
              >
                {topicOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="contact-select__chev" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
          </label>

          <label className="contact-field">
            <span className="contact-field__label">Message</span>
            <textarea
              name="message"
              rows={6}
              required
              placeholder="A few lines about where you are and what you're working towards."
            />
          </label>

          <div className="contact-form__footer">
            <p className="contact-form__note">
              By sending, you agree we may reply to the address above. We never
              share your details.
            </p>
            {errorMessage && (
              <p className="contact-form__error" role="alert" style={{ color: "#b91c1c" }}>
                {errorMessage}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              withArrow
              disabled={status !== "idle"}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </Button>
          </div>
        </motion.form>
            )}
            </AnimatePresence>
          </motion.div>

          <motion.aside
            className="contact-side"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="contact-side__block">
              <p className="contact-side__intro">Here&apos;s what happens after you send.</p>
              <ol className="contact-side__steps">
                <li>
                  <strong>Within 48 hours</strong>
                  <span>A personal reply, never an auto-response.</span>
                </li>
                <li>
                  <strong>An intro call</strong>
                  <span>Thirty minutes to understand your goals — no charge.</span>
                </li>
                <li>
                  <strong>A clear plan</strong>
                  <span>Either we&apos;re a fit, or we&apos;ll point you somewhere better.</span>
                </li>
              </ol>
            </div>

            <div className="contact-side__alt">
              <p className="contact-side__alt-label">Prefer to chat live?</p>
              <a
                href="https://wa.me/233300000000"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-side__alt-link"
              >
                Message us on WhatsApp
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.aside>
        </div>
      </Section>

      {/* FAQ */}
      <Section tight>
        <motion.div
          className="contact-faq"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="contact-faq__head" variants={fadeUp}>
            <span className="kicker">FAQ</span>
            <h2 className="h2 contact-faq__title">
              Quick <span className="serif">answers</span>.
            </h2>
          </motion.div>
          <div className="contact-faq__list">
            {faqs.map((f) => (
              <motion.details key={f.q} className="contact-faq__item" variants={fadeUp}>
                <summary>
                  <span>{f.q}</span>
                  <span className="contact-faq__chev" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p>{f.a}</p>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* APPLY CTA STRIP */}
      <Section tight>
        <motion.div
          className="contact-cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="contact-cta__copy">
            <span className="kicker kicker--light">— Already decided?</span>
            <h2 className="h2" style={{ color: "#fff" }}>
              Skip ahead and <span className="serif">apply</span>.
            </h2>
            <p className="lede lede--light">
              If you&apos;d rather start with the formal application, we&apos;ll route it
              the same way.
            </p>
          </div>
          <div className="contact-cta__action">
            <ButtonLink href="/apply" variant="primary" size="lg" withArrow>
              Start your application
            </ButtonLink>
          </div>
        </motion.div>
      </Section>

      <CmsInjectedSections slug="contact-before-footer" />
      <Footer />
    </main>
  );
}
