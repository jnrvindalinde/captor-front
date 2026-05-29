"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Story, StoryCategory } from "../_mock";
import {
  saveStoryAction,
  deleteStoryAction,
  type StoryFormState,
} from "./_actions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FilePicker } from "@/components/ui/FilePicker";

const initial: StoryFormState = {};

const CATEGORIES: StoryCategory[] = ["School", "Scholarship", "Job", "Career"];

type LocalGalleryItem =
  | { kind: "existing"; url: string }
  | { kind: "pending"; file: File; preview: string };

export function StoryForm({ story, live = true }: { story?: Story; live?: boolean }) {
  const [state, formAction, pending] = useActionState(saveStoryAction, initial);
  const isEdit = !!story;

  const initialBody = story?.body ?? "";
  const [body, setBody] = useState<string>(initialBody);
  const [coverPreview, setCoverPreview] = useState<string | null>(story?.cover_image ?? null);
  const [categories, setCategories] = useState<StoryCategory[]>(story?.categories ?? []);
  const [gallery, setGallery] = useState<LocalGalleryItem[]>(
    (story?.gallery ?? []).map((url) => ({ kind: "existing" as const, url })),
  );
  const [dirty, setDirty] = useState<boolean>(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      gallery.forEach((g) => {
        if (g.kind === "pending") URL.revokeObjectURL(g.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearCover() {
    if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setDirty(true);
  }

  function toggleCategory(cat: StoryCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    setDirty(true);
  }

  function onGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setGallery((prev) => [
      ...prev,
      ...files.map((file) => ({
        kind: "pending" as const,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    setDirty(true);
    if (e.target) e.target.value = "";
  }

  function removeGalleryItem(idx: number) {
    setGallery((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed?.kind === "pending") URL.revokeObjectURL(removed.preview);
      return next;
    });
    setDirty(true);
  }

  function handleBodyChange(html: string) {
    setBody(html);
    if (html !== initialBody) setDirty(true);
  }

  const existingGalleryUrls = gallery
    .filter((g): g is { kind: "existing"; url: string } => g.kind === "existing")
    .map((g) => g.url);

  return (
    <div className="admin-form-wrap">
      <form
        action={formAction}
        className="admin-form-card"
        onChange={() => setDirty(true)}
      >
        {isEdit && <input type="hidden" name="id" value={story!.id} />}
        {isEdit && story?.cover_image && (
          <input type="hidden" name="cover_image_existing" value={story.cover_image} />
        )}
        <input type="hidden" name="body" value={body} />
        <input type="hidden" name="gallery_existing" value={JSON.stringify(existingGalleryUrls)} />
        {categories.map((c) => (
          <input key={c} type="hidden" name="categories" value={c} />
        ))}

        {!live && (
          <p className="admin-gated" role="status">
            Backend unavailable — saves will fail. Showing seed/mock data.
          </p>
        )}
        {state.error && !state.fieldErrors && (
          <p className="admin-gated" role="alert">{state.error}</p>
        )}

        <label className="contact-field">
          <span className="contact-field__label">Story title</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={story?.title ?? ""}
            placeholder="e.g. From banking floor to INSEAD"
            aria-invalid={Boolean(state.fieldErrors?.title)}
          />
          {state.fieldErrors?.title?.[0] && (
            <span className="contact-form__error">{state.fieldErrors.title[0]}</span>
          )}
        </label>

        <label className="contact-field">
          <span className="contact-field__label">Quote</span>
          <textarea
            name="quote"
            rows={3}
            maxLength={1000}
            defaultValue={story?.quote ?? ""}
            placeholder="The one-line testimonial shown on cards and at the top of the detail page."
          />
          <small className="admin-muted">
            Short pull-quote in the person&rsquo;s voice. Used on the stories grid and the detail header.
          </small>
        </label>

        <div className="contact-form__row">
          <label className="contact-field">
            <span className="contact-field__label">Person name</span>
            <input
              type="text"
              name="person_name"
              required
              defaultValue={story?.person_name ?? ""}
              placeholder="e.g. Akosua B."
            />
          </label>
          <label className="contact-field">
            <span className="contact-field__label">Role / context</span>
            <input
              type="text"
              name="person_role"
              defaultValue={story?.person_role ?? ""}
              placeholder="e.g. MSc Public Health · Edinburgh, 2025"
            />
          </label>
        </div>

        <div className="contact-form__row">
          <label className="contact-field">
            <span className="contact-field__label">Outcome category</span>
            <select name="outcome" defaultValue={story?.outcome ?? ""}>
              <option value="">(none)</option>
              <option value="admission">Admission</option>
              <option value="scholarship">Scholarship</option>
              <option value="placement">Placement</option>
              <option value="transition">Transition</option>
              <option value="achievement">Achievement</option>
            </select>
          </label>
          <label className="contact-field">
            <span className="contact-field__label">Work done / outcome label</span>
            <input
              type="text"
              name="outcome_label"
              defaultValue={story?.outcome_label ?? ""}
              placeholder="e.g. Career repositioned · Fully funded — Mastercard"
            />
          </label>
        </div>

        <div className="contact-field">
          <span className="contact-field__label">Categories</span>
          <div className="admin-chip-group" role="group" aria-label="Categories">
            {CATEGORIES.map((cat) => {
              const on = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`admin-chip${on ? " is-on" : ""}`}
                  aria-pressed={on}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <small className="admin-muted">Pick any that apply. Used for the filter chips on the stories page.</small>
        </div>

        <div className="contact-field">
          <span className="contact-field__label">Headshot / cover image</span>
          <div className="admin-upload">
            {coverPreview && (
              <div className="admin-upload__preview admin-upload__preview--avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Headshot preview" />
              </div>
            )}
            <FilePicker
              name="cover_file"
              accept="image/*"
              buttonLabel="Choose headshot"
              onSelect={(f) => {
                if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
                setCoverPreview(URL.createObjectURL(f));
                setDirty(true);
              }}
              onClear={clearCover}
            />
            <small className="admin-muted">Used as the avatar on the story card and detail header. Square crop works best.</small>
          </div>
        </div>

        <div className="contact-field">
          <span className="contact-field__label">Their story</span>
          <RichTextEditor
            value={body}
            onChange={handleBodyChange}
            placeholder="Write the full story. Use paragraphs to set the rhythm…"
          />
        </div>

        <div className="contact-field">
          <span className="contact-field__label">Supporting images (optional)</span>
          <div className="admin-upload">
            {gallery.length > 0 && (
              <div className="admin-gallery-grid">
                {gallery.map((item, i) => (
                  <div key={i} className="admin-gallery-grid__item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.kind === "existing" ? item.url : item.preview}
                      alt={`Gallery ${i + 1}`}
                    />
                    <button
                      type="button"
                      className="admin-gallery-grid__remove"
                      aria-label={`Remove image ${i + 1}`}
                      onClick={() => removeGalleryItem(i)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="file-picker__btn" style={{ alignSelf: "flex-start" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              <span>Add gallery images</span>
              <input
                ref={galleryInputRef}
                type="file"
                name="gallery_files"
                accept="image/*"
                multiple
                onChange={onGalleryAdd}
              />
            </label>
            <small className="admin-muted">
              Photos that add human detail to the story (workspace, graduation, team, places). Uploaded to Cloudinary on save.
            </small>
          </div>
        </div>

        <label className="contact-field">
          <span className="contact-field__label">Short summary (optional)</span>
          <textarea
            name="summary"
            rows={2}
            maxLength={500}
            defaultValue={story?.summary ?? ""}
            placeholder="Internal blurb / SEO description"
          />
        </label>

        {isEdit && (
          <div className="contact-form__row">
            <label className="contact-field">
              <span className="contact-field__label">Status</span>
              <select name="status" defaultValue={story?.status ?? "published"}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="contact-field">
              <span className="contact-field__label">Slug</span>
              <input
                type="text"
                name="slug"
                defaultValue={story?.slug ?? ""}
                placeholder="auto-generated from title"
              />
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Publish story"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export function DeleteStoryButton({ id, disabled = false }: { id: number; disabled?: boolean }) {
  return (
    <form
      action={deleteStoryAction}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm("Delete this story? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="admin-btn admin-btn--ghost admin-btn--danger"
        disabled={disabled}
      >
        Delete story
      </button>
    </form>
  );
}
