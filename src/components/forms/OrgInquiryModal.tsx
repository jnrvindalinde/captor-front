"use client";

import { useState, useTransition } from "react";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/Button";
import { submitOrgInquiryAction } from "@/app/actions/publicForms";

type OrgInquiryData = {
  about: string;
  name: string;
  role: string;
  organization: string;
  contact: string;
};

const empty: OrgInquiryData = {
  about: "",
  name: "",
  role: "",
  organization: "",
  contact: "",
};

function classifyContact(value: string): "email" | "phone" | "unknown" {
  const v = value.trim();
  if (!v) return "unknown";
  if (v.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
  const digits = v.replace(/\D/g, "");
  if (digits.length >= 7) return "phone";
  return "unknown";
}

export function OrgInquiryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<OrgInquiryData>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof OrgInquiryData>(key: K, value: OrgInquiryData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kind = classifyContact(data.contact);
    if (kind === "unknown") {
      setContactError("Please enter a valid email or phone number.");
      return;
    }
    setContactError(null);
    setSubmitError(null);
    startTransition(async () => {
      const r = await submitOrgInquiryAction({
        name: data.name.trim(),
        role: data.role.trim(),
        organization: data.organization.trim(),
        about: data.about.trim(),
        contact: data.contact.trim(),
      });
      if (r.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(r.message);
      }
    });
  }

  function handleClose() {
    onClose();
    // Reset after close transition.
    setTimeout(() => {
      setData(empty);
      setSubmitted(false);
      setContactError(null);
    }, 250);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy="org-inquiry-title"
      describedBy="org-inquiry-desc"
      dialogClassName="org-modal"
    >
      {!submitted ? (
        <>
          <header className="org-modal__head">
            <span className="kicker">For organizations</span>
            <h2 id="org-inquiry-title" className="h2 org-modal__title">
              Tell us about your <span className="serif">team</span>.
            </h2>
            <p id="org-inquiry-desc" className="org-modal__lede">
              A short note about where you are and what you&apos;re trying to build.
              We&apos;ll reply within two business days.
            </p>
          </header>

          <form className="org-form" onSubmit={handleSubmit}>
            <label className="contact-field">
              <span className="contact-field__label">What you&apos;re working on</span>
              <textarea
                required
                rows={6}
                placeholder="The team, the goal, the timeline. Onboarding, mobility, leadership transitions — say as much as feels right."
                value={data.about}
                onChange={(e) => update("about", e.target.value)}
              />
            </label>

            <div className="contact-form__row">
              <label className="contact-field">
                <span className="contact-field__label">Your name</span>
                <input
                  type="text"
                  required
                  placeholder="Akua Mensah"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label className="contact-field">
                <span className="contact-field__label">Your role</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. People Lead, COO, Founder"
                  value={data.role}
                  onChange={(e) => update("role", e.target.value)}
                />
              </label>
            </div>

            <label className="contact-field">
              <span className="contact-field__label">Organization</span>
              <input
                type="text"
                required
                placeholder="Company or organization name"
                value={data.organization}
                onChange={(e) => update("organization", e.target.value)}
              />
            </label>

            <label className="contact-field">
              <span className="contact-field__label">Best way to reach you</span>
              <input
                type="text"
                required
                placeholder="Email or phone — whichever you prefer"
                value={data.contact}
                onChange={(e) => {
                  update("contact", e.target.value);
                  if (contactError) setContactError(null);
                }}
              />
              {contactError && (
                <span className="org-form__error">{contactError}</span>
              )}
            </label>

            <div className="org-form__footer">
              <p className="org-form__note">
                We use what you share only to reply. No newsletters, no resale.
              </p>
              {submitError && (
                <p className="org-form__error" role="alert">{submitError}</p>
              )}
              <Button type="submit" variant="primary" size="md" withArrow disabled={pending}>
                {pending ? "Sending…" : "Send inquiry"}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="org-modal__success">
          <div className="org-modal__success-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h2 className="h2 org-modal__title">
            Got it, <span className="serif">{data.name.split(" ")[0] || "thanks"}</span>.
          </h2>
          <p className="org-modal__lede">
            Your note is in. A senior member of our team will reply within two
            business days from the address or number you shared.
          </p>
          <div className="org-modal__success-actions">
            <Button type="button" variant="secondary" size="md" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
