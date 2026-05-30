"use client";

import Link from "next/link";
import { useState, useTransition, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type ApplicationDetail,
  type ApplicationDecision,
  type ContactDetail,
  type Note,
  type OrgDetail,
  type LeadDetail,
  type LeadStatus,
} from "../../_mock";
import { StageForm } from "./_StageForm";
import {
  updateLeadStageAction,
  addLeadNoteAction,
  editLeadNoteAction,
  decideApplicationAction,
  scheduleMeetingAction,
  cancelMeetingAction,
  rescheduleMeetingAction,
  convertLeadToClientAction,
} from "./_actions";
import type { ClientProgram } from "../../_mock";
import { clientProgramLabels } from "../../_mock";
import { ScheduleMeetingModal } from "./_ScheduleMeetingModal";
import { setBreadcrumbLabel } from "../../_TopBar";
import { useNotifications } from "../../_NotificationsContext";

const statusOrder: LeadStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "qualified",
  "won",
  "lost",
];

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

/**
 * Friendly labels mirroring the public apply form. Keep keys aligned with
 * src/app/apply/page.tsx — when a value isn't recognised (e.g. legacy data)
 * we fall back to the raw enum key.
 */
const applicantStatusLabels: Record<string, string> = {
  "student-final": "Final-year student",
  "graduate-recent": "Recent graduate",
  professional: "Working professional",
  senior: "Senior professional / switcher",
  other: "Something else",
};
const goalLabels: Record<string, string> = {
  "study-abroad": "Study abroad",
  "local-job": "Local job change",
  "international-placement": "International placement",
  pivot: "Career pivot",
  "postgrad-gh": "Postgrad in Ghana",
  other: "Something else",
};
const timelineLabels: Record<string, string> = {
  "0-3": "Within 3 months",
  "3-6": "3 – 6 months",
  "6-12": "6 – 12 months",
  "12+": "Exploring (12+ months)",
};
const budgetLabels: Record<string, string> = {
  self: "Self-funded / family",
  scholarship: "Need scholarship or aid",
  employer: "Employer-sponsored",
  unsure: "Not sure yet",
};
function labelize(map: Record<string, string>, value: string) {
  return map[value] ?? value;
}

function ClientDate({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- locale-formatted date on client only
    setText(new Date(iso).toLocaleString());
  }, [iso]);
  return <span suppressHydrationWarning>{text}</span>;
}

type Toast = { id: number; tone: "success" | "info" | "warn"; message: string };

