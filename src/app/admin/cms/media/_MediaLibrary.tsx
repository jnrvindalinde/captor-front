"use client";

import { useState, useTransition, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "@/lib/cms/media";
import {
  uploadMediaAction,
  updateMediaAction,
  deleteMediaAction,
} from "./_actions";

type Props = {
  initialItems: MediaItem[];
  initialQuery: string;
  live: boolean;
};

function formatBytes(b: number | null): string {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function thumb(url: string, w = 240, h = 180): string {
  return url.replace("/upload/", `/upload/w_${w},h_${h},c_fill,q_auto,f_auto/`);
}

export function MediaLibrary({ initialItems, initialQuery, live }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function applyQuery(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    router.push(`/admin/cms/media${next.toString() ? `?${next}` : ""}`);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadError(null);

    startUpload(async () => {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadMediaAction(fd);
        if (!res.ok) {
          setUploadError(res.error);
          continue;
        }
        setItems((prev) => [res.data, ...prev]);
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <>
      <div className="cms-media__toolbar">
        <form onSubmit={applyQuery} className="cms-media__search">
          <input
            type="search"
            className="admin-input"
            placeholder="Search filename or alt text…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn--ghost">
            Search
          </button>
        </form>

        <label className={`admin-btn ${isUploading ? "is-disabled" : ""}`}>
          {isUploading ? "Uploading…" : "Upload images"}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            onChange={onFileChange}
            disabled={isUploading || !live}
            hidden
          />
        </label>
      </div>

      {uploadError && (
        <p className="admin-gated" role="status">
          Upload failed — {uploadError}
        </p>
      )}

      {items.length === 0 ? (
        <p className="admin-muted">
          {live
            ? "No media yet. Upload your first image to get started."
            : "No media to show."}
        </p>
      ) : (
        <ul className="cms-media__grid">
          {items.map((m) => (
            <li key={m.uuid}>
              <button
                type="button"
                className="cms-media__tile"
                onClick={() => setSelected(m)}
                aria-label={`Open ${m.original_filename ?? m.public_id}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb(m.url)}
                  alt={m.alt.en ?? m.original_filename ?? ""}
                  loading="lazy"
                  width={240}
                  height={180}
                />
                <span className="cms-media__name">
                  {m.original_filename ?? m.public_id}
                </span>
                <span className="cms-media__meta">
                  {m.width}×{m.height} · {formatBytes(m.bytes)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <MediaDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setItems((prev) => prev.map((it) => (it.uuid === updated.uuid ? updated : it)));
            setSelected(updated);
          }}
          onDeleted={(uuid) => {
            setItems((prev) => prev.filter((it) => it.uuid !== uuid));
            setSelected(null);
          }}
        />
      )}
    </>
  );
}

function MediaDetailModal({
  item,
  onClose,
  onSaved,
  onDeleted,
}: {
  item: MediaItem;
  onClose: () => void;
  onSaved: (m: MediaItem) => void;
  onDeleted: (uuid: string) => void;
}) {
  const [altEn, setAltEn] = useState(item.alt.en ?? "");
  const [altFr, setAltFr] = useState(item.alt.fr ?? "");
  const [capEn, setCapEn] = useState(item.caption.en ?? "");
  const [capFr, setCapFr] = useState(item.caption.fr ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateMediaAction(item.uuid, {
        alt_en: altEn,
        alt_fr: altFr,
        caption_en: capEn,
        caption_fr: capFr,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSaved(res.data);
    });
  }

  function remove() {
    if (!confirm(`Delete ${item.original_filename ?? item.public_id}? This cannot be undone.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteMediaAction(item.uuid);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onDeleted(item.uuid);
    });
  }

  return (
    <div className="cms-media__modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cms-media__modal-body" onClick={(e) => e.stopPropagation()}>
        <header className="cms-media__modal-head">
          <h2 className="h3">{item.original_filename ?? item.public_id}</h2>
          <button type="button" className="admin-link-btn" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="cms-media__modal-grid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb(item.url, 720, 540)}
            alt={item.alt.en ?? ""}
            className="cms-media__preview"
          />

          <div className="cms-media__fields">
            <dl className="cms-media__props">
              <dt>Public ID</dt>
              <dd><code>{item.public_id}</code></dd>
              <dt>Format</dt>
              <dd>{item.format ?? "—"}</dd>
              <dt>Size</dt>
              <dd>{item.width}×{item.height} · {formatBytes(item.bytes)}</dd>
              <dt>URL</dt>
              <dd className="cms-media__url"><a href={item.url} target="_blank" rel="noreferrer">{item.url}</a></dd>
            </dl>

            <label className="admin-field">
              <span>Alt text (EN)</span>
              <input className="admin-input" value={altEn} onChange={(e) => setAltEn(e.target.value)} />
            </label>
            <label className="admin-field">
              <span>Alt text (FR)</span>
              <input className="admin-input" value={altFr} onChange={(e) => setAltFr(e.target.value)} />
            </label>
            <label className="admin-field">
              <span>Caption (EN)</span>
              <textarea className="admin-input" value={capEn} onChange={(e) => setCapEn(e.target.value)} rows={2} />
            </label>
            <label className="admin-field">
              <span>Caption (FR)</span>
              <textarea className="admin-input" value={capFr} onChange={(e) => setCapFr(e.target.value)} rows={2} />
            </label>

            {error && (
              <p className="admin-gated" role="status">{error}</p>
            )}

            <div className="cms-media__actions">
              <button type="button" className="admin-btn" onClick={save} disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={remove} disabled={pending}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
