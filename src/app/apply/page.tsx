"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";
import { Button, ButtonLink } from "@/components/ui/Button";
import { submitApplicationAction } from "@/app/actions/publicForms";

/* ============================== TYPES ============================== */

type Status =
  | "student-final"
  | "graduate-recent"
  | "professional"
  | "senior"
  | "other";

type Goal =
  | "study-abroad"
  | "local-job"
  | "international-placement"
  | "pivot"
  | "postgrad-gh"
  | "other";

type Timeline = "0-3" | "3-6" | "6-12" | "12+";
type Budget = "self" | "scholarship" | "employer" | "unsure";
type Source = "referral" | "linkedin" | "google" | "event" | "other";

type AppData = {
  status?: Status;
  statusOther: string;
  location: string;
  field: string;

  goal?: Goal;
  goalOther: string;
  targets: string[];
  timeline?: Timeline;
  budget?: Budget;

  files: File[];
  story: string;

  name: string;
  email: string;
  phone: string;
  source?: Source;
  newsletter: boolean;
};

const initial: AppData = {
  statusOther: "",
  location: "",
  field: "",
  goalOther: "",
  targets: [],
  files: [],
  story: "",
  name: "",
  email: "",
  phone: "",
  newsletter: false,
};

const STATUS_OPTIONS: { value: Status; label: string; desc: string }[] = [
  { value: "student-final", label: "Final-year student", desc: "Finishing undergraduate or postgraduate studies." },
  { value: "graduate-recent", label: "Recent graduate", desc: "Zero to two years out of school." },
  { value: "professional", label: "Working professional", desc: "Three to seven years of full-time experience." },
  { value: "senior", label: "Senior professional / switcher", desc: "Eight years and up, or considering a change." },
  { value: "other", label: "Something else", desc: "Tell us in a sentence." },
];

const GOAL_OPTIONS: { value: Goal; label: string; desc: string }[] = [
  { value: "study-abroad", label: "Study abroad", desc: "Masters, PhD, or scholarship outside Ghana." },
  { value: "local-job", label: "Local job change", desc: "A better role inside Ghana." },
  { value: "international-placement", label: "International placement", desc: "Working overseas with sponsorship." },
  { value: "pivot", label: "Career pivot", desc: "New industry, new function, new direction." },
  { value: "postgrad-gh", label: "Postgrad in Ghana", desc: "A local Masters, PhD, or executive program." },
  { value: "other", label: "Something else", desc: "Tell us in a sentence." },
];

const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "0-3", label: "Within 3 months" },
  { value: "3-6", label: "3 – 6 months" },
  { value: "6-12", label: "6 – 12 months" },
  { value: "12+", label: "Exploring (12+ months)" },
];

const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: "self", label: "Self-funded / family" },
  { value: "scholarship", label: "Need scholarship or aid" },
  { value: "employer", label: "Employer-sponsored" },
  { value: "unsure", label: "Not sure yet" },
];