export function LeadDetailView({
  lead,
  live = true,
  offlineMessage,
}: {
  lead: LeadDetail;
  live?: boolean;
  offlineMessage?: string;
}) {
  const [, startTransition] = useTransition();
  /* ---------- Shared lifecycle state ---------- */
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [decision, setDecision] = useState<ApplicationDecision>(
    lead.application?.decision ?? "pending"
  );
  const [decidedAt, setDecidedAt] = useState<string | null>(
    lead.application?.decided_at ?? null
  );
  const [decisionNote, setDecisionNote] = useState<string>(
    lead.application?.decision_note ?? ""
  );
  const [convertedClientUuid, setConvertedClientUuid] = useState<string | null>(null);

  /* ---------- Ephemeral toast ---------- */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (tone: Toast["tone"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };

  /* ---------- Notes (manual + auto-emitted system) ---------- */
  // Treat the current admin viewer as the seeded admin record. In production
  // this comes from the session.
  const currentUser = { id: 1, name: "Career360 Admin", email: "admin@career360consult.com" };
  const [notes, setNotes] = useState<Note[]>(lead.notes);
  const { setItems: setNotificationItems } = useNotifications();
  useEffect(() => {
    setNotificationItems(
      notes
        .filter((n) => n.kind === "system")
        .slice()
        .reverse()
        .map((n) => ({
          id: `${lead.uuid}-${n.id}`,
          body: n.body,
          created_at: n.created_at,
          source: { leadUuid: lead.uuid, leadName: lead.name },
        }))
    );
  }, [notes, lead.uuid, lead.name, setNotificationItems]);
  // Register the live lead name with the topbar so the breadcrumb shows
  // "Richard Somda" instead of the raw UUID.
  useEffect(() => {
    setBreadcrumbLabel(lead.uuid, lead.name);
  }, [lead.uuid, lead.name]);
  const nextNoteId = () =>
    notes.reduce((m, n) => Math.max(m, n.id), 0) + Math.floor(Math.random() * 1000) + 1;

  const addManualNote = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const tempId = nextNoteId();
    setNotes((ns) => [
      ...ns,
      {
        id: tempId,
        body: trimmed,
        created_at: new Date().toISOString(),
        author: currentUser,
        kind: "manual",
      },
    ]);
    pushToast("success", "Note added.");
    if (!live) return;
    startTransition(async () => {
      const r = await addLeadNoteAction(lead.uuid, trimmed);
      if (!r.ok) {
        pushToast("warn", `Note save failed: ${r.message}`);
        return;
      }
      setNotes((ns) => ns.map((n) => (n.id === tempId ? r.data.note : n)));
    });
  };
  const editNote = (id: number, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, body: trimmed } : n)));
    pushToast("success", "Note updated.");
    if (!live) return;
    startTransition(async () => {
      const r = await editLeadNoteAction(lead.uuid, id, trimmed);
      if (!r.ok) {
        pushToast("warn", `Note update failed: ${r.message}`);
        return;
      }
      // Reconcile updated_at / author from the server's authoritative copy.
      setNotes((ns) => ns.map((n) => (n.id === id ? r.data.note : n)));
    });
  };
  const addSystemNote = (body: string) => {
    // Optimistic only when offline. When live, the backend emits the note and
    // reconciliation in the calling site swaps the whole notes array.
    if (live) return;
    setNotes((ns) => [
      ...ns,
      {
        id: nextNoteId(),
        body,
        created_at: new Date().toISOString(),
        author: currentUser,
        kind: "system",
      },
    ]);
  };

  /* ---------- Decisions: approve / decline ---------- */
  const onDecide = (next: "approved" | "declined", note: string) => {
    setDecision(next);
    setDecidedAt(new Date().toISOString());
    setDecisionNote(note);

    // Auto-advance Lead.status per state machine:
    //   approved → contacted (start of nurture)
    //   declined → lost (archived view)
    if (next === "approved") {
      setStatus("contacted");
      addSystemNote(
        `Application approved · approval email sent to ${lead.email ?? "applicant"}. Status moved to Contacted.${note ? ` Note: ${note}` : ""}`
      );
      pushToast(
        "success",
        `Approval email sent to ${lead.email ?? "the applicant"}. Lead moved to Contacted.`
      );
    } else {
      setStatus("lost");
      addSystemNote(
        `Application declined · decline email sent to ${lead.email ?? "applicant"}. Lead archived to Lost.${note ? ` Note: ${note}` : ""}`
      );
      pushToast(
        "info",
        `Decline email sent to ${lead.email ?? "the applicant"}. Lead archived to Lost.`
      );
    }
    if (!live) return;
    startTransition(async () => {
      const r = await decideApplicationAction(lead.uuid, { decision: next, note });
      if (!r.ok) {
        pushToast("warn", `Decision failed to save: ${r.message}`);
        return;
      }
      // Swap optimistic system note for the server-emitted one (real id +
      // backend-formatted body so the timeline stays canonical).
      if (r.data.lead.notes) setNotes(r.data.lead.notes);
    });
  };

  /**
   * When the admin moves the lead through Stage manually, keep the application
   * decision pill in sync. Anything past `new` implies an approval; `lost`
   * implies a decline; bouncing back to `new` resets to pending.
   */
  const hasApplication = !!lead.application;
  const handleStatusChange = (next: LeadStatus) => {
    if (next === status) return;
    const previous = status;
    setStatus(next);
    if (!hasApplication) return;
    if (next === "new") {
      setDecision("pending");
      setDecidedAt(null);
    } else if (next === "lost") {
      setDecision("declined");
      setDecidedAt(new Date().toISOString());
    } else {
      // contacted / scheduled / qualified / won
      setDecision("approved");
      setDecidedAt(new Date().toISOString());
    }
    addSystemNote(
      `Status changed ${statusLabels[previous]} → ${statusLabels[next]} via Stage panel.`
    );
    if (!live) return;
    startTransition(async () => {
      const r = await updateLeadStageAction(lead.uuid, { status: next });
      if (!r.ok) {
        pushToast("warn", `Stage save failed: ${r.message}`);
        return;
      }
      if (r.data.lead.notes) setNotes(r.data.lead.notes);
    });
  };

  const canSchedule = status !== "new";

  return (
    <div className="admin-page admin-detail">
      <Link href="/admin/leads" className="admin-back">
        <svg
          className="admin-back__icon"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12.5 4.5 7 10l5.5 5.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to leads
      </Link>

      {!live && (
        <p className="admin-gated" role="status">
          {offlineMessage ?? "Backend unavailable — changes won't persist."}
        </p>
      )}

      <header className="admin-detail__head">
        <div>
          <h1 className="h2">{lead.name}</h1>
          <div className="admin-detail__contact">
            {lead.email && <span>{lead.email}</span>}
            {lead.phone && <span>{lead.phone}</span>}
            {lead.source && <span className="admin-muted">via {lead.source}</span>}
          </div>
        </div>
        <div className="admin-detail__meta">
          <span className={`admin-pill admin-pill--${status}`}>
            {statusLabels[status]}
          </span>
          <span className="admin-muted">
            Created <ClientDate iso={lead.created_at} />
          </span>
        </div>
      </header>

      <div className="admin-detail__grid">
        <div className="admin-detail__main">
          {lead.contact_message && <ContactCard data={lead.contact_message} />}
          {lead.org_inquiry && <OrgCard data={lead.org_inquiry} />}
          {lead.application && (
            <ApplicationCard
              data={lead.application}
              decision={decision}
              decidedAt={decidedAt}
              decisionNote={decisionNote}
              onDecide={onDecide}
            />
          )}

          <NotesCard notes={notes.filter((n) => n.kind !== "system")} onAdd={addManualNote} onEdit={editNote} />
          <MeetingsCard
            lead={lead}
            canSchedule={canSchedule}
            applicantEmail={lead.email}
            onScheduled={(when) => {
              setStatus("scheduled");
              addSystemNote(
                `Meeting scheduled for ${new Date(when).toLocaleString()} · calendar invite sent to ${lead.email ?? "applicant"}.`
              );
              pushToast(
                "success",
                `Meeting set for ${new Date(when).toLocaleString()}. Calendar invite sent.`
              );
              if (!live) return;
              startTransition(async () => {
                const r = await scheduleMeetingAction(lead.uuid, { scheduled_at: when });
                if (!r.ok) {
                  pushToast("warn", `Meeting failed to save: ${r.message}`);
                  return;
                }
                // Reconcile the optimistic system note with the backend's.
                if (r.data.lead.notes) setNotes(r.data.lead.notes);
              });
            }}
            onCancelMeeting={(meetingId) => {
              if (!window.confirm("Cancel this meeting? The Google Calendar event will also be removed and the attendee notified.")) return;
              if (!live) {
                pushToast("info", "Meeting canceled (mock mode).");
                return;
              }
              startTransition(async () => {
                const r = await cancelMeetingAction(lead.uuid, meetingId);
                if (!r.ok) {
                  pushToast("warn", `Cancel failed: ${r.message}`);
                  return;
                }
                pushToast("success", "Meeting canceled.");
                window.location.reload();
              });
            }}
            onReschedule={(meetingId, when) => {
              addSystemNote(
                `Meeting rescheduled to ${new Date(when).toLocaleString()}.`
              );
              pushToast(
                "success",
                `Meeting moved to ${new Date(when).toLocaleString()}.`
              );
              if (!live) return;
              startTransition(async () => {
                const r = await rescheduleMeetingAction(lead.uuid, meetingId, when);
                if (!r.ok) {
                  pushToast("warn", `Reschedule failed: ${r.message}`);
                  return;
                }
                window.location.reload();
              });
            }}
          />
        </div>

        <aside className="admin-detail__side">
          <div className="admin-side-stack">
            <section className="admin-panel">
              <header className="admin-panel__head">
                <h2 className="h3">Stage</h2>
              </header>
              <StageForm
                status={status}
                assigneeId={
                  lead.assigned_user?.id ? String(lead.assigned_user.id) : ""
                }
                statuses={statusOrder}
                statusLabels={statusLabels}
                assignees={[
                  { id: 1, name: "Career360 Admin" },
                  { id: 2, name: "Akua Mensah" },
                ]}
                onStatusChange={handleStatusChange}
                onSave={({ status: nextStatus, assignedUserId }) => {
                  pushToast("success", "Stage saved.");
                  if (!live) return;
                  startTransition(async () => {
                    const r = await updateLeadStageAction(lead.uuid, {
                      status: nextStatus,
                      assigned_user_id: assignedUserId,
                    });
                    if (!r.ok) pushToast("warn", `Stage save failed: ${r.message}`);
                  });
                }}
              />
            </section>

            {status === "won" && (
              <ConvertToClientPanel
                disabled={!live}
                convertedClientUuid={convertedClientUuid}
                onConvert={(program) => {
                  if (!live) {
                    pushToast("warn", "Backend unavailable — cannot convert.");
                    return;
                  }
                  startTransition(async () => {
                    const r = await convertLeadToClientAction(lead.uuid, { program });
                    if (!r.ok) {
                      pushToast("warn", `Conversion failed: ${r.message}`);
                      return;
                    }
                    setConvertedClientUuid(r.data.client.uuid);
                    if (r.data.lead.notes) setNotes(r.data.lead.notes);
                    pushToast(
                      "success",
                      r.data.already_converted
                        ? "Lead was already converted."
                        : "Lead converted to client.",
                    );
                  });
                }}
              />
            )}

            <section className="admin-panel">
              <header className="admin-panel__head">
                <h2 className="h3">Details</h2>
              </header>
              <dl className="admin-dl">
                <div><dt>Lead ID</dt><dd>#{lead.id}</dd></div>
                <div><dt>Created</dt><dd>{fmtCompactDateTime(lead.created_at)}</dd></div>
                <div><dt>Updated</dt><dd>{fmtCompactDateTime(lead.updated_at)}</dd></div>
                {lead.scheduled_at && (
                  <div><dt>Next meeting</dt><dd>{fmtCompactDateTime(lead.scheduled_at)}</dd></div>
                )}
              </dl>
            </section>
          </div>
        </aside>
      </div>

      {/* Toasts (mock-side feedback for actions that will be backend calls) */}
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

function ContactCard({ data }: { data: ContactDetail }) {
  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Message</h2>
        <span className="admin-muted">topic: {data.topic}</span>
      </header>
      <p className="admin-prose">{data.message}</p>
    </article>
  );
}

