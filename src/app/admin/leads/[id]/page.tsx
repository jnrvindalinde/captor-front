import Link from "next/link";
import { notFound } from "next/navigation";
import {
  mockDetails,
  type ApplicationDetail,
  type ContactDetail,
  type OrgDetail,
  type LeadDetail,
  type LeadStatus,
} from "../../_mock";

type Params = Promise<{ id: string }>;

const statusOrder: LeadStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "qualified",
  "won",
  "lost",
];

const kindLabels = {
  contact: "Contact",
  org: "Organization",
  application: "Application",
} as const;

export default async function LeadDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const lead = mockDetails[Number(id)];
  if (!lead) notFound();

  return (
    <div className="admin-page admin-detail">
      <nav aria-label="Breadcrumb" className="admin-crumbs">
        <Link href="/admin/leads">Leads</Link>
        <span aria-hidden>/</span>
        <span>{lead.name}</span>
      </nav>

      <header className="admin-detail__head">
        <div>
          <span className={`admin-kind admin-kind--${lead.kind}`}>
            {kindLabels[lead.kind]}
          </span>
          <h1 className="h2">{lead.name}</h1>
          <div className="admin-detail__contact">
            {lead.email && <span>{lead.email}</span>}
            {lead.phone && <span>{lead.phone}</span>}
            {lead.source && <span className="admin-muted">via {lead.source}</span>}
          </div>
        </div>
        <div className="admin-detail__meta">
          <span className={`admin-pill admin-pill--${lead.status}`}>{lead.status}</span>
          <span className="admin-muted">
            Created {new Date(lead.created_at).toLocaleString()}
          </span>
        </div>
      </header>

      <div className="admin-detail__grid">
        <div className="admin-detail__main">
          {lead.contact_message && <ContactCard data={lead.contact_message} />}
          {lead.org_inquiry && <OrgCard data={lead.org_inquiry} />}
          {lead.application && <ApplicationCard data={lead.application} />}

          <NotesCard lead={lead} />
          <MeetingsCard lead={lead} />
        </div>

        <aside className="admin-detail__side">
          <SidePanel lead={lead} />
        </aside>
      </div>
    </div>
  );
}

/* ----------------------- Kind-specific blocks ----------------------- */

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

