"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type {
  CmsPage,
  PageSection,
  SectionRegistry,
  SectionRegistryField,
} from "@/lib/cms/pages";
import {
  addSectionAction,
  deletePageAction,
  deleteSectionAction,
  publishPageAction,
  reorderSectionsAction,
  unpublishPageAction,
  updatePageMetaAction,
  updateSectionAction,
} from "../_actions";

type Props = { page: CmsPage; registry: SectionRegistry };

function defaultValueFor(field: SectionRegistryField): unknown {
  if (field.default !== undefined) return field.default;
  switch (field.type) {
    case "bool":   return false;
    case "number": return 0;
    case "json":   return [];
    default:       return "";
  }
}

function buildBlank(typeKey: string, registry: SectionRegistry): Record<string, unknown> {
  const def = registry[typeKey];
  if (!def) return {};
  const out: Record<string, unknown> = {};
  for (const f of def.fields) out[f.key] = defaultValueFor(f);
  return out;
}

function SchemaField({
  field,
  value,
  onChange,
}: {
  field: SectionRegistryField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = field.label ?? field.key;
  switch (field.type) {
    case "bool":
      return (
        <label className="admin-field admin-field--row">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>{label}</span>
        </label>
      );
    case "text":
    case "richtext":
      return (
        <label className="admin-field">
          <span>{label}{field.required ? " *" : ""}</span>
          <textarea
            rows={field.type === "richtext" ? 6 : 3}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
    case "json":
      return (
        <label className="admin-field">
          <span>{label}{field.required ? " *" : ""}</span>
          <textarea
            rows={8}
            value={(() => {
              try { return JSON.stringify(value ?? [], null, 2); } catch { return "[]"; }
            })()}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value); // keep raw to allow editing
              }
            }}
            style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}
          />
          {field.help ? <small className="admin-muted">{field.help}</small> : null}
        </label>
      );
    case "number":
      return (
        <label className="admin-field">
          <span>{label}{field.required ? " *" : ""}</span>
          <input
            type="number"
            value={typeof value === "number" ? value : 0}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </label>
      );
    default:
      return (
        <label className="admin-field">
          <span>{label}{field.required ? " *" : ""}</span>
          <input
            type={field.type === "url" ? "url" : "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
  }
}

function SectionEditor({
  pageUuid,
  pageSlug,
  section,
  registry,
}: {
  pageUuid: string;
  pageSlug: string;
  section: PageSection;
  registry: SectionRegistry;
}) {
  const def = registry[section.type];
  const [draft, setDraft] = useState<Record<string, unknown>>(section.data ?? {});
  const [isPending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    start(async () => {
      const r = await updateSectionAction(pageUuid, pageSlug, section.uuid, { data: draft });
      if (!r.ok) setErr(r.error);
    });
  }

  function toggleStatus() {
    const next = section.status === "draft" ? "published" : "draft";
    start(async () => {
      await updateSectionAction(pageUuid, pageSlug, section.uuid, { status: next });
    });
  }

  function remove() {
    if (!confirm("Delete this section?")) return;
    start(async () => {
      await deleteSectionAction(pageUuid, pageSlug, section.uuid);
    });
  }

  return (
    <details className={`cms-coll__item ${section.status === "draft" ? "is-draft" : ""}`} open>
      <summary className="cms-coll__item-head">
        <strong>{def?.label ?? section.type}</strong>
        <span className="admin-muted">#{section.position}</span>
        {section.status === "draft" ? <span className="admin-pill admin-pill--warn">draft</span> : null}
        <span className="cms-coll__item-actions">
          <button type="button" className="admin-link" onClick={toggleStatus} disabled={isPending}>
            {section.status === "draft" ? "Publish" : "Unpublish"}
          </button>
          <button type="button" className="admin-link admin-link-btn--danger" onClick={remove} disabled={isPending}>
            Delete
          </button>
        </span>
      </summary>

      {!def ? (
        <p className="admin-muted">Unknown section type: {section.type}</p>
      ) : (
        <div className="cms-coll__form">
          {def.fields.map((f) => (
            <SchemaField
              key={f.key}
              field={f}
              value={draft[f.key]}
              onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
            />
          ))}
          {err ? <p className="admin-error">{err}</p> : null}
          <div className="admin-field--row">
            <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </details>
  );
}

function AddSection({
  pageUuid,
  pageSlug,
  registry,
}: {
  pageUuid: string;
  pageSlug: string;
  registry: SectionRegistry;
}) {
  const types = Object.keys(registry);
  const [type, setType] = useState<string>(types[0] ?? "");
  const [isPending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function add() {
    if (!type) return;
    setErr(null);
    start(async () => {
      const blank = buildBlank(type, registry);
      const r = await addSectionAction(pageUuid, pageSlug, type, blank);
      if (!r.ok) setErr(r.error);
    });
  }

  return (
    <div className="cms-coll__add">
      <h3>Add a section</h3>
      <div className="admin-field--row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {types.map((t) => (
            <option key={t} value={t}>{registry[t]?.label ?? t}</option>
          ))}
        </select>
        <button type="button" className="admin-btn admin-btn--primary" onClick={add} disabled={isPending}>
          {isPending ? "Adding…" : "Add"}
        </button>
      </div>
      {err ? <p className="admin-error">{err}</p> : null}
    </div>
  );
}

