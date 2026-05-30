"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  clientProgramLabels,
  clientStatusLabels,
  type Client,
  type ClientStatus,
} from "../../_mock";
import { useNotifications } from "../../_NotificationsContext";
import { updateClientAction, type UpdateClientPayload } from "./_actions";

type Assignee = { id: number; name: string };

const statusOrder: ClientStatus[] = [
  "onboarding",
  "active",
  "on_hold",
  "completed",
  "churned",
];

type Toast = { id: number; tone: "success" | "warn"; message: string };

function ClientDate({ iso }: { iso: string | null | undefined }) {
  const [s, setS] = useState<string>("");
  useEffect(() => {
    if (!iso) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- locale-formatted date on client only
    setS(new Date(iso).toLocaleString());
  }, [iso]);
  if (!iso) return <>—</>;
  return <>{s || iso.slice(0, 10)}</>;
}

function ClientDay({ iso }: { iso: string | null | undefined }) {
  const [s, setS] = useState<string>("");
  useEffect(() => {
    if (!iso) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- locale-formatted date on client only
    setS(new Date(iso).toLocaleDateString());
  }, [iso]);
  if (!iso) return <>—</>;
  return <>{s || iso.slice(0, 10)}</>;
}

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ClientDetailView({
  client: initial,
  live,
  offlineMessage,
}: {
  client: Client;
  live: boolean;
  offlineMessage?: string;
}) {
  const [client, setClient] = useState<Client>(initial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [, startTransition] = useTransition();
  const { push: pushNotification } = useNotifications();

  const assignees: Assignee[] = [
    { id: 1, name: "Career360 Admin" },
    { id: 2, name: "Akua Mensah" },
  ];

  function pushToast(tone: Toast["tone"], message: string) {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, tone, message }]);
    setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 3200);
  }

  function persist(payload: UpdateClientPayload, optimistic: Partial<Client>) {
    setClient((c) => ({ ...c, ...optimistic } as Client));
    if (!live) {
      pushToast("warn", "Backend offline — mock only.");
      return;
    }
    startTransition(async () => {
      const r = await updateClientAction(client.uuid, payload);
      if (!r.ok) {
        pushToast("warn", `Save failed: ${r.message}`);
        return;
      }
      setClient(r.data.client);
      pushToast("success", "Saved.");
    });
  }

  return (
    <div className="admin-detail">
      <header className="admin-detail__head">
        <div>
          <Link href="/admin/clients" className="admin-link-btn">← All clients</Link>
          <h1 className="h2" style={{ margin: "0.35rem 0 0" }}>{client.name}</h1>
          <p className="admin-muted" style={{ margin: "0.25rem 0 0" }}>
            {clientProgramLabels[client.program]}
            {client.source_lead_id != null && (
              <> · Converted from lead #{client.source_lead_id}</>
            )}
          </p>
        </div>
        <span className={`admin-pill admin-pill--${client.status}`}>
          {clientStatusLabels[client.status]}
        </span>
      </header>

      {!live && (
        <div className="admin-toast admin-toast--warn" style={{ margin: "1rem 0" }}>
          {offlineMessage ?? "Showing mock data — backend unavailable."}
        </div>
      )}

      <div className="admin-stack" style={{ marginTop: "1rem", gap: "1.25rem" }}>
        <div className="admin-grid admin-grid--2col">
          <section className="admin-panel">
            <header className="admin-panel__head">
              <h2 className="h3" style={{ whiteSpace: "nowrap" }}>Status</h2>
            </header>
            <StatusForm
              status={client.status}
              consultantId={client.consultant?.id ?? null}
              assignees={assignees}
              onSave={({ status, consultant_id }) =>
                persist(
                  { status, consultant_id },
                  {
                    status,
                    consultant: consultant_id
                      ? assignees
                          .filter((a) => a.id === consultant_id)
                          .map((a) => ({ id: a.id, name: a.name, email: "" }))[0] ?? client.consultant
                      : null,
                  },
                )
              }
            />
          </section>

          <section className="admin-panel">
            <header className="admin-panel__head">
              <h2 className="h3" style={{ whiteSpace: "nowrap" }}>Details</h2>
            </header>
            <dl className="admin-dl">
              <div><dt>Client ID</dt><dd>#{client.id}</dd></div>
              <div><dt>Program</dt><dd>{clientProgramLabels[client.program]}</dd></div>
              <div><dt>Start date</dt><dd><ClientDay iso={client.start_date} /></dd></div>
              {client.source_lead_id != null && (
                <div>
                  <dt>Source lead</dt>
                  <dd>
                    <Link href={`/admin/leads`} className="admin-link">
                      Lead #{client.source_lead_id}
                    </Link>
                  </dd>
                </div>
              )}
              <div><dt>Created</dt><dd><ClientDate iso={client.created_at} /></dd></div>
              <div><dt>Updated</dt><dd><ClientDate iso={client.updated_at} /></dd></div>
            </dl>
          </section>
        </div>

        <ContactCard client={client} />
        <NextMilestoneCard
          client={client}
          onSave={(label, dueIso) =>
            persist(
              { next_milestone_label: label, next_milestone_due_at: dueIso },
              {
                next_milestone:
                  label && dueIso ? { label, due_at: dueIso } : null,
              },
            )
          }
        />
        <SatisfactionCard
          value={client.satisfaction}
          onChange={(v) =>
            persist({ satisfaction: v }, { satisfaction: v })
          }
        />
        <ActivityHintCard
          onAddNote={(msg) => {
            pushNotification({
              id: String(Date.now()),
              body: msg,
              created_at: new Date().toISOString(),
            });
            pushToast("success", "Note posted to notifications bell.");
          }}
        />
      </div>

      <div className="admin-toast-stack" aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`admin-toast admin-toast--${t.tone}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ===================== Cards ===================== */

function ContactCard({ client }: { client: Client }) {
  return (
    <article className="admin-panel">
      <header className="admin-panel__head"><h2 className="h3">Contact</h2></header>
      <dl className="admin-dl">
        <div>
          <dt>Email</dt>
          <dd>
            {client.email ? (
              <a className="admin-link" href={`mailto:${client.email}`}>{client.email}</a>
            ) : "—"}
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            {client.phone ? (
              <a className="admin-link" href={`tel:${client.phone}`}>{client.phone}</a>
            ) : "—"}
          </dd>
        </div>
        <div>
          <dt>Consultant</dt>
          <dd>{client.consultant?.name ?? "Unassigned"}</dd>
        </div>
      </dl>
    </article>
  );
}

function NextMilestoneCard({
  client,
  onSave,
}: {
  client: Client;
  onSave: (label: string | null, dueIso: string | null) => void;
}) {
  const [label, setLabel] = useState<string>(client.next_milestone?.label ?? "");
  const [due, setDue] = useState<string>(
    toLocalInputValue(client.next_milestone?.due_at),
  );
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync form fields when parent milestone changes */
    setLabel(client.next_milestone?.label ?? "");
    setDue(toLocalInputValue(client.next_milestone?.due_at));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [client.next_milestone?.label, client.next_milestone?.due_at]);

  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3" style={{ whiteSpace: "nowrap" }}>Next milestone</h2>
        {!editing && (
          <button type="button" className="admin-link-btn" onClick={() => setEditing(true)}>
            {client.next_milestone ? "Edit" : "Add"}
          </button>
        )}
      </header>

      {!editing && (
        client.next_milestone ? (
          <p style={{ margin: 0 }}>
            <strong>{client.next_milestone.label}</strong>{" "}
            <span className="admin-muted">
              · due <ClientDay iso={client.next_milestone.due_at} />
            </span>
          </p>
        ) : (
          <p className="admin-muted" style={{ margin: 0 }}>No upcoming milestone.</p>
        )
      )}

      {editing && (
        <form
          className="admin-stack"
          style={{ gap: "0.65rem", marginTop: "0.4rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            const iso = due ? new Date(due).toISOString() : null;
            onSave(label || null, iso);
            setEditing(false);
          }}
        >
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="ms-label">Label</label>
            <input
              id="ms-label"
              className="admin-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. SOP first draft"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="ms-due">Due</label>
            <input
              id="ms-due"
              type="datetime-local"
              className="admin-input"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="admin-btn admin-btn--solid admin-btn--sm">Save</button>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              onClick={() => {
                onSave(null, null);
                setEditing(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

function SatisfactionCard({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <article className="admin-panel">
      <header className="admin-panel__head"><h2 className="h3">Satisfaction</h2></header>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value != null && n <= value;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} of 5`}
              onClick={() => onChange(value === n ? null : n)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "1.5rem",
                lineHeight: 1,
                padding: "0 0.1rem",
                color: active ? "#f5a524" : "#cfcfcf",
              }}
            >
              ★
            </button>
          );
        })}
        <span className="admin-muted" style={{ marginLeft: "0.5rem", whiteSpace: "nowrap" }}>
          {value != null ? `${value}/5` : "Not rated"}
        </span>
      </div>
    </article>
  );
}