function OrgCard({ data }: { data: OrgDetail }) {
  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Organization inquiry</h2>
      </header>
      <dl className="admin-dl">
        <div><dt>Role</dt><dd>{data.role}</dd></div>
        <div><dt>Organization</dt><dd>{data.organization}</dd></div>
        <div><dt>Preferred contact</dt><dd>{data.contact_kind} — {data.contact_value}</dd></div>
      </dl>
      <p className="admin-prose">{data.about}</p>
    </article>
  );
}

function ApplicationCard({
  data,
  decision,
  decidedAt,
  decisionNote,
  onDecide,
}: {
  data: ApplicationDetail;
  decision: ApplicationDecision;
  decidedAt: string | null;
  decisionNote: string;
  onDecide: (next: "approved" | "declined", note: string) => void;
}) {
  const [draftNote, setDraftNote] = useState<string>(decisionNote);
  const settled = decision !== "pending";

  const decisionLabel =
    decision === "approved"
      ? "Approved"
      : decision === "declined"
        ? "Declined"
        : "Pending review";

  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Application</h2>
        <span className={`admin-pill admin-pill--decision-${decision}`}>
          {decisionLabel}
        </span>
      </header>

      {settled && (
        <div className={`admin-decision-banner admin-decision-banner--${decision}`}>
          <strong>{decisionLabel}</strong>
          {decidedAt && (
            <span className="admin-muted"> on <ClientDate iso={decidedAt} /></span>
          )}
          {decisionNote && <p>{decisionNote}</p>}
        </div>
      )}

      <dl className="admin-dl admin-dl--grid">
        <div><dt>Current status</dt><dd>{labelize(applicantStatusLabels, data.status_self)}{data.status_other ? ` — ${data.status_other}` : ""}</dd></div>
        <div><dt>Location</dt><dd>{data.location}</dd></div>
        <div><dt>Field</dt><dd>{data.field}</dd></div>
        <div><dt>Goal</dt><dd>{labelize(goalLabels, data.goal)}{data.goal_other ? ` — ${data.goal_other}` : ""}</dd></div>
        <div><dt>Timeline</dt><dd>{labelize(timelineLabels, data.timeline)}</dd></div>
        <div><dt>Budget</dt><dd>{labelize(budgetLabels, data.budget)}</dd></div>
        <div><dt>Newsletter</dt><dd>{data.newsletter ? "Yes" : "No"}</dd></div>
        <div>
          <dt>Target countries</dt>
          <dd>{data.targets.length ? data.targets.join(", ") : "—"}</dd>
        </div>
      </dl>
      {data.story && (
        <>
          <h3 className="admin-subhead">Their story</h3>
          <p className="admin-prose">{data.story}</p>
        </>
      )}
      {data.files.length > 0 && (
        <>
          <h3 className="admin-subhead">Files</h3>
          <ul className="admin-files">
            {data.files.map((f) => {
              const isUrl = /^https?:\/\//i.test(f.path);
              return (
                <li key={f.id}>
                  <span className="admin-files__name">{f.original_name}</span>
                  <span className="admin-files__meta">
                    {f.mime ?? "file"} · {formatBytes(f.size)}
                  </span>
                  {isUrl ? (
                    <a
                      href={f.path}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      download={f.original_name}
                    >
                      Download
                    </a>
                  ) : (
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" disabled>
                      Download
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h3 className="admin-subhead">Decision</h3>
      {settled ? (
        <p className="admin-muted admin-muted--sm">
          Decision recorded. The applicant has been emailed.
        </p>
      ) : (
        <div className="admin-decision-form">
          <textarea
            name="note"
            rows={2}
            placeholder="Optional note shared with the applicant."
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
          />
          <div className="admin-decision-form__actions">
            <button
              type="button"
              className="admin-btn admin-btn--solid admin-btn--sm"
              onClick={() => onDecide("approved", draftNote)}
            >
              Approve application
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger"
              onClick={() => onDecide("declined", draftNote)}
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function NotesCard({
  notes,
  onAdd,
  onEdit,
}: {
  notes: Note[];
  onAdd: (body: string) => void;
  onEdit: (id: number, body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [open, setOpen] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  };

  const startEdit = (n: Note) => {
    setEditingId(n.id);
    setEditingBody(n.body);
  };
  const saveEdit = () => {
    if (editingId == null) return;
    onEdit(editingId, editingBody);
    setEditingId(null);
    setEditingBody("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingBody("");
  };

  // Render newest at the top — feels right for an audit-log style stack.
  const sorted = [...notes].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <article className="admin-panel admin-accordion">
      <button
        type="button"
        className="admin-panel__head admin-accordion__head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="h3">Notes</h2>
        <span className="admin-accordion__meta">
          <span className="admin-muted">{notes.length}</span>
          <svg
            className={`admin-accordion__chevron${open ? " admin-accordion__chevron--open" : ""}`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5.5 7.5 10 12l4.5-4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            className="admin-accordion__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <form className="admin-note-form" onSubmit={handleAdd}>
              <textarea
                name="body"
                rows={3}
                placeholder="Add a note for the team — only visible internally."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="admin-note-form__foot">
                <button
                  type="submit"
                  className="admin-btn admin-btn--solid admin-btn--sm"
                  disabled={!draft.trim()}
                >
                  Add note
                </button>
              </div>
            </form>
            {sorted.length === 0 ? (
              <p className="admin-empty">No notes yet.</p>
            ) : (
              <ul className="admin-notes">
                {sorted.map((n) => {
                  const isSystem = n.kind === "system";
                  const isEditing = editingId === n.id;
                  return (
                    <li
                      key={n.id}
                      className={
                        isSystem
                          ? "admin-notes__item admin-notes__item--system"
                          : "admin-notes__item"
                      }
                    >
                      <div className="admin-notes__head">
                        <strong>{isSystem ? "System" : n.author.name}</strong>
                        <span className="admin-muted" suppressHydrationWarning>
                          <ClientDate iso={n.created_at} />
                        </span>
                        {!isSystem && !isEditing && (
                          <button
                            type="button"
                            className="admin-notes__edit"
                            onClick={() => startEdit(n)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="admin-notes__edit-form">
                          <textarea
                            rows={3}
                            value={editingBody}
                            onChange={(e) => setEditingBody(e.target.value)}
                          />
                          <div className="admin-notes__edit-actions">
                            <button
                              type="button"
                              className="admin-btn admin-btn--solid admin-btn--sm"
                              onClick={saveEdit}
                              disabled={
                                !editingBody.trim() ||
                                editingBody.trim() === n.body
                              }
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="admin-stage-form__discard"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{n.body}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function MeetingActionsMenu({
  onReschedule,
  onCancel,
}: {
  onReschedule?: () => void;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="admin-more" ref={ref}>
      <button
        type="button"
        className="admin-more__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" width={18} height={18}>
          <circle cx="10" cy="4" r="1.6" fill="currentColor" />
          <circle cx="10" cy="10" r="1.6" fill="currentColor" />
          <circle cx="10" cy="16" r="1.6" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="admin-more__menu" role="menu">
          {onReschedule && (
            <button
              type="button"
              role="menuitem"
              className="admin-more__item"
              onClick={() => {
                setOpen(false);
                onReschedule();
              }}
            >
              Reschedule
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="admin-more__item admin-more__item--danger"
            onClick={() => {
              setOpen(false);
              onCancel();
            }}
          >
            Cancel meeting
          </button>
        </div>
      )}
    </div>
  );
}

function MeetingsCard({
  lead,
  canSchedule,
  applicantEmail,
  onScheduled,
  onCancelMeeting,
  onReschedule,
}: {
  lead: LeadDetail;
  canSchedule: boolean;
  applicantEmail: string | null;
  onScheduled: (when: string) => void;
  onCancelMeeting?: (meetingId: number) => void;
  onReschedule?: (meetingId: number, when: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);

  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Meetings</h2>
        <div className="admin-panel__head-actions">
          <span className="admin-muted">{lead.meetings.length}</span>
          {canSchedule && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setModalOpen(true)}
            >
              Schedule meeting
            </button>
          )}
        </div>
      </header>

      {!canSchedule && (
        <div className="admin-gated">
          <strong>Move this lead to <em>Contacted</em> before scheduling.</strong>
          <p>
            Approve the application or update the Stage panel — that step
            confirms first contact has been made and unlocks meeting
            scheduling.
          </p>
        </div>
      )}

      {lead.meetings.length === 0 ? (
        <p className="admin-empty">No meetings scheduled.</p>
      ) : (
        <ul className="admin-meetings">
          {[...lead.meetings]
            .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
            .map((m) => (
            <li key={m.id}>
              <div className="admin-meetings__head">
                <span className="admin-meetings__when">
                  <strong><ClientDate iso={m.scheduled_at} /></strong>
                  {m.scheduler && (
                    <span className="admin-muted"> · Scheduled by {m.scheduler.name}</span>
                  )}
                </span>
                <span className={`admin-pill admin-pill--${m.status}`}>{m.status}</span>
              </div>
              {m.notes && <p>{m.notes}</p>}
              <div className="admin-meetings__meta">
                {m.google_meet_link && m.status !== "canceled" && (
                  <a
                    href={m.google_meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--primary btn--sm admin-meet-btn"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg"
                      alt=""
                    />
                    Join Meet
                  </a>
                )}
                {onCancelMeeting && m.status !== "canceled" && (
                  <MeetingActionsMenu
                    onReschedule={
                      onReschedule
                        ? () => {
                            setReschedulingId(m.id);
                            setModalOpen(true);
                          }
                        : undefined
                    }
                    onCancel={() => onCancelMeeting(m.id)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ScheduleMeetingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setReschedulingId(null);
        }}
        applicantEmail={applicantEmail}
        mode={reschedulingId != null ? "reschedule" : "schedule"}
        onPick={(when) => {
          if (reschedulingId != null && onReschedule) {
            onReschedule(reschedulingId, when);
          } else {
            onScheduled(when);
          }
          setModalOpen(false);
          setReschedulingId(null);
        }}
      />
    </article>
  );
}

/* ===================== Helpers ===================== */

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtCompactDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

/* ===================== Convert to Client ===================== */

const convertProgramOptions: ClientProgram[] = [
  "study-abroad",
  "scholarship",
  "career-coaching",
  "test-prep",
  "org-partnership",
];

function ConvertToClientPanel({
  disabled,
  convertedClientUuid,
  onConvert,
}: {
  disabled?: boolean;
  convertedClientUuid: string | null;
  onConvert: (program: ClientProgram) => void;
}) {
  const [program, setProgram] = useState<ClientProgram>("study-abroad");

  if (convertedClientUuid) {
    return (
      <section className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="h3">Client engagement</h2>
        </header>
        <p className="admin-muted">Lead has been converted to a client.</p>
        <Link className="admin-btn admin-btn--solid" href={`/admin/clients/${convertedClientUuid}`}>
          Open client
        </Link>
      </section>
    );
  }

  return (
    <section className="admin-panel admin-convert">
      <header className="admin-panel__head">
        <h2 className="h3">Convert to client</h2>
      </header>
      <p className="admin-muted admin-convert__lede">
        Promote this won lead to an active client engagement.
      </p>
      <label className="admin-field">
        <span className="admin-field__label">Program</span>
        <select
          className="admin-input"
          value={program}
          onChange={(e) => setProgram(e.target.value as ClientProgram)}
          disabled={disabled}
        >
          {convertProgramOptions.map((p) => (
            <option key={p} value={p}>{clientProgramLabels[p]}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="admin-btn admin-btn--solid admin-convert__submit"
        disabled={disabled}
        onClick={() => onConvert(program)}
      >
        Convert to client
      </button>
    </section>
  );
}
