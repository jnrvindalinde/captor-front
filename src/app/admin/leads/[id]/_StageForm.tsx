"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LeadStatus } from "../../_mock";

type Assignee = { id: number; name: string };

/**
 * Controlled Stage form. The parent owns the `status` so other panels
 * (e.g. the Application decision auto-advancing to Contacted/Lost, or the
 * Meetings panel auto-advancing to Scheduled) can update it. We keep a
 * "saved baseline" locally so the Save button only appears when the user has
 * made changes since the last save — parent-driven status updates silently
 * advance the baseline too.
 */
export function StageForm({
  status,
  assigneeId,
  statuses,
  statusLabels,
  assignees,
  onStatusChange,
  onSave,
}: {
  status: LeadStatus;
  assigneeId: string;
  statuses: LeadStatus[];
  statusLabels?: Record<LeadStatus, string>;
  assignees: Assignee[];
  onStatusChange: (next: LeadStatus) => void;
  onSave: (payload: { status: LeadStatus; assignedUserId: number | null }) => void;
}) {
  const [savedStatus, setSavedStatus] = useState<LeadStatus>(status);
  const [savedAssigneeId, setSavedAssigneeId] = useState<string>(assigneeId);
  const [localAssigneeId, setLocalAssigneeId] = useState<string>(assigneeId);
  const [userTouchedStatus, setUserTouchedStatus] = useState(false);

  // When the parent advances status programmatically (decision approved, meeting
  // scheduled, etc.) treat it as the new baseline — no Save needed.
  useEffect(() => {
    if (!userTouchedStatus) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- rebaseline when parent advances status programmatically
      setSavedStatus(status);
    }
  }, [status, userTouchedStatus]);

  const dirty = status !== savedStatus || localAssigneeId !== savedAssigneeId;

  const reset = () => {
    onStatusChange(savedStatus);
    setLocalAssigneeId(savedAssigneeId);
    setUserTouchedStatus(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(status);
    setSavedAssigneeId(localAssigneeId);
    setUserTouchedStatus(false);
    onSave({
      status,
      assignedUserId: localAssigneeId ? Number(localAssigneeId) : null,
    });
  };

  return (
    <form onSubmit={handleSave} className="admin-stack admin-stage-form">
      <label>
        <span>Status</span>
        <select
          name="status"
          value={status}
          onChange={(e) => {
            setUserTouchedStatus(true);
            onStatusChange(e.target.value as LeadStatus);
          }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels ? statusLabels[s] : s}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Assignee</span>
        <select
          name="assigned_user_id"
          value={localAssigneeId}
          onChange={(e) => setLocalAssigneeId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {assignees.map((a) => (
            <option key={a.id} value={String(a.id)}>
              {a.name}
            </option>
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
            <button
              type="submit"
              className="admin-btn admin-btn--solid admin-btn--sm"
            >
              Save
            </button>
            <button
              type="button"
              className="admin-stage-form__discard"
              onClick={reset}
            >
              Discard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
