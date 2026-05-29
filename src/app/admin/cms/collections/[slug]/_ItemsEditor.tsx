"use client";

import { useState, useTransition } from "react";
import type {
  CollectionItem,
  CollectionSchemaField,
} from "@/lib/cms/collections";
import {
  addCollectionItemAction,
  updateCollectionItemAction,
  deleteCollectionItemAction,
  reorderCollectionItemsAction,
} from "../_actions";

type Props = {
  slug: string;
  schema: CollectionSchemaField[];
  initialItems: CollectionItem[];
};

function emptyDataFromSchema(schema: CollectionSchemaField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of schema) out[f.key] = f.type === "boolean" ? false : "";
  return out;
}

export function CollectionItemsEditor({ slug, schema, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<Record<string, Record<string, unknown>>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState<Record<string, unknown>>(emptyDataFromSchema(schema));

  function setField(uuid: string, key: string, val: unknown) {
    setEditing((prev) => ({
      ...prev,
      [uuid]: { ...(prev[uuid] ?? items.find((i) => i.uuid === uuid)?.data ?? {}), [key]: val },
    }));
  }

  function saveItem(uuid: string) {
    const patch = editing[uuid];
    if (!patch) return;
    setError(null);
    startTransition(async () => {
      const res = await updateCollectionItemAction(slug, uuid, { data: patch });
      if (!res.ok) return setError(res.error);
      setItems((prev) => prev.map((i) => (i.uuid === uuid ? res.data : i)));
      setEditing((prev) => {
        const next = { ...prev };
        delete next[uuid];
        return next;
      });
    });
  }

  function removeItem(uuid: string, label: string) {
    if (!confirm(`Delete "${label}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCollectionItemAction(slug, uuid);
      if (!res.ok) return setError(res.error);
      setItems((prev) => prev.filter((i) => i.uuid !== uuid));
    });
  }

  function toggleStatus(item: CollectionItem) {
    const next = item.status === "published" ? "draft" : "published";
    setError(null);
    startTransition(async () => {
      const res = await updateCollectionItemAction(slug, item.uuid, { status: next });
      if (!res.ok) return setError(res.error);
      setItems((prev) => prev.map((i) => (i.uuid === item.uuid ? res.data : i)));
    });
  }

  function move(uuid: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.uuid === uuid);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    const renumbered = next.map((it, i) => ({ ...it, position: i }));
    setItems(renumbered);
    startTransition(async () => {
      const res = await reorderCollectionItemsAction(
        slug,
        renumbered.map((it) => ({ uuid: it.uuid, position: it.position })),
      );
      if (!res.ok) setError(res.error);
    });
  }

  function addItem() {
    setError(null);
    startTransition(async () => {
      const res = await addCollectionItemAction(slug, adding);
      if (!res.ok) return setError(res.error);
      setItems((prev) => [...prev, res.data]);
      setAdding(emptyDataFromSchema(schema));
    });
  }

  return (
    <div className="cms-coll">
      {error && (
        <p className="admin-gated" role="status">{error}</p>
      )}

      <section className="cms-coll__add">
        <h2 className="h3">Add item</h2>
        <div className="cms-coll__form">
          {schema.map((f) => (
            <SchemaField
              key={f.key}
              field={f}
              value={adding[f.key]}
              onChange={(v) => setAdding((prev) => ({ ...prev, [f.key]: v }))}
            />
          ))}
          <button type="button" className="admin-btn" onClick={addItem} disabled={pending}>
            {pending ? "Saving…" : "Add"}
          </button>
        </div>
      </section>

      <section>
        <h2 className="h3">Items ({items.length})</h2>
        {items.length === 0 ? (
          <p className="admin-muted">No items yet.</p>
        ) : (
          <ul className="cms-coll__items">
            {items.map((item, idx) => {
              const draft = editing[item.uuid] ?? item.data;
              const dirty = editing[item.uuid] !== undefined;
              const label = String(item.data[schema[0]?.key ?? "name"] ?? item.uuid);
              return (
                <li key={item.uuid} className={`cms-coll__item ${item.status === "draft" ? "is-draft" : ""}`}>
                  <header className="cms-coll__item-head">
                    <strong>{label}</strong>
                    <span className="admin-muted">#{item.position}</span>
                    <span className={`admin-pill ${item.status === "draft" ? "admin-pill--warn" : ""}`}>
                      {item.status}
                    </span>
                    <div className="cms-coll__item-actions">
                      <button type="button" className="admin-link-btn" onClick={() => move(item.uuid, -1)} disabled={idx === 0 || pending}>↑</button>
                      <button type="button" className="admin-link-btn" onClick={() => move(item.uuid, 1)} disabled={idx === items.length - 1 || pending}>↓</button>
                      <button type="button" className="admin-link-btn" onClick={() => toggleStatus(item)} disabled={pending}>
                        {item.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button type="button" className="admin-link-btn admin-link-btn--danger" onClick={() => removeItem(item.uuid, label)} disabled={pending}>
                        Delete
                      </button>
                    </div>
                  </header>

                  <div className="cms-coll__form">
                    {schema.map((f) => (
                      <SchemaField
                        key={f.key}
                        field={f}
                        value={draft[f.key]}
                        onChange={(v) => setField(item.uuid, f.key, v)}
                      />
                    ))}
                    {dirty && (
                      <button type="button" className="admin-btn" onClick={() => saveItem(item.uuid)} disabled={pending}>
                        {pending ? "Saving…" : "Save"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function SchemaField({
  field,
  value,
  onChange,
}: {
  field: CollectionSchemaField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = field.label ?? field.key;
  if (field.type === "boolean") {
    return (
      <label className="admin-field admin-field--row">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}{field.required ? " *" : ""}</span>
      </label>
    );
  }
  if (field.type === "text") {
    return (
      <label className="admin-field">
        <span>{label}{field.required ? " *" : ""}</span>
        <textarea
          className="admin-input"
          rows={3}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.help && <small className="admin-muted">{field.help}</small>}
      </label>
    );
  }
  return (
    <label className="admin-field">
      <span>{label}{field.required ? " *" : ""}</span>
      <input
        type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
        className="admin-input"
        value={value == null ? "" : String(value)}
        onChange={(e) =>
          onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
      {field.help && <small className="admin-muted">{field.help}</small>}
    </label>
  );
}
