"use client";

import { useActionState } from "react";
import type { Story } from "../_mock";
import {
  saveStoryAction,
  deleteStoryAction,
  type StoryFormState,
} from "./_actions";

const initial: StoryFormState = {};

export function StoryForm({ story, live = true }: { story?: Story; live?: boolean }) {
  const [state, formAction, pending] = useActionState(saveStoryAction, initial);
  const isEdit = !!story;

  return (
    <>
      <form action={formAction} className="admin-form">
        {isEdit && <input type="hidden" name="id" value={story!.id} />}
        {!live && <p className="admin-gated" role="status">Backend unavailable — saves will fail.</p>}
        {state.error && !state.fieldErrors && <p className="admin-gated" role="alert">{state.error}</p>}

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Title</span>
            <input type="text" name="title" required defaultValue={story?.title ?? ""} />
          </label>
          <label className="admin-form__field">
            <span>Slug</span>
            <input type="text" name="slug" defaultValue={story?.slug ?? ""} placeholder="auto-generated from title" />
          </label>
        </div>

        <label className="admin-form__field">
          <span>Summary</span>
          <textarea name="summary" rows={2} maxLength={500} defaultValue={story?.summary ?? ""} />
        </label>

        <label className="admin-form__field">
          <span>Body (markdown)</span>
          <textarea name="body" rows={12} defaultValue={story?.body ?? ""} placeholder="Tell the story…" />
        </label>

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Person name</span>
            <input type="text" name="person_name" required defaultValue={story?.person_name ?? ""} />
          </label>
          <label className="admin-form__field">
            <span>Person role / context</span>
            <input type="text" name="person_role" defaultValue={story?.person_role ?? ""} placeholder="e.g. Banking → MBA candidate" />
          </label>
        </div>

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Outcome</span>
            <select name="outcome" defaultValue={story?.outcome ?? ""}>
              <option value="">(none)</option>
              <option value="admission">Admission</option>
              <option value="scholarship">Scholarship</option>
              <option value="placement">Placement</option>
              <option value="transition">Transition</option>
              <option value="achievement">Achievement</option>
            </select>
          </label>
          <label className="admin-form__field">
            <span>Status</span>
            <select name="status" defaultValue={story?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>

        <label className="admin-form__field">
          <span>Cover image URL</span>
          <input type="url" name="cover_image" defaultValue={story?.cover_image ?? ""} />
        </label>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--solid" disabled={pending || !live}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create story"}
          </button>
        </div>
      </form>

      {isEdit && <DeleteForm id={story!.id} disabled={!live} />}
    </>
  );
}

function DeleteForm({ id, disabled }: { id: number; disabled: boolean }) {
  return (
    <form
      action={deleteStoryAction}
      className="admin-form__actions"
      style={{ marginTop: 16 }}
      onSubmit={(e) => {
        if (!confirm("Delete this story? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn admin-btn--ghost admin-btn--danger" disabled={disabled}>
        Delete
      </button>
    </form>
  );
}