export function PageEditor({ page, registry }: Props) {
  const [meta, setMeta] = useState({
    title_en: page.title.en ?? "",
    title_fr: page.title.fr ?? "",
    slug: page.slug,
    seo_title_en: page.seo.title.en ?? "",
    seo_title_fr: page.seo.title.fr ?? "",
    seo_description_en: page.seo.description.en ?? "",
    seo_description_fr: page.seo.description.fr ?? "",
  });
  const [savingMeta, startMeta] = useTransition();
  const [metaErr, setMetaErr] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  const sections = useMemo(
    () => (page.sections ?? []).slice().sort((a, b) => a.position - b.position),
    [page.sections],
  );

  function saveMeta() {
    setMetaErr(null);
    startMeta(async () => {
      const r = await updatePageMetaAction(page.uuid, meta);
      if (!r.ok) setMetaErr(r.error);
    });
  }

  function publish() {
    startBusy(async () => { await publishPageAction(page.uuid, page.slug); });
  }
  function unpublish() {
    startBusy(async () => { await unpublishPageAction(page.uuid, page.slug); });
  }
  function deletePage() {
    if (!confirm(`Delete page "${page.slug}"? This is reversible (soft-delete).`)) return;
    startBusy(async () => { await deletePageAction(page.uuid, page.slug); });
  }

  function move(uuid: string, dir: -1 | 1) {
    const idx = sections.findIndex((s) => s.uuid === uuid);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= sections.length) return;
    const reordered = sections.map((s, i) => {
      if (i === idx) return { uuid: sections[swap].uuid, position: i };
      if (i === swap) return { uuid: sections[idx].uuid, position: i };
      return { uuid: s.uuid, position: i };
    });
    startBusy(async () => { await reorderSectionsAction(page.uuid, page.slug, reordered); });
  }

  return (
    <div className="cms-page-editor">
      <header className="cms-pages__head">
        <div>
          <h1>{page.title.en || page.slug}</h1>
          <p className="admin-muted">
            <code>/p/{page.slug}</code>
            <span className={`admin-pill ${page.status === "draft" ? "admin-pill--warn" : ""}`} style={{ marginLeft: 8 }}>
              {page.status}
            </span>
          </p>
        </div>
        <div className="cms-page-editor__actions">
          <Link href={`/p/${page.slug}`} target="_blank" className="admin-link">View live →</Link>
          {page.status === "draft" ? (
            <button type="button" className="admin-btn admin-btn--primary" onClick={publish} disabled={busy}>
              Publish
            </button>
          ) : (
            <button type="button" className="admin-btn" onClick={unpublish} disabled={busy}>
              Unpublish
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--danger" onClick={deletePage} disabled={busy}>
            Delete
          </button>
        </div>
      </header>

      <section className="cms-pages__create">
        <h2>Page details</h2>
        <div className="cms-pages__create-form">
          <label className="admin-field">
            <span>Slug</span>
            <input value={meta.slug} onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span>Title (EN)</span>
            <input value={meta.title_en} onChange={(e) => setMeta((m) => ({ ...m, title_en: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span>Title (FR)</span>
            <input value={meta.title_fr} onChange={(e) => setMeta((m) => ({ ...m, title_fr: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span>SEO title (EN)</span>
            <input value={meta.seo_title_en} onChange={(e) => setMeta((m) => ({ ...m, seo_title_en: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span>SEO title (FR)</span>
            <input value={meta.seo_title_fr} onChange={(e) => setMeta((m) => ({ ...m, seo_title_fr: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span>SEO description (EN)</span>
            <textarea rows={2} value={meta.seo_description_en} onChange={(e) => setMeta((m) => ({ ...m, seo_description_en: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span>SEO description (FR)</span>
            <textarea rows={2} value={meta.seo_description_fr} onChange={(e) => setMeta((m) => ({ ...m, seo_description_fr: e.target.value }))} />
          </label>
          {metaErr ? <p className="admin-error">{metaErr}</p> : null}
          <div>
            <button type="button" className="admin-btn admin-btn--primary" onClick={saveMeta} disabled={savingMeta}>
              {savingMeta ? "Saving…" : "Save details"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2>Sections</h2>
        <AddSection pageUuid={page.uuid} pageSlug={page.slug} registry={registry} />
        {sections.length === 0 ? (
          <p className="admin-muted">No sections yet.</p>
        ) : (
          <ul className="cms-coll__items" style={{ marginTop: "1rem" }}>
            {sections.map((s, i) => (
              <li key={s.uuid}>
                <div className="admin-field--row" style={{ marginBottom: 4 }}>
                  <button type="button" className="admin-link" onClick={() => move(s.uuid, -1)} disabled={i === 0 || busy}>↑</button>
                  <button type="button" className="admin-link" onClick={() => move(s.uuid, 1)} disabled={i === sections.length - 1 || busy}>↓</button>
                </div>
                <SectionEditor pageUuid={page.uuid} pageSlug={page.slug} section={s} registry={registry} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
