"use client";

import { useMemo, useState, useTransition } from "react";
import { saveAvailabilityAction, type AvailabilityResponse, type Rule } from "./_actions";

type Props = { initial: AvailabilityResponse | null };

const WEEKDAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90];
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60];

type DayState = {
  enabled: boolean;
  start: string;
  end: string;
  slot: number;
  buffer: number;
};

function buildInitialState(initial: AvailabilityResponse | null) {
  const map = new Map<number, Rule[]>();
  if (initial) {
    for (const r of initial.data) {
      const arr = map.get(r.weekday) ?? [];
      arr.push(r);
      map.set(r.weekday, arr);
    }
  }
  const state: Record<number, DayState> = {};
  for (const w of WEEKDAYS) {
    const rules = map.get(w.value);
    const r = rules?.[0];
    const defaultWorkday = w.value >= 1 && w.value <= 5;
    state[w.value] = {
      enabled: r ? true : initial && initial.data.length === 0 ? defaultWorkday : false,
      start: r ? r.start_time.slice(0, 5) : "09:00",
      end: r ? r.end_time.slice(0, 5) : "17:00",
      slot: r?.slot_minutes ?? 30,
      buffer: r?.buffer_minutes ?? 10,
    };
  }
  return state;
}

export function AvailabilityClient({ initial }: Props) {
  const browserTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );
  const [timezone, setTimezone] = useState<string>(
    initial?.data[0]?.timezone || initial?.default.timezone || browserTz,
  );
  const [days, setDays] = useState<Record<number, DayState>>(() =>
    buildInitialState(initial),
  );
  const [saving, startSave] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);

  const update = (weekday: number, patch: Partial<DayState>) => {
    setDays((prev) => ({ ...prev, [weekday]: { ...prev[weekday], ...patch } }));
  };

  const enabledCount = WEEKDAYS.filter((w) => days[w.value].enabled).length;

  const onSave = () => {
    const rules: Rule[] = [];
    for (const w of WEEKDAYS) {
      const d = days[w.value];
      if (!d.enabled) continue;
      if (d.end <= d.start) {
        setMsg({ kind: "warn", text: `${w.label}: end time must be after start time.` });
        return;
      }
      rules.push({
        weekday: w.value,
        start_time: d.start,
        end_time: d.end,
        slot_minutes: d.slot,
        buffer_minutes: d.buffer,
      });
    }
    setMsg(null);
    startSave(async () => {
      const r = await saveAvailabilityAction({ timezone, rules });
      if (!r.ok) {
        setMsg({ kind: "warn", text: r.message });
        return;
      }
      setMsg({
        kind: "ok",
        text: rules.length === 0 ? "Cleared. Defaults restored." : "Availability saved.",
      });
    });
  };

  const usingDefaults = !initial || initial.data.length === 0;

  return (
    <>
      <div className="dt-toolbar">
        <label className="dt-toolbar__field">
          <span>Timezone</span>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g. Africa/Accra"
          />
        </label>
        <div className="dt-toolbar__field av-tz-hint">
          <span>Detected</span>
          <code className="av-code">{browserTz}</code>
        </div>
      </div>

      <section className="dt">
        <header className="dt__head">
          <div className="dt__head-text">
            <h2 className="dt__title">Weekly hours</h2>
            <p className="dt__desc">
              {usingDefaults
                ? `Showing defaults — ${initial?.default.description ?? "Mon–Fri 09:00–17:00, 30-minute slots"}. Adjust and save.`
                : `${enabledCount} day${enabledCount === 1 ? "" : "s"} open for bookings.`}
            </p>
          </div>
        </header>

        <div className="dt__scroll">
          <table className="dt__table av-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th>Slot length</th>
                <th>Buffer</th>
              </tr>
            </thead>
            <tbody>
              {WEEKDAYS.map((w) => {
                const d = days[w.value];
                return (
                  <tr key={w.value} className={d.enabled ? "" : "av-row--off"}>
                    <td>
                      <div className="dt-name">
                        <span className="dt-name__main">{w.label}</span>
                        <span className="dt-name__sub">{w.short}</span>
                      </div>
                    </td>
                    <td>
                      <label className="av-toggle">
                        <input
                          type="checkbox"
                          aria-label={`Enable ${w.label}`}
                          checked={d.enabled}
                          onChange={(e) => update(w.value, { enabled: e.target.checked })}
                        />
                        <span className={`dt-pill ${d.enabled ? "dt-pill--green" : "dt-pill--slate"}`}>
                          {d.enabled ? "Open" : "Off"}
                        </span>
                      </label>
                    </td>
                    <td>
                      <input
                        className="av-input"
                        type="time"
                        value={d.start}
                        disabled={!d.enabled}
                        onChange={(e) => update(w.value, { start: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="av-input"
                        type="time"
                        value={d.end}
                        disabled={!d.enabled}
                        onChange={(e) => update(w.value, { end: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        className="av-input"
                        value={d.slot}
                        disabled={!d.enabled}
                        onChange={(e) => update(w.value, { slot: Number(e.target.value) })}
                      >
                        {SLOT_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n} min</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="av-input"
                        value={d.buffer}
                        disabled={!d.enabled}
                        onChange={(e) => update(w.value, { buffer: Number(e.target.value) })}
                      >
                        {BUFFER_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n} min</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="av-foot">
          {msg ? (
            <span className={`av-msg av-msg--${msg.kind}`}>{msg.text}</span>
          ) : (
            <span className="dt-muted av-foot__hint">
              Changes apply to slot offers on the lead page and the public booking link.
            </span>
          )}
          <button
            type="button"
            className="btn btn--primary"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Saving…" : "Save availability"}
          </button>
        </footer>
      </section>
    </>
  );
}
