"use client";

import { useActionState, useEffect, useState } from "react";
import type { ResourceItem } from "../_mock";
import {
  saveResourceAction,
  deleteResourceAction,
  type ResourceFormState,
} from "./_actions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FilePicker } from "@/components/ui/FilePicker";

const initial: ResourceFormState = {};

const RESOURCE_ACCEPT: Record<string, { accept: string; label: string }> = {
  guide: { accept: "application/pdf,.pdf", label: "Choose PDF" },
  document: {
    accept:
      "application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx",
    label: "Choose document",
  },
  video: { accept: "video/*", label: "Choose video" },
  audio: { accept: "audio/*", label: "Choose audio" },
};

export function ResourceForm({ resource, live = true }: { resource?: ResourceItem; live?: boolean }) {
  const [state, formAction, pending] = useActionState(saveResourceAction, initial);
  const isEdit = !!resource;

  const initialDescription = resource?.description ?? "";
  const initialFormat = resource?.format ?? "guide";
  const [description, setDescription] = useState<string>(initialDescription);
  const [format, setFormat] = useState<string>(initialFormat);
  const [coverPreview, setCoverPreview] = useState<string | null>(resource?.cover_image ?? null);
  const [dirty, setDirty] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function clearCover() {
    if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setDirty(true);
  }

  function clearFile() {
    setDirty(true);
  }

  function handleDescriptionChange(html: string) {
    setDescription(html);
    if (html !== initialDescription) setDirty(true);
  }

  const isExternal = format === "external";

  return (
    <div className="admin-form-wrap">
      <form
        action={formAction}
        className="admin-form-card"
        onChange={() => setDirty(true)}
      >
        {isEdit && <input type="hidden" name="id" value={resource!.id} />}
        {isEdit && resource?.cover_image && (
          <input type="hidden" name="cover_image_existing" value={resource.cover_image} />
        )}
        {isEdit && resource?.file_path && (
          <input type="hidden" name="file_path_existing" value={resource.file_path} />
        )}
        <input type="hidden" name="description" value={description} />

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
            defaultValue={resource?.title ?? ""}
            placeholder="e.g. Scholarship Readiness Guide"
            aria-invalid={Boolean(state.fieldErrors?.title)}
          />
          {state.fieldErrors?.title?.[0] && (
            <span className="contact-form__error">{state.fieldErrors.title[0]}</span>
          )}
        </label>

        <div className="contact-field">
          <span className="contact-field__label">Description</span>
          <RichTextEditor
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe what's inside…"
          />
        </div>

        <div className="contact-form__row">
          <label className="contact-field">
            <span className="contact-field__label">Format</span>
            <select
              name="format"
              value={format}
              onChange={(e) => { setFormat(e.target.value); setDirty(true); }}
            >
              <option value="guide">Guide (PDF workbook)</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="external">External link</option>
            </select>
          </label>
          <label className="contact-field">
            <span className="contact-field__label">Tags</span>
            <input
              type="text"
              name="tags"
              defaultValue={resource?.tags?.join(", ") ?? ""}
              placeholder="scholarship, workbook (comma-separated)"
            />
          </label>
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
              onClear={clearCover}
            />
            <small className="admin-muted">Uploads to Cloudinary on save. Max 1 GB.</small>
          </div>
        </div>

        {isExternal ? (
          <label className="contact-field">
            <span className="contact-field__label">External URL</span>
            <input
              type="url"
              name="external_url"
              defaultValue={resource?.external_url ?? ""}
              placeholder="https://youtu.be/…"
            />
          </label>
        ) : (
          <div className="contact-field">
            <span className="contact-field__label">Resource file</span>
            <div className="admin-upload">
              <FilePicker
                name="resource_file"
                accept={RESOURCE_ACCEPT[format]?.accept ?? ""}
                buttonLabel={RESOURCE_ACCEPT[format]?.label ?? "Choose file"}
                currentName={resource?.file_path ?? null}
                onSelect={() => setDirty(true)}
                onClear={clearFile}
              />
              <small className="admin-muted">Uploads to Cloudinary on save. Max 1 GB.</small>
            </div>
          </div>
        )}

        <label className="contact-field">
          <span className="contact-field__label">Display filename (optional)</span>
          <input
            type="text"
            name="file_label"
            defaultValue={resource?.file_label ?? ""}
            placeholder="e.g. Captor — Scholarship Readiness Guide.pdf"
          />
          <small className="admin-muted">
            Shown on the download button instead of the uploaded filename. Leave blank to use the original name.
          </small>
        </label>

        {isEdit && (
          <div className="contact-form__row">
            <label className="contact-field">
              <span className="contact-field__label">Status</span>
              <select name="status" defaultValue={resource?.status ?? "published"}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="contact-field">
              <span className="contact-field__label">Slug</span>
              <input
                type="text"
                name="slug"
                defaultValue={resource?.slug ?? ""}
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Publish resource"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export function DeleteResourceButton({ id, disabled = false }: { id: number; disabled?: boolean }) {
  return (
    <form
      action={deleteResourceAction}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm("Delete this resource? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="admin-btn admin-btn--ghost admin-btn--danger"
        disabled={disabled}
      >
        Delete resource
      </button>
    </form>
  );
}
