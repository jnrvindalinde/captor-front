"use client";

import { useActionState } from "react";
import type { Post } from "../_mock";
import {
  savePostAction,
  deletePostAction,
  type PostFormState,
} from "./_actions";

const initial: PostFormState = {};

export function PostForm({ post, live = true }: { post?: Post; live?: boolean }) {
  const [state, formAction, pending] = useActionState(savePostAction, initial);
  const isEdit = !!post;

  return (
    <>
      <form action={formAction} className="admin-form">
        {isEdit && <input type="hidden" name="id" value={post!.id} />}

        {!live && (
          <p className="admin-gated" role="status">
            Backend unavailable — saves will fail. Showing seed/mock data.
          </p>
        )}
        {state.error && !state.fieldErrors && (
          <p className="admin-gated" role="alert">{state.error}</p>
        )}

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Title</span>
            <input type="text" name="title" required defaultValue={post?.title ?? ""} placeholder="e.g. How to pick a master's program" aria-invalid={Boolean(state.fieldErrors?.title)} />
            {state.fieldErrors?.title?.[0] && <small className="admin-muted">{state.fieldErrors.title[0]}</small>}
          </label>
          <label className="admin-form__field">
            <span>Slug</span>
            <input type="text" name="slug" defaultValue={post?.slug ?? ""} placeholder="auto-generated from title" />
            {state.fieldErrors?.slug?.[0] && <small className="admin-muted">{state.fieldErrors.slug[0]}</small>}
          </label>
        </div>

        <label className="admin-form__field">
          <span>Excerpt</span>
          <textarea name="excerpt" rows={2} maxLength={500} defaultValue={post?.excerpt ?? ""} placeholder="Short summary shown in listings (max 500 chars)" />
        </label>

        <label className="admin-form__field">
          <span>Body (markdown)</span>
          <textarea name="body" rows={14} defaultValue={post?.body ?? ""} placeholder="## Section heading…" />
        </label>

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Status</span>
            <select name="status" defaultValue={post?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="admin-form__field">
            <span>Publish date</span>
            <input type="datetime-local" name="published_at" defaultValue={post?.published_at ? post.published_at.slice(0, 16) : ""} />
          </label>
        </div>

        <div className="admin-form__row">
          <label className="admin-form__field">
            <span>Tags (comma-separated)</span>
            <input type="text" name="tags" defaultValue={post?.tags?.join(", ") ?? ""} placeholder="study-abroad, decisions" />
          </label>
          <label className="admin-form__field">
            <span>Cover image URL</span>
            <input type="url" name="cover_image" defaultValue={post?.cover_image ?? ""} placeholder="https://…" />
          </label>
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--solid" disabled={pending || !live}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create post"}
          </button>
        </div>
      </form>

      {isEdit && <DeleteForm id={post!.id} disabled={!live} />}
    </>
  );
}

function DeleteForm({ id, disabled }: { id: number; disabled: boolean }) {
  return (
    <form
      action={deletePostAction}
      className="admin-form__actions"
      style={{ marginTop: 16 }}
      onSubmit={(e) => {
        if (!confirm("Delete this post? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn admin-btn--ghost admin-btn--danger" disabled={disabled}>
        Delete
      </button>
    </form>
  );
}