const SOURCE_OPTIONS: { value: Source; label: string }[] = [
  { value: "referral", label: "A friend or referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "google", label: "Google search" },
  { value: "event", label: "An event or talk" },
  { value: "other", label: "Somewhere else" },
];

const STEPS = [
  { num: 1, title: "Where you are" },
  { num: 2, title: "Where you want to go" },
  { num: 3, title: "Documents & story" },
  { num: 4, title: "How to reach you" },
];

/* ============================== ANIMATIONS ============================== */

const stepVariants: Variants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

/* ============================== PAGE ============================== */

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  // Each step is split into focused sub-panels (one item at a time).
  // sub is 0-indexed within the current step.
  const SUB_COUNT: Record<number, number> = { 1: 2, 2: 3, 3: 2, 4: 2 };
  const [sub, setSub] = useState(0);
  const [data, setData] = useState<AppData>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, startSubmitting] = useTransition();

  /* URL hash <-> step (refresh / back safe) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    const n = parseInt(hash, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= STEPS.length) setStep(n);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (submitted) return;
    const next = `#${step}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [step, submitted]);

  const update = useCallback(
    <K extends keyof AppData>(
      key: K,
      valueOrUpdater: AppData[K] | ((prev: AppData[K]) => AppData[K]),
    ) => {
      setData((d) => ({
        ...d,
        [key]:
          typeof valueOrUpdater === "function"
            ? (valueOrUpdater as (prev: AppData[K]) => AppData[K])(d[key])
            : valueOrUpdater,
      }));
    },
    [],
  );

  function validatePanel(n: number, s: number): string | null {
    if (n === 1 && s === 0) {
      if (!data.status) return "Pick where you are right now.";
      if (data.status === "other" && !data.statusOther.trim())
        return "Tell us briefly where you are.";
    }
    if (n === 1 && s === 1) {
      if (!data.location.trim()) return "Where are you based?";
      if (!data.field.trim()) return "What's your current field or focus?";
    }
    if (n === 2 && s === 0) {
      if (!data.goal) return "Pick a primary goal.";
      if (data.goal === "other" && !data.goalOther.trim())
        return "Tell us briefly what you're aiming for.";
    }
    if (n === 2 && s === 1) {
      // Target countries are optional.
    }
    if (n === 2 && s === 2) {
      if (!data.timeline) return "Pick a timeline.";
      if (!data.budget) return "Pick a funding direction.";
    }
    if (n === 3) {
      // Step 3 is fully optional across all panels.
    }
    if (n === 4 && s === 0) {
      if (!data.name.trim()) return "We need a name to reply to.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        return "A valid email keeps the thread alive.";
    }
    return null;
  }

  function isLastPanel() {
    return step === STEPS.length && sub === SUB_COUNT[step] - 1;
  }

  function goNext() {
    const err = validatePanel(step, sub);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    if (sub < SUB_COUNT[step] - 1) {
      setSub(sub + 1);
      return;
    }
    if (step < STEPS.length) {
      setStep(step + 1);
      setSub(0);
    }
  }

  function goBack() {
    setStepError(null);
    if (sub > 0) {
      setSub(sub - 1);
      return;
    }
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      setSub(SUB_COUNT[prev] - 1);
    }
  }

  // Allow direct jumps from the stepper for completed (or current) steps.
  function jumpToStep(target: number) {
    if (target === step) return;
    if (target > step) return;
    setStepError(null);
    setStep(target);
    // Land on the final sub-panel of the target step so users can review
    // what they last filled in.
    setSub(SUB_COUNT[target] - 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Run every panel's validator so users who jumped directly to the final
    // step (via deep link / progress rail) still get a clear inline error
    // instead of a generic 422 from the backend.
    for (let n = 1; n <= STEPS.length; n++) {
      for (let s = 0; s < SUB_COUNT[n]; s++) {
        const err = validatePanel(n, s);
        if (err) {
          setStep(n);
          setSub(s);
          setStepError(err);
          return;
        }
      }
    }
    setStepError(null);

    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("email", data.email);
    if (data.phone) fd.append("phone", data.phone);
    if (data.source) fd.append("source", data.source);
    fd.append("newsletter", data.newsletter ? "1" : "0");
    if (data.status) fd.append("status_self", data.status);
    if (data.statusOther) fd.append("status_other", data.statusOther);
    fd.append("location", data.location);
    fd.append("field", data.field);
    if (data.goal) fd.append("goal", data.goal);
    if (data.goalOther) fd.append("goal_other", data.goalOther);
    data.targets.forEach((t) => fd.append("targets[]", t));
    if (data.timeline) fd.append("timeline", data.timeline);
    if (data.budget) fd.append("budget", data.budget);
    if (data.story) fd.append("story", data.story);
    data.files.forEach((f) => fd.append("files[]", f, f.name));

    startSubmitting(async () => {
      const r = await submitApplicationAction(fd);
      if (!r.ok) {
        // Surface the first validator error so the user sees a concrete field name.
        const firstFieldError =
          r.errors && Object.values(r.errors)[0]?.[0];
        setStepError(firstFieldError ?? r.message);
        return;
      }
      setSubmitted(true);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#thanks");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <main>
      <SiteNav tone="light" />

      {/* HERO — hidden once the application is submitted so the success
          state stands alone, uninterrupted by the form intro copy. */}
      {!submitted && (
        <Section tight>
          <motion.div
            className="apply-hero"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="kicker">Start your application</span>
            <h1 className="apply-hero__title">
              Tell us where <span className="serif">you&apos;re going</span>.
            </h1>
            <p className="apply-hero__lede">
              About five minutes. Every answer helps us match you with the right
              advisor — and only with the right advisor. No automated funnels, no
              commitment yet.
            </p>
          </motion.div>
        </Section>
      )}

      {/* APPLICATION CARD */}
      <Section tight>
        {!submitted ? (
          <div className="apply-shell">
            <ProgressRail current={step} onJump={jumpToStep} />

            <form
              className="apply-formcard"
              onSubmit={(e) => {
                if (!isLastPanel()) {
                  e.preventDefault();
                  goNext();
                } else {
                  handleSubmit(e);
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${step}-${sub}`}
                  className="apply-step"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {step === 1 && sub === 0 && <Step1Status data={data} update={update} />}
                  {step === 1 && sub === 1 && <Step1Context data={data} update={update} />}
                  {step === 2 && sub === 0 && <Step2Goal data={data} update={update} />}
                  {step === 2 && sub === 1 && <Step2Targets data={data} update={update} />}
                  {step === 2 && sub === 2 && <Step2Timing data={data} update={update} />}
                  {step === 3 && sub === 0 && <Step3Docs data={data} update={update} />}
                  {step === 3 && sub === 1 && <Step3Story data={data} update={update} />}
                  {step === 4 && sub === 0 && <Step4Identity data={data} update={update} />}
                  {step === 4 && sub === 1 && <Step4Channel data={data} update={update} />}
                </motion.div>
              </AnimatePresence>

              {stepError && (
                <div className="apply-error" role="alert">
                  {stepError}
                </div>
              )}

              <div className="apply-actions">
                <button
                  type="button"
                  className="apply-back"
                  onClick={goBack}
                  disabled={step === 1 && sub === 0}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                {!isLastPanel() ? (
                  <Button type="submit" variant="primary" size="md" withArrow>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" variant="primary" size="md" withArrow disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit application"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <SuccessState name={data.name} />
        )}
      </Section>

      <CmsInjectedSections slug="apply-before-footer" />
      <Footer />
    </main>
  );
}

/* ============================== PROGRESS ============================== */

function ProgressRail({
  current,
  onJump,
}: {
  current: number;
  onJump: (n: number) => void;
}) {
  return (
    <ol className="apply-rail" aria-label="Application progress">
      {STEPS.map((s) => {
        const state =
          s.num < current ? "done" : s.num === current ? "active" : "todo";
        const clickable = s.num <= current;
        return (
          <li key={s.num} className={`apply-rail__item is-${state}`}>
            <button
              type="button"
              className="apply-rail__btn"
              onClick={() => clickable && onJump(s.num)}
              disabled={!clickable}
              aria-current={state === "active" ? "step" : undefined}
            >
              <span className="apply-rail__num" aria-hidden="true">
                {state === "done" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : (
                  s.num
                )}
              </span>
              <span className="apply-rail__label">
                <span className="apply-rail__step-label">Step {s.num}</span>
                <span className="apply-rail__title">{s.title}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================== STEPS ============================== */

type StepProps = {
  data: AppData;
  update: <K extends keyof AppData>(
    key: K,
    valueOrUpdater: AppData[K] | ((prev: AppData[K]) => AppData[K]),
  ) => void;
};

function StepHeader({ kicker, title, lede }: { kicker: string; title: React.ReactNode; lede: string }) {
  return (
    <header className="apply-step__head">
      <span className="kicker">{kicker}</span>
      <h2 className="apply-step__title">{title}</h2>
      <p className="apply-step__lede">{lede}</p>
    </header>
  );
}

function Step1Status({ data, update }: StepProps) {
  // Show 4 primary status cards. "Something else" lives as a reveal link
  // below the grid to keep the surface clean.
  const PRIMARY = STATUS_OPTIONS.filter((o) => o.value !== "other");
  const isOther = data.status === "other";

  return (
    <>
      <StepHeader
        kicker="Step 1 of 4"
        title={<>Where you <span className="serif">are</span> now.</>}
        lede="Just the basics. We use this to point you at the right advisor — not to filter you out."
      />

      <fieldset className="apply-fieldset">
        <legend className="apply-legend">Current status</legend>
        <div className="apply-radio-grid apply-radio-grid--2">
          {PRIMARY.map((opt) => (
            <RadioCard
              key={opt.value}
              name="status"
              value={opt.value}
              label={opt.label}
              desc={opt.desc}
              checked={data.status === opt.value}
              onChange={() => update("status", opt.value)}
            />
          ))}
        </div>

        {!isOther ? (
          <button
            type="button"
            className="apply-reveal-link"
            onClick={() => update("status", "other")}
          >
            None of these fit? Tell us in your own words →
          </button>
        ) : (
          <div className="apply-other-block">
            <label className="contact-field">
              <span className="contact-field__label">Tell us briefly</span>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Returning from a career break"
                value={data.statusOther}
                onChange={(e) => update("statusOther", e.target.value)}
              />
            </label>
            <button
              type="button"
              className="apply-reveal-link apply-reveal-link--muted"
              onClick={() => {
                update("status", undefined);
                update("statusOther", "");
              }}
            >
              ← Back to the options
            </button>
          </div>
        )}
      </fieldset>
    </>
  );
}

function Step1Context({ data, update }: StepProps) {
  return (
    <>
      <StepHeader
        kicker="Step 1 of 4 · context"
        title={<>A little <span className="serif">context</span>.</>}
        lede="Two short answers so we know where you're starting from."
      />

      <label className="contact-field">
        <span className="contact-field__label">Where are you based?</span>
        <input
          type="text"
          placeholder="Accra, Ghana"
          value={data.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </label>

      <label className="contact-field">
        <span className="contact-field__label">Current field or focus</span>
        <input
          type="text"
          placeholder="Accounting, software, public health…"
          value={data.field}
          onChange={(e) => update("field", e.target.value)}
        />
      </label>
    </>
  );
}

function Step2Goal({ data, update }: StepProps) {
  const isOther = data.goal === "other";
  return (
    <>
      <StepHeader
        kicker="Step 2 of 4"
        title={<>Where you want to <span className="serif">go</span>.</>}
        lede="Pick the closest shape. We'll get into specifics on the call."
      />

      <fieldset className="apply-fieldset">
        <legend className="apply-legend">Primary goal</legend>
        <div className="apply-select-wrap">
          <select
            className="apply-select"
            value={data.goal ?? ""}
            onChange={(e) =>
              update("goal", e.target.value ? (e.target.value as Goal) : undefined)
            }
          >
            <option value="">Pick the closest shape…</option>
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg className="apply-select__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        {data.goal && !isOther && (
          <p className="apply-helper apply-helper--inline">
            {GOAL_OPTIONS.find((o) => o.value === data.goal)?.desc}
          </p>
        )}
        {isOther && (
          <label className="contact-field" style={{ marginTop: "var(--space-3)" }}>
            <span className="contact-field__label">Tell us briefly</span>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Move from public sector to international NGO"
              value={data.goalOther}
              onChange={(e) => update("goalOther", e.target.value)}
            />
          </label>
        )}
      </fieldset>
    </>
  );
}

function Step2Targets({ data, update }: StepProps) {
  const [chip, setChip] = useState("");

  function addChip() {
    const v = chip.trim();
    if (!v) return;
    // Use the functional form so rapid Enter presses can't overwrite each
    // other with a stale snapshot of `data.targets`.
    update("targets", (prev) => (prev.includes(v) ? prev : [...prev, v]));
    setChip("");
  }

  function removeChip(value: string) {
    update("targets", (prev) => prev.filter((t) => t !== value));
  }

  return (
    <>
      <StepHeader
        kicker="Step 2 of 4 · targets"
        title={<>Anywhere in <span className="serif">mind</span>?</>}
        lede="Optional. Drop a few countries, schools, or programs you're considering."
      />

      <label className="contact-field">
        <span className="contact-field__label">Target countries or programs</span>
        <div className="apply-chips">
          {data.targets.map((t) => (
            <span key={t} className="apply-chip">
              {t}
              <button
                type="button"
                className="apply-chip__x"
                onClick={() => removeChip(t)}
                aria-label={`Remove ${t}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            className="apply-chip-input"
            placeholder={data.targets.length ? "Add another…" : "UK, Canada, LSE, Chevening…"}
            value={chip}
            onChange={(e) => setChip(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addChip();
              }
            }}
            onBlur={addChip}
          />
          {/* Mobile keyboards rarely surface a clear "add" affordance for
              free-form chip input. A check button next to the field gives
              touch users an obvious one-tap way to confirm the current
              value as a chip and clear the input ready for the next. */}
          <button
            type="button"
            className="apply-chip-add"
            onClick={addChip}
            disabled={!chip.trim()}
            aria-label="Add this entry"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
        <span className="apply-helper">
          Press Enter, comma, or tap the check to add. Leave blank if you&apos;re still
          mapping options.
        </span>
      </label>
    </>
  );
}

function Step2Timing({ data, update }: StepProps) {
  return (
    <>
      <StepHeader
        kicker="Step 2 of 4 · timing & funding"
        title={<>When &amp; <span className="serif">how</span>.</>}
        lede="Two quick picks so we can match you to the right advisor and pace."
      />

      <fieldset className="apply-fieldset">
        <legend className="apply-legend">Timeline</legend>
        <div className="apply-select-wrap">
          <select
            className="apply-select"
            value={data.timeline ?? ""}
            onChange={(e) =>
              update("timeline", e.target.value ? (e.target.value as Timeline) : undefined)
            }
          >
            <option value="">Pick a timeline…</option>
            {TIMELINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg className="apply-select__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </fieldset>

      <fieldset className="apply-fieldset">
        <legend className="apply-legend">Funding direction</legend>
        <div className="apply-select-wrap">
          <select
            className="apply-select"
            value={data.budget ?? ""}
            onChange={(e) =>
              update("budget", e.target.value ? (e.target.value as Budget) : undefined)
            }
          >
            <option value="">Pick a funding direction…</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg className="apply-select__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </fieldset>
    </>
  );
}

function Step3Docs({ data, update }: StepProps) {
  const [dragOver, setDragOver] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list || !list.length) return;
    const fresh = Array.from(list);
    update("files", [...data.files, ...fresh]);
  }

  function removeFile(idx: number) {
    update("files", data.files.filter((_, i) => i !== idx));
  }

  return (
    <>
      <StepHeader
        kicker="Step 3 of 4 · documents"
        title={<>Bring your <span className="serif">papers</span>.</>}
        lede="Optional. CV, transcripts, certificates — anything that gives us a head start."
      />

      <div
        className={`apply-drop ${dragOver ? "is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="apply-drop__title">Drag a file here or browse</p>
        <p className="apply-drop__sub">Up to 25MB each.</p>
        <label className="apply-drop__btn">
          Choose files
          <input
            type="file"
            multiple
            onChange={(e) => addFiles(e.target.files)}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {data.files.length > 0 && (
        <ul className="apply-files">
          {data.files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="apply-files__item">
              <span className="apply-files__name">{f.name}</span>
              <span className="apply-files__size">{formatBytes(f.size)}</span>
              <button
                type="button"
                className="apply-files__remove"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${f.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Step3Story({ data, update }: StepProps) {
  return (
    <>
      <StepHeader
        kicker="Step 3 of 4 · your story"
        title={<>Anything we should <span className="serif">know</span>?</>}
        lede="Optional. Constraints, deal-breakers, the story behind the numbers."
      />

      <label className="contact-field">
        <span className="contact-field__label">In your own words</span>
        <textarea
          rows={8}
          placeholder="The more we know, the better we match."
          value={data.story}
          onChange={(e) => update("story", e.target.value)}
        />
      </label>
    </>
  );
}

function Step4Identity({ data, update }: StepProps) {
  return (
    <>
      <StepHeader
        kicker="Step 4 of 4"
        title={<>How to <span className="serif">reach</span> you.</>}
        lede="A senior advisor — never a bot — replies within 48 hours."
      />

      <label className="contact-field">
        <span className="contact-field__label">Full name</span>
        <input
          type="text"
          required
          placeholder="Akua Mensah"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </label>
      <label className="contact-field">
        <span className="contact-field__label">Email</span>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </label>
    </>
  );
}

function Step4Channel({ data, update }: StepProps) {
  return (
    <>
      <StepHeader
        kicker="Step 4 of 4 · last bit"
        title={<>One more <span className="serif">channel</span>.</>}
        lede="Phone is optional. The discovery question helps us thank the right people."
      />

      <label className="contact-field">
        <span className="contact-field__label">Phone (optional)</span>
        <input
          type="tel"
          placeholder="+233 24 000 0000"
          value={data.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </label>
      <label className="contact-field">
        <span className="contact-field__label">How did you hear about us?</span>
        <div className="apply-select-wrap">
          <select
            className="apply-select"
            value={data.source ?? ""}
            onChange={(e) =>
              update("source", e.target.value ? (e.target.value as Source) : undefined)
            }
          >
            <option value="">Pick one…</option>
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg className="apply-select__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </label>

      <label className="apply-check">
        <input
          type="checkbox"
          checked={data.newsletter}
          onChange={(e) => update("newsletter", e.target.checked)}
        />
        <span>Send me Career360 field notes — short, occasional, easy to unsubscribe.</span>
      </label>

      <p className="apply-fine-print">
        By submitting, you agree we may use what you shared to reply and prepare
        your intake. We don&apos;t resell or repurpose it.
      </p>
    </>
  );
}

/* ============================== SUCCESS ============================== */

function SuccessState({ name }: { name: string }) {
  const first = name.trim().split(" ")[0] || "thanks";
  return (
    <motion.div
      className="apply-success"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="apply-success__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <span className="kicker">Application received</span>
      <h2 className="apply-success__title">
        We&apos;ve got it, <span className="serif">{first}</span>.
      </h2>
      <p className="apply-success__lede">
        A senior advisor will reach out within 48 hours from the email you
        shared. In the meantime, we&apos;ve sent you a copy of what you submitted.
      </p>
      <div className="apply-success__actions">
        <ButtonLink href="/" variant="primary" size="md" withArrow>
          Back to home
        </ButtonLink>
        <ButtonLink href="/resources" variant="secondary" size="md">
          Read while you wait
        </ButtonLink>
      </div>
    </motion.div>
  );
}

/* ============================== HELPERS ============================== */

function RadioCard({
  name,
  value,
  label,
  desc,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={`apply-radio-card ${checked ? "is-checked" : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="apply-radio-card__inner">
        <span className="apply-radio-card__dot" aria-hidden="true">
          <span className="apply-radio-card__dot-fill" />
        </span>
        <span className="apply-radio-card__text">
          <span className="apply-radio-card__label">{label}</span>
          <span className="apply-radio-card__desc">{desc}</span>
        </span>
      </span>
    </label>
  );
}

function RadioPill({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={`apply-radio-pill ${checked ? "is-checked" : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
}
// Keep RadioPill exported via void reference so future reuse doesn't require
// re-importing. Currently the timing/funding panels use a styled <select>.
void RadioPill;
// Keep RadioPill exported via void reference so future reuse doesn't require
// re-importing. Currently the timing/funding panels use a styled <select>.
void RadioPill;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
