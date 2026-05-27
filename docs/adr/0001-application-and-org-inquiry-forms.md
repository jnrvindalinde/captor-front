# ADR 0001 — Application & Organization Inquiry Forms

**Status**: Accepted
**Date**: 2026-04-15
**Owner**: Career360 web team

---

## Context

The site has two distinct lead-capture intents that have been collapsed into a
single dead `#apply` anchor in five different places:

1. **Individuals** ready to begin an advisory engagement — they click _Start
   your application_ in the hero, the final CTA, and on several sub-pages.
2. **Organizations** exploring a partnership — they click _Talk to us_ inside
   the `corp-strip` block on the homepage.

These two audiences have very different commitment levels and very different
data requirements, so a single shared form would either over-ask the org rep or
under-ask the individual applicant.

## Decision

We build **two separate flows**, each tuned to its audience:

### 1. Organization inquiry — modal dialog

| Aspect     | Choice                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| Surface    | Modal dialog overlaid on the current page                                                                 |
| Trigger    | `Talk to us` button on the homepage `corp-strip`                                                          |
| Commitment | Low — exploratory conversation, no documents                                                              |
| Fields     | What you're working on (textarea), name, role, organization, single best-contact field (email _or_ phone) |
| Submit UX  | Inline success state inside the modal                                                                     |

Why a modal: org reps clicking _Talk to us_ are in browse mode. Yanking them
to a new route raises bounce risk. The modal preserves context and feels like
the lightweight conversation it is.

### 2. Individual application — dedicated `/apply` page

| Aspect     | Choice                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| Surface    | Full route at `/apply`                                                                                                |
| Trigger    | Every existing `Start your application` button (five total)                                                           |
| Commitment | High — ~5 min, includes optional document upload                                                                      |
| Flow       | 4 sequential steps + success screen, with a progress rail                                                             |
| State      | Single in-memory `ApplicationData` object, current step persisted in URL hash so refresh / back doesn't wipe progress |
| Submit UX  | Full-card success screen with onward links to home and resources                                                      |

Why a page (not a modal):

- ~5 min commitment feels claustrophobic inside an overlay.
- File upload UX needs real room (drop zone, file list, remove buttons).
- Multi-step with a progress rail is a known full-page pattern.
- A canonical URL is shareable and indexable, reinforcing that an application
  is a deliberate act.

### Step composition

1. **Where you are now** — current status (radio cards), country/city, field
   or focus area.
2. **Where you want to go** — primary goal (single-select radio cards),
   target countries/programs (chip input), timeline, budget readiness.
3. **Documents & story** — optional multi-file drop zone, free-form
   _Anything we should know?_ textarea.
4. **How to reach you** — name, email (required), phone (optional), referral
   source, newsletter opt-in, privacy note, submit.

### Goal selection — single-select

We picked single-select for _Primary goal_ over multi-select. The downstream
matching workflow keys off one goal; multi-select would force advisors to
re-disambiguate during intake. An _Other_ radio with a text input absorbs the
edge cases.

### File upload — state-only stub

We collect File objects in component state, render the list, and log on
submit. Real upload (S3, Formspree, custom backend, email) is intentionally
out of scope for this ADR — see _Open follow-ups_ below.

## Consequences

**Positive**

- Each audience gets a form that fits its commitment level.
- The five dead `#apply` anchors are replaced with one canonical destination.
- The application flow is shareable, bookmarkable, refresh-safe (via hash).
- Adding more steps later (e.g. academic history) is a contained change.

**Negative / costs**

- Two new client surfaces to maintain.
- File upload is a stub — submitting a form that lists _Files: 3_ but doesn't
  actually move bytes is a known temporary gap; documented in the page copy
  ("we'll request these from you directly if needed") to avoid surprise.
- Modal adds a generic dialog component to the design system we'll need to
  reuse consistently going forward.

## Implementation surface

**New files**

- `src/components/forms/Modal.tsx` — generic dialog shell (backdrop, focus
  trap, ESC + backdrop close, framer-motion).
- `src/components/forms/OrgInquiryModal.tsx` — org form, consumes `Modal`.
- `src/app/apply/page.tsx` — 4-step application flow + success.
- CSS appended to `src/app/globals.css` for both surfaces.

**Modified**

- `src/app/page.tsx` — wires modal open/close; repoints `#apply` → `/apply`.
- `src/app/services/page.tsx` — `#apply` → `/apply` (×2).
- `src/app/contact/page.tsx` — `#apply` → `/apply` (×1).

## Alternatives considered

- **Single shared modal for both audiences.** Rejected — org reps and
  individuals diverge in field set and commitment by an order of magnitude.
- **Single dedicated page for both.** Rejected — adds friction to the org
  flow where the goal is to start a conversation, not file paperwork.
- **Hash-routed in-page form on the homepage.** Rejected — fragile, can't be
  linked to deliberately, and degrades the home page for non-applicants.

## Open follow-ups

- Pick a real submission backend (Formspree, custom API, transactional email
  provider) and wire both forms.
- Decide on document storage (S3 pre-signed upload vs. server-side stream).
- Add server-side validation once a backend exists.
- Consider an _Academic background_ optional step if intake feedback shows
  CV-only data is too thin.
