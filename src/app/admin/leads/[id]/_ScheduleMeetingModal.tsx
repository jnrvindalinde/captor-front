"use client";

import { useEffect, useMemo, useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMeetingSlotsAction, type SlotResponse } from "./_actions";

type Slot = { start: string; end: string };

type Props = {
  open: boolean;
  onClose: () => void;
  userId?: number;
  applicantEmail: string | null;
  onPick: (when: string) => void;
  mode?: "schedule" | "reschedule";
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function sameDay(a: Date, b: Date) {
  return ymd(a) === ymd(b);
}
function fmtMonth(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export function ScheduleMeetingModal({
  open,
  onClose,
  userId,
  applicantEmail,
  onPick,
  mode = "schedule",
}: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [resp, setResp] = useState<SlotResponse | null>(null);
  const [loading, startLoad] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset error when modal opens
    setError(null);
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 60);
    startLoad(async () => {
      const r = await fetchMeetingSlotsAction({
        from: from.toISOString(),
        to: to.toISOString(),
        userId,
      });
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setResp(r.data);
    });
  }, [open, userId]);

  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect -- reset modal state on open */
      setSubmitting(false);
      setStep(1);
      setVisibleMonth(startOfMonth(today));
      setSelectedDay(null);
      setSelectedSlot(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, today]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    if (!resp) return map;
    for (const s of resp.data) {
      const key = ymd(new Date(s.start));
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [resp]);

  useEffect(() => {
    if (!open || !resp || !resp.data.length) return;
    const first = new Date(resp.data[0].start);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- jump to month of first available slot after fetch
    setVisibleMonth(startOfMonth(first));
  }, [open, resp]);

  const cells = useMemo(() => {
    const out: Array<{ date: Date | null }> = [];
    const first = startOfMonth(visibleMonth);
    const offset = (first.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) out.push({ date: null });
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      out.push({ date: new Date(first.getFullYear(), first.getMonth(), i) });
    }
    return out;
  }, [visibleMonth]);

  const slotsForSelected = selectedDay ? byDay.get(ymd(selectedDay)) ?? [] : [];

  const onConfirm = useCallback(() => {
    if (!selectedSlot) return;
    setSubmitting(true);
    onPick(selectedSlot);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 200);
  }, [selectedSlot, onPick, onClose]);

  if (!open) return null;

  const canGoPrev = visibleMonth > startOfMonth(today);
  const monthLimit = startOfMonth(addMonths(today, 2));
  const canGoNext = visibleMonth < monthLimit;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "reschedule" ? "Reschedule meeting" : "Schedule a meeting"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="modal-dialog schedule-modal"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="schedule-modal__head">
          <h2 className="schedule-modal__title">
            {mode === "reschedule" ? "Reschedule meeting" : "Schedule a meeting"}
          </h2>
          <p className="schedule-modal__lede">
            {step === 1
              ? mode === "reschedule"
                ? `Pick a new date. The Google invite and Meet link will be updated for ${applicantEmail ?? "the lead"}.`
                : `Pick a date. A Google invite with a Meet link will be sent to ${applicantEmail ?? "the lead"}.`
              : `Choose a time on ${selectedDay?.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}.`}
          </p>
        </header>

        <button
          type="button"
          className="modal-close schedule-modal__close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal-dialog__scroll schedule-modal__scroll">
          {error ? (
            <div className="admin-toast admin-toast--warn">
              Could not load slots: {error}
            </div>
          ) : loading && !resp ? (
            <p className="admin-muted">Loading available times…</p>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  {resp && !resp.meta.google_connected && (
                    <div className="admin-toast admin-toast--info" style={{ marginBottom: 12 }}>
                      Google Calendar isn&apos;t connected — busy times won&apos;t be
                      auto-skipped. <a href="/admin/settings/google">Connect now</a>.
                    </div>
                  )}

                  <header className="schedule-modal__cal-head">
                    <button
                      type="button"
                      className="schedule-modal__nav"
                      aria-label="Previous month"
                      disabled={!canGoPrev}
                      onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
                    >
                      ‹
                    </button>
                    <strong>{fmtMonth(visibleMonth)}</strong>
                    <button
                      type="button"
                      className="schedule-modal__nav"
                      aria-label="Next month"
                      disabled={!canGoNext}
                      onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
                    >
                      ›
                    </button>
                  </header>

                  <div className="sched-cal">
                    <div className="sched-cal__head">
                      {WEEKDAYS.map((w) => (
                        <span key={w} className="sched-cal__dow">{w}</span>
                      ))}
                    </div>
                    <div className="sched-cal__grid">
                      {cells.map((c, i) => {
                        if (!c.date) {
                          return <span key={`b-${i}`} className="sched-cal__day sched-cal__day--blank" aria-hidden />;
                        }
                        const count = byDay.get(ymd(c.date))?.length ?? 0;
                        const isPast = c.date < today;
                        const hasSlots = count > 0;
                        const disabled = isPast || !hasSlots;
                        const isSelected = selectedDay ? sameDay(c.date, selectedDay) : false;
                        const isToday = sameDay(c.date, today);
                        const cls = [
                          "sched-cal__day",
                          isToday && "sched-cal__day--today",
                          hasSlots && !disabled && "sched-cal__day--open",
                          disabled && "sched-cal__day--off",
                          isSelected && "sched-cal__day--selected",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <button
                            key={i}
                            type="button"
                            className={cls}
                            disabled={disabled}
                            aria-pressed={isSelected}
                            aria-label={`${c.date.toDateString()}${hasSlots ? ` — ${count} slot${count === 1 ? "" : "s"}` : " — no availability"}`}
                            onClick={(e) => {
                              if (disabled) return;
                              e.currentTarget.blur();
                              setSelectedDay(c.date);
                            }}
                          >
                            {c.date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  {slotsForSelected.length === 0 ? (
                    <p className="admin-empty">No times available on this day.</p>
                  ) : (
                    <div className="schedule-modal__slot-grid">
                      {slotsForSelected.map((s) => {
                        const t = new Date(s.start);
                        const label = t.toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        });
                        const isSel = selectedSlot === s.start;
                        return (
                          <button
                            key={s.start}
                            type="button"
                            className={`schedule-modal__slot${isSel ? " schedule-modal__slot--selected" : ""}`}
                            aria-pressed={isSel}
                            disabled={submitting}
                            onClick={() => setSelectedSlot(s.start)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <footer className="schedule-modal__foot">
          {step === 1 ? (
            <>
              <span className="dt-muted schedule-modal__foot-hint">
                {selectedDay
                  ? `${byDay.get(ymd(selectedDay))?.length ?? 0} slot${(byDay.get(ymd(selectedDay))?.length ?? 0) === 1 ? "" : "s"} on ${selectedDay.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                  : "Select a highlighted day"}
              </span>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!selectedDay}
                onClick={() => setStep(2)}
              >
                Next →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setSelectedSlot(null);
                  setStep(1);
                }}
              >
                ← Back
              </button>
              <span className="dt-muted schedule-modal__foot-hint" style={{ marginLeft: "auto", marginRight: 12 }}>
                {selectedSlot
                  ? `Selected ${new Date(selectedSlot).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
                  : "Pick a time"}
              </span>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!selectedSlot || submitting}
                onClick={onConfirm}
              >
                {submitting
                  ? mode === "reschedule" ? "Rescheduling…" : "Scheduling…"
                  : mode === "reschedule" ? "Confirm reschedule" : "Confirm"}
              </button>
            </>
          )}
        </footer>
      </motion.div>
    </div>
  );
}
