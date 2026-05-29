"use client";

import { useActionState, useEffect, useState } from "react";
import type { Post } from "../_mock";
import { savePostAction, deletePostAction, type PostFormState } from "./_actions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FilePicker } from "@/components/ui/FilePicker";

const initial: PostFormState = {};

export function PostForm({ post, live = true }: { post?: Post; live?: boolean }) {
  const [state, formAction, pending] = useActionState(savePostAction, initial);
  const isEdit = !!post;

  const initialBody = post?.body ?? "";
  const [body, setBody] = useState<string>(initialBody);
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.cover_image ?? null);
  const [dirty, setDirty] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function clearImage() {
    if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setDirty(true);
  }

  function handleBodyChange(html: string) {
    setBody(html);
    if (html !== initialBody) setDirty(true);
  }

  return (
    <div className="admin-form-wrap">
      <form
        action={formAction}
        className="admin-form-card"
        onChange={() => setDirty(true)}
      >
        {isEdit && <input type="hidden" name="id" value={post!.id} />}
        {isEdit && post?.cover_image && (
          <input type="hidden" name="cover_image_existing" value={post.cover_image} />
        )}
        {/* The editor writes its HTML into this hidden field on every keystroke. */}
        <input type="hidden" name="body" value={body} />

        {!live && (
          <p className="admin-gated" role="status">
            Backend unavailable — saves will fail. Showing seed/mock data.
          </p>
        )}
        {state.error && !state.fieldErrors && (
          <p className="admin-gated" role="alert">{state.error}</p>
        )}

        <label className="contact-field">
          <span className="contact-field__label">Title</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={post?.title ?? ""}
            placeholder="e.g. How to pick a master's program"
            aria-invalid={Boolean(state.fieldErrors?.title)}
          />
          {state.fieldErrors?.title?.[0] && (
            <span className="contact-form__error">{state.fieldErrors.title[0]}</span>
          )}
        </label>

        <label className="contact-field">
          <span className="contact-field__label">Excerpt</span>
          <textarea
            name="excerpt"
            rows={2}
            maxLength={500}
            defaultValue={post?.excerpt ?? ""}
            placeholder="Short summary shown in listings (max 500 chars)"
          />
        </label>

        <div className="contact-field">
          <span className="contact-field__label">Body</span>
          <RichTextEditor value={body} onChange={handleBodyChange} placeholder="Start writing…" />
        </div>

        <div className="contact-field">
          <span className="contact-field__label">Cover image</span>
          <div className="admin-upload">
            {coverPreview && (
              <div className="admin-upload__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover preview" />
              </div>
            )}
            <FilePicker
              name="cover_file"
              accept="image/*"
              buttonLabel="Choose image"
              onSelect={(f) => {
                if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
                setCoverPreview(URL.createObjectURL(f));
                setDirty(true);
              }}
              onClear={clearImage}
            />
            <small className="admin-muted">Uploads to Cloudinary on save. Max 1 GB.</small>
          </div>
        </div>

        <div className="contact-form__row">
          <label className="contact-field">
            <span className="contact-field__label">Tags</span>
            <input
              type="text"
              name="tags"
              defaultValue={post?.tags?.join(", ") ?? ""}
              placeholder="study-abroad, decisions (comma-separated)"
            />
          </label>
          <label className="contact-field">
            <span className="contact-field__label">Publish date</span>
            <input
              type="datetime-local"
              name="published_at"
              defaultValue={post?.published_at ? post.published_at.slice(0, 16) : ""}
            />
          </label>
        </div>

        {isEdit && (
          <div className="contact-form__row">
            <label className="contact-field">
              <span className="contact-field__label">Status</span>
              <select name="status" defaultValue={post?.status ?? "published"}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>
        )}

        {(!isEdit || dirty || pending) && (
          <div className="admin-form__actions">
            <button
              type="submit"
              className="admin-btn admin-btn--solid"
              disabled={pending || !live}
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Publish post"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export function DeletePostButton({ id, disabled = false }: { id: number; disabled?: boolean }) {
  return (
    <form
      action={deletePostAction}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm("Delete this post? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="admin-btn admin-btn--ghost admin-btn--danger"
        disabled={disabled}
      >
        Delete post
      </button>
    </form>
  );
}
