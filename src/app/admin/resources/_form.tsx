"use client";

import { useActionState } from "react";
import type { ResourceItem } from "../_mock";
import {
  saveResourceAction,
  deleteResourceAction,
  type ResourceFormState,
} from "./_actions";

const initial: ResourceFormState = {};

export function ResourceForm({ resource, live = true }: { resource?: ResourceItem; live?: boolean }) {
  const [state, formAction, pending] = useActionState(saveResourceAction, initial);
  const isEdit = !!resource;

  return (
    <>
      <form action={formAction} className="admin-form">
        {isEdit && <input type="hidden" name="id" value={resource!.id} />}
        {!live && <p className="admin-gated" role="status">Backend unavailable — saves will fail.</p>}
        {state.error && !state.fieldErrors && <p className="admin-gated" role="alert">{state.error}</p>}

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Title</span>
            <input type="text" name="title" required defaultValue={resource?.title ?? ""} />
          </label>
          <label className="admin-form__field">
            <span>Slug</span>
            <input type="text" name="slug" defaultValue={resource?.slug ?? ""} placeholder="auto-generated from title" />
          </label>
        </div>

        <label className="admin-form__field">
          <span>Description</span>
          <textarea name="description" rows={4} defaultValue={resource?.description ?? ""} />
        </label>

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Format</span>
            <select name="format" defaultValue={resource?.format ?? "guide"}>
              <option value="guide">Guide (PDF workbook)</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="external">External link</option>
            </select>
          </label>
          <label className="admin-form__field">
            <span>Status</span>
            <select name="status" defaultValue={resource?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>File path (Cloudinary key or upload path)</span>
            <input type="text" name="file_path" defaultValue={resource?.file_path ?? ""} placeholder="resources/guides/example.pdf" />
          </label>
          <label className="admin-form__field">
            <span>External URL</span>
            <input type="url" name="external_url" defaultValue={resource?.external_url ?? ""} placeholder="https://youtu.be/…" />
          </label>
        </div>

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Tags (comma-separated)</span>
            <input type="text" name="tags" defaultValue={resource?.tags?.join(", ") ?? ""} placeholder="scholarship, workbook" />
          </label>
          <label className="admin-form__field">
            <span>Cover image URL</span>
            <input type="url" name="cover_image" defaultValue={resource?.cover_image ?? ""} />
          </label>
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--solid" disabled={pending || !live}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create resource"}
          </button>
        </div>
      </form>

      {isEdit && <DeleteForm id={resource!.id} disabled={!live} />}
    </>
  );
}

function DeleteForm({ id, disabled }: { id: number; disabled: boolean }) {
  return (
    <form
      action={deleteResourceAction}
      className="admin-form__actions"
      style={{ marginTop: 16 }}
      onSubmit={(e) => {
        if (!confirm("Delete this resource? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn admin-btn--ghost admin-btn--danger" disabled={disabled}>
        Delete
      </button>
    </form>
  );
}