function ActivityHintCard({ onAddNote }: { onAddNote: (msg: string) => void }) {
  const [draft, setDraft] = useState<string>("");
  return (
    <article className="admin-panel">
      <header className="admin-panel__head"><h2 className="h3">Quick note</h2></header>
      <p className="admin-muted" style={{ marginTop: 0 }}>
        Drop a quick update — it&apos;ll show in the notifications bell. (Persistent
        client notes coming soon.)
      </p>
      <form
        className="admin-stack"
        style={{ gap: "0.5rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          onAddNote(draft.trim());
          setDraft("");
        }}
      >
        <textarea
          className="admin-input"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Sent shortlist of 6 schools."
        />
        <div>
          <button
            type="submit"
            className="admin-btn admin-btn--solid admin-btn--sm"
            disabled={!draft.trim()}
          >
            Post
          </button>
        </div>
      </form>
    </article>
  );
}

/* ===================== Status form ===================== */

function StatusForm({
  status,
  consultantId,
  assignees,
  onSave,
}: {
  status: ClientStatus;
  consultantId: number | null;
  assignees: Assignee[];
  onSave: (p: { status: ClientStatus; consultant_id: number | null }) => void;
}) {
  const [localStatus, setLocalStatus] = useState<ClientStatus>(status);
  const [localConsultant, setLocalConsultant] = useState<string>(
    consultantId ? String(consultantId) : "",
  );
  const [savedStatus, setSavedStatus] = useState<ClientStatus>(status);
  const [savedConsultant, setSavedConsultant] = useState<string>(
    consultantId ? String(consultantId) : "",
  );

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- rebaseline when parent status changes */
    setLocalStatus(status);
    setSavedStatus(status);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [status]);

  useEffect(() => {
    const v = consultantId ? String(consultantId) : "";
    /* eslint-disable react-hooks/set-state-in-effect -- rebaseline when parent consultant changes */
    setLocalConsultant(v);
    setSavedConsultant(v);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [consultantId]);

  const dirty = localStatus !== savedStatus || localConsultant !== savedConsultant;

  return (
    <form
      className="admin-stack admin-stage-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSavedStatus(localStatus);
        setSavedConsultant(localConsultant);
        onSave({
          status: localStatus,
          consultant_id: localConsultant ? Number(localConsultant) : null,
        });
      }}
    >
      <label>
        <span>Status</span>
        <select
          value={localStatus}
          onChange={(e) => setLocalStatus(e.target.value as ClientStatus)}
        >
          {statusOrder.map((s) => (
            <option key={s} value={s}>{clientStatusLabels[s]}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Consultant</span>
        <select
          value={localConsultant}
          onChange={(e) => setLocalConsultant(e.target.value)}
        >
          <option value="">Unassigned</option>
          {assignees.map((a) => (
            <option key={a.id} value={String(a.id)}>{a.name}</option>
          ))}
        </select>
      </label>

      <AnimatePresence initial={false}>
        {dirty && (
          <motion.div
            key="actions"
            className="admin-stage-form__actions"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button type="submit" className="admin-btn admin-btn--solid admin-btn--sm">
              Save
            </button>
            <button
              type="button"
              className="admin-stage-form__discard"
              onClick={() => {
                setLocalStatus(savedStatus);
                setLocalConsultant(savedConsultant);
              }}
            >
              Discard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
