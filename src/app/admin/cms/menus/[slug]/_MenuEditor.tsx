"use client";

import { useMemo, useState, useTransition } from "react";
import type { NavMenu, NavMenuItem } from "@/lib/cms/menus";
import {
  addMenuItemAction,
  deleteMenuItemAction,
  reorderMenuItemsAction,
  updateMenuItemAction,
} from "../_actions";

function MenuItemRow({
  slug,
  item,
  index,
  count,
  onMove,
}: {
  slug: string;
  item: NavMenuItem;
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
}) {
  const [draft, setDraft] = useState({
    label_en: item.label.en ?? "",
    label_fr: item.label.fr ?? "",
    href: item.href,
    target: item.target,
    visible: item.visible,
  });
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    start(async () => {
      const r = await updateMenuItemAction(slug, item.uuid, draft);
      if (!r.ok) setErr(r.error);
    });
  }

  function remove() {
    if (!confirm("Delete this menu item?")) return;
    start(async () => {
      await deleteMenuItemAction(slug, item.uuid);
    });
  }

  return (
    <li className={`cms-coll__item ${item.visible ? "" : "is-draft"}`}>
      <div className="cms-coll__item-head">
        <strong>#{index}</strong>
        <span className="admin-muted">{item.href}</span>
        {!item.visible ? <span className="admin-pill admin-pill--warn">hidden</span> : null}
        <span className="cms-coll__item-actions">
          <button type="button" className="admin-link" onClick={() => onMove(-1)} disabled={index === 0 || pending}>↑</button>
          <button type="button" className="admin-link" onClick={() => onMove(1)} disabled={index === count - 1 || pending}>↓</button>
          <button type="button" className="admin-link admin-link-btn--danger" onClick={remove} disabled={pending}>Delete</button>
        </span>
      </div>
      <div className="cms-coll__form">
        <label className="admin-field">
          <span>Label (EN)</span>
          <input value={draft.label_en} onChange={(e) => setDraft({ ...draft, label_en: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Label (FR)</span>
          <input value={draft.label_fr} onChange={(e) => setDraft({ ...draft, label_fr: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Link (href)</span>
          <input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Open in</span>
          <select value={draft.target} onChange={(e) => setDraft({ ...draft, target: e.target.value as "_self" | "_blank" })}>
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </label>
        <label className="admin-field admin-field--row">
          <input type="checkbox" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} />
          <span>Visible</span>
        </label>
        {err ? <p className="admin-error">{err}</p> : null}
        <div className="admin-field--row">
          <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </li>
  );
}

export function MenuEditor({ menu }: { menu: NavMenu }) {
  const sorted = useMemo(
    () => [...menu.items].sort((a, b) => a.sort_order - b.sort_order),
    [menu.items],
  );
  const [adding, startAdd] = useTransition();
  const [busy, startBusy] = useTransition();
  const [addErr, setAddErr] = useState<string | null>(null);
  const [add, setAdd] = useState({ label_en: "", label_fr: "", href: "", target: "_self" as "_self" | "_blank" });

  function addItem() {
    setAddErr(null);
    if (!add.label_en || !add.href) {
      setAddErr("Label (EN) and Link are required.");
      return;
    }
    startAdd(async () => {
      const r = await addMenuItemAction(menu.slug, add);
      if (!r.ok) setAddErr(r.error);
      else setAdd({ label_en: "", label_fr: "", href: "", target: "_self" });
    });
  }

  function move(uuid: string, dir: -1 | 1) {
    const idx = sorted.findIndex((s) => s.uuid === uuid);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= sorted.length) return;
    const order = sorted.map((s, i) => {
      if (i === idx) return { uuid: sorted[swap].uuid, sort_order: i };
      if (i === swap) return { uuid: sorted[idx].uuid, sort_order: i };
      return { uuid: s.uuid, sort_order: i };
    });
    startBusy(async () => { await reorderMenuItemsAction(menu.slug, order); });
  }

  return (
    <div className="cms-coll">
      <header className="cms-pages__head">
        <div>
          <h1>{menu.name}</h1>
          <p className="admin-muted">Slug: <code>{menu.slug}</code></p>
        </div>
      </header>

      <div className="cms-coll__add">
        <h2>Add item</h2>
        <div className="cms-coll__form">
          <label className="admin-field">
            <span>Label (EN) *</span>
            <input value={add.label_en} onChange={(e) => setAdd({ ...add, label_en: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Label (FR)</span>
            <input value={add.label_fr} onChange={(e) => setAdd({ ...add, label_fr: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Link (href) *</span>
            <input value={add.href} onChange={(e) => setAdd({ ...add, href: e.target.value })} placeholder="/services or https://…" />
          </label>
          <label className="admin-field">
            <span>Open in</span>
            <select value={add.target} onChange={(e) => setAdd({ ...add, target: e.target.value as "_self" | "_blank" })}>
              <option value="_self">Same tab</option>
              <option value="_blank">New tab</option>
            </select>
          </label>
          {addErr ? <p className="admin-error">{addErr}</p> : null}
          <div className="admin-field--row">
            <button type="button" className="admin-btn admin-btn--primary" onClick={addItem} disabled={adding}>
              {adding ? "Adding…" : "Add item"}
            </button>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="admin-muted">No items yet.</p>
      ) : (
        <ul className="cms-coll__items">
          {sorted.map((it, i) => (
            <MenuItemRow
              key={it.uuid}
              slug={menu.slug}
              item={it}
              index={i}
              count={sorted.length}
              onMove={(d) => !busy && move(it.uuid, d)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
