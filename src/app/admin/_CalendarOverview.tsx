"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mockLeads, type Lead } from "./_mock";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtMonth(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type EventLite = {
  id: number;
  name: string;
  scheduled_at: string;
};

export function CalendarOverview({ leads }: { leads?: Lead[] } = {}) {
  const source = leads ?? mockLeads;
  // Compute "today" only on the client to avoid SSR/CSR drift.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
  }, []);

  // All scheduled events with a date (any month)
  const eventsByDay = useMemo(() => {
    const m = new Map<string, EventLite[]>();
    for (const lead of source) {
      if (!lead.scheduled_at) continue;
      const d = new Date(lead.scheduled_at);
      const key = d.toDateString();
      const list = m.get(key) ?? [];
      list.push({ id: lead.id, name: lead.name, scheduled_at: lead.scheduled_at });
      m.set(key, list);
    }
    return m;
  }, [source]);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Pick a sensible default once "today" is known
  useEffect(() => {
    if (!today || selectedDay) return;
    if (eventsByDay.get(today.toDateString())) {
      setSelectedDay(today);
      return;
    }
    const dow = (today.getDay() + 6) % 7;
    const ws = new Date(today);
    ws.setDate(today.getDate() - dow);
    ws.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(ws.getDate() + i);
      if (eventsByDay.get(d.toDateString())) {
        setSelectedDay(d);
        return;
      }
    }
    setSelectedDay(today);
  }, [today, eventsByDay, selectedDay]);

  if (!today) {
    return (
      <article className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="h3">This week</h2>
        </header>
        <p className="admin-cal__summary">Loading…</p>
      </article>
    );
  }

  // Build a single week row (Mon → Sun of current week)
  const dow = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);

  const cells: Array<{ date: Date; inMonth: boolean }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === today.getMonth() });
  }

  let weekEventCount = 0;
  for (const c of cells) {
    weekEventCount += eventsByDay.get(c.date.toDateString())?.length ?? 0;
  }

  const activeDay = selectedDay ?? today;
  const selectedEvents = eventsByDay.get(activeDay.toDateString()) ?? [];

  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">This week</h2>
        <span className="admin-cal__month">{fmtMonth(today)}</span>
      </header>

      <p className="admin-cal__summary">
        {weekEventCount === 0
          ? "No meetings scheduled this week."
          : `${weekEventCount} ${weekEventCount === 1 ? "meeting" : "meetings"} this week. Click a highlighted day to see its itinerary.`}
      </p>

      <div className="admin-cal">
        <div className="admin-cal__grid admin-cal__grid--head">
          {WEEKDAYS.map((w) => (
            <span key={w} className="admin-cal__dow">{w}</span>
          ))}
        </div>
        <div className="admin-cal__grid">
          {cells.map((c, i) => {
            const isToday = sameDay(c.date, today);
            const isSelected = sameDay(c.date, activeDay);
            const hasEvent = (eventsByDay.get(c.date.toDateString())?.length ?? 0) > 0;
            const cls = [
              "admin-cal__day",
              !c.inMonth && "admin-cal__day--muted",
              isToday && "admin-cal__day--today",
              hasEvent && "admin-cal__day--event",
              isSelected && "admin-cal__day--selected",
            ]
              .filter(Boolean)
              .join(" ");
            const content = (
              <>
                <span className="admin-cal__num">{c.date.getDate()}</span>
                {hasEvent && <span className="admin-cal__dot" aria-hidden />}
              </>
            );
            return (
              <button
                key={i}
                type="button"
                className={cls}
                aria-label={`${c.date.toDateString()}${hasEvent ? " — view itinerary" : " — no meetings"}`}
                aria-pressed={isSelected}
                onClick={(e) => {
                  // Prevent the browser from auto-scrolling the focused button into view,
                  // which causes the page to twitch when the itinerary height changes.
                  e.currentTarget.blur();
                  setSelectedDay(c.date);
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-cal__week" aria-live="polite">
        <h3 className="admin-cal__week-title">
          Itinerary · {activeDay.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </h3>
        <motion.div
          layout
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeDay.toDateString()}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              {selectedEvents.length === 0 ? (
                <p className="admin-empty">No meetings on this day.</p>
              ) : (
                <ul className="admin-cal__list">
                  {selectedEvents
                    .slice()
                    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
                    .map((m) => {
                      const d = new Date(m.scheduled_at);
                      return (
                        <li key={m.id}>
                          <span className="admin-cal__list-time">
                            {d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          </span>
                          <span className="admin-cal__list-name">{m.name}</span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <footer className="admin-panel__foot">
        <Link href="/admin/calendar" className="admin-btn-tertiary">
          View full calendar →
        </Link>
      </footer>
    </article>
  );
}