function ApplicationCard({ data }: { data: ApplicationDetail }) {
  const decisionLabel =
    data.decision === "approved" ? "Approved" : data.decision === "declined" ? "Declined" : "Pending review";
  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Application</h2>
        <span className={`admin-pill admin-pill--decision-${data.decision}`}>{decisionLabel}</span>
      </header>

      {data.decision !== "pending" && (
        <div className={`admin-decision-banner admin-decision-banner--${data.decision}`}>
          <strong>{decisionLabel}</strong>
          {data.decided_at && (
            <span className="admin-muted"> on {new Date(data.decided_at).toLocaleDateString()}</span>
          )}
          {data.decision_note && <p>{data.decision_note}</p>}
        </div>
      )}

      <dl className="admin-dl admin-dl--grid">
        <div><dt>Current status</dt><dd>{data.status_self}{data.status_other ? ` — ${data.status_other}` : ""}</dd></div>
        <div><dt>Location</dt><dd>{data.location}</dd></div>
        <div><dt>Field</dt><dd>{data.field}</dd></div>
        <div><dt>Goal</dt><dd>{data.goal}{data.goal_other ? ` — ${data.goal_other}` : ""}</dd></div>
        <div><dt>Timeline</dt><dd>{data.timeline} months</dd></div>
        <div><dt>Budget</dt><dd>{data.budget}</dd></div>
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
            {data.files.map((f) => (
              <li key={f.id}>
                <span className="admin-files__name">{f.original_name}</span>
                <span className="admin-files__meta">
                  {f.mime ?? "file"} · {formatBytes(f.size)}
                </span>
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm">
                  Download
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className="admin-subhead">Decision</h3>
      <form className="admin-decision-form" action="#">
        <textarea
          name="note"
          rows={2}
          placeholder="Optional note shared with the applicant."
          defaultValue={data.decision_note ?? ""}
        />
        <div className="admin-decision-form__actions">
          <button
            type="submit"
            name="decision"
            value="approved"
            className="admin-btn admin-btn--solid admin-btn--sm"
          >
            Approve application
          </button>
          <button
            type="submit"
            name="decision"
            value="declined"
            className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger"
          >
            Decline
          </button>
        </div>
      </form>
    </article>
  );
}

/* ----------------------- Notes + Meetings ----------------------- */

function NotesCard({ lead }: { lead: LeadDetail }) {
  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Notes</h2>
        <span className="admin-muted">{lead.notes.length}</span>
      </header>
      <form className="admin-note-form" action="#">
        <textarea
          name="body"
          rows={3}
          placeholder="Add a note for the team — only visible internally."
        />
        <div className="admin-note-form__foot">
          <button type="submit" className="admin-btn admin-btn--solid admin-btn--sm">
            Add note
          </button>
        </div>
      </form>
      {lead.notes.length === 0 ? (
        <p className="admin-empty">No notes yet.</p>
      ) : (
        <ul className="admin-notes">
          {lead.notes.map((n) => (
            <li key={n.id}>
              <div className="admin-notes__head">
                <strong>{n.author.name}</strong>
                <span className="admin-muted">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p>{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function MeetingsCard({ lead }: { lead: LeadDetail }) {
  return (
    <article className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="h3">Meetings</h2>
        <span className="admin-muted">{lead.meetings.length}</span>
      </header>

      <form className="admin-meeting-form" action="#">
        <div className="admin-meeting-form__row">
          <label>
            <span>Date / time</span>
            <input type="datetime-local" name="scheduled_at" required />
          </label>
          <label>
            <span>Notes (optional)</span>
            <input type="text" name="notes_short" placeholder="e.g. Discovery call · 30 min" />
          </label>
        </div>
        <p className="admin-muted admin-muted--sm">
          A Google Calendar event with a Google Meet link will be created automatically and emailed to the lead.
        </p>
        <div>
          <button type="submit" className="admin-btn admin-btn--solid admin-btn--sm">
            Schedule meeting
          </button>
        </div>
      </form>

      {lead.meetings.length === 0 ? (
        <p className="admin-empty">No meetings scheduled.</p>
      ) : (
        <ul className="admin-meetings">
          {lead.meetings.map((m) => (
            <li key={m.id}>
              <div className="admin-meetings__head">
                <strong>{new Date(m.scheduled_at).toLocaleString()}</strong>
                <span className={`admin-pill admin-pill--${m.status}`}>{m.status}</span>
              </div>
              {m.notes && <p>{m.notes}</p>}
              <div className="admin-meetings__meta">
                {m.scheduler && <span>Scheduled by {m.scheduler.name}</span>}
                {m.google_meet_link && (
                  <a href={m.google_meet_link} target="_blank" rel="noreferrer">
                    Join Google Meet ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/* ----------------------- Sidebar ----------------------- */

function SidePanel({ lead }: { lead: LeadDetail }) {
  return (
    <div className="admin-side-stack">
      <section className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="h3">Stage</h2>
        </header>
        <form action="#" className="admin-stack">
          <label>
            <span>Status</span>
            <select name="status" defaultValue={lead.status}>
              {statusOrder.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Assignee</span>
            <select name="assigned_user_id" defaultValue={lead.assigned_user?.id ?? ""}>
              <option value="">Unassigned</option>
              <option value="1">Career360 Admin</option>
              <option value="2">Akua Mensah</option>
            </select>
          </label>
          <button type="submit" className="admin-btn admin-btn--solid admin-btn--sm">
            Save
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="h3">Details</h2>
        </header>
        <dl className="admin-dl">
          <div><dt>Lead ID</dt><dd>#{lead.id}</dd></div>
          <div><dt>Created</dt><dd>{new Date(lead.created_at).toLocaleString()}</dd></div>
          <div><dt>Updated</dt><dd>{new Date(lead.updated_at).toLocaleString()}</dd></div>
          {lead.scheduled_at && (
            <div><dt>Next meeting</dt><dd>{new Date(lead.scheduled_at).toLocaleString()}</dd></div>
          )}
        </dl>
      </section>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
