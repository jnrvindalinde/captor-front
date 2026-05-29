"use client";

import { useState, useTransition } from "react";
import type { SiteGlobals } from "@/lib/cms/globals";
import { saveGlobalsAction } from "./_actions";

const SOCIAL_KEYS = ["linkedin", "instagram", "facebook", "twitter", "youtube"] as const;

export function GlobalsEditor({ globals }: { globals: SiteGlobals }) {
  const [form, setForm] = useState({
    company_name: globals.company_name,
    tagline_en: globals.tagline.en ?? "",
    tagline_fr: globals.tagline.fr ?? "",
    logo_light_url: globals.logo.light ?? "",
    logo_dark_url: globals.logo.dark ?? "",
    contact_email: globals.contact.email ?? "",
    contact_phone: globals.contact.phone ?? "",
    address_en: globals.address.en ?? "",
    address_fr: globals.address.fr ?? "",
    footer_copyright_en: globals.footer_copyright.en ?? "",
    footer_copyright_fr: globals.footer_copyright.fr ?? "",
  });

  const [socials, setSocials] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const k of SOCIAL_KEYS) out[k] = (globals.socials?.[k] as string | null) ?? "";
    return out;
  });

  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setMsg(null);
    setErr(null);
    start(async () => {
      const payload: Record<string, unknown> = { ...form };
      payload.socials = Object.fromEntries(
        Object.entries(socials).map(([k, v]) => [k, v.trim() || null]),
      );
      const r = await saveGlobalsAction(payload);
      if (r.ok) setMsg("Saved.");
      else setErr(r.error);
    });
  }

  return (
    <div className="cms-coll">
      <section className="cms-coll__add">
        <h2>Company</h2>
        <div className="cms-coll__form">
          <label className="admin-field">
            <span>Company name</span>
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Tagline (EN)</span>
            <input value={form.tagline_en} onChange={(e) => setForm({ ...form, tagline_en: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Tagline (FR)</span>
            <input value={form.tagline_fr} onChange={(e) => setForm({ ...form, tagline_fr: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="cms-coll__add">
        <h2>Brand</h2>
        <div className="cms-coll__form">
          <label className="admin-field">
            <span>Logo URL (light)</span>
            <input value={form.logo_light_url} onChange={(e) => setForm({ ...form, logo_light_url: e.target.value })} placeholder="https://res.cloudinary.com/…/logo.png" />
          </label>
          <label className="admin-field">
            <span>Logo URL (dark)</span>
            <input value={form.logo_dark_url} onChange={(e) => setForm({ ...form, logo_dark_url: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="cms-coll__add">
        <h2>Contact</h2>
        <div className="cms-coll__form">
          <label className="admin-field">
            <span>Email</span>
            <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Phone</span>
            <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Address (EN)</span>
            <textarea rows={3} value={form.address_en} onChange={(e) => setForm({ ...form, address_en: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Address (FR)</span>
            <textarea rows={3} value={form.address_fr} onChange={(e) => setForm({ ...form, address_fr: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="cms-coll__add">
        <h2>Socials</h2>
        <div className="cms-coll__form">
          {SOCIAL_KEYS.map((k) => (
            <label key={k} className="admin-field">
              <span style={{ textTransform: "capitalize" }}>{k}</span>
              <input
                value={socials[k] ?? ""}
                onChange={(e) => setSocials({ ...socials, [k]: e.target.value })}
                placeholder="https://…"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="cms-coll__add">
        <h2>Footer</h2>
        <div className="cms-coll__form">
          <label className="admin-field">
            <span>Copyright line (EN)</span>
            <input value={form.footer_copyright_en} onChange={(e) => setForm({ ...form, footer_copyright_en: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Copyright line (FR)</span>
            <input value={form.footer_copyright_fr} onChange={(e) => setForm({ ...form, footer_copyright_fr: e.target.value })} />
          </label>
        </div>
      </section>

      {err ? <p className="admin-error">{err}</p> : null}
      {msg ? <p className="admin-muted">{msg}</p> : null}
      <div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save globals"}
        </button>
      </div>
    </div>
  );
}
