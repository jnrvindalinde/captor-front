# Career360 Public Site — Build-Out Plan

**Owner**: Career360 / Captor
**Status**: Living document — update each phase as it lands
**Last updated**: 2026-05-29
**Companion doc**: [backend-wiring-plan.md](./backend-wiring-plan.md) (admin/CRM wiring)

---

## Context

The admin / CRM portal (`/admin/*`) is now substantially wired to the Laravel
backend (Phases 0–9 of the backend-wiring plan). The **public marketing site**
(`/`, `/services`, `/stories`, `/placements`, `/resources`, `/blog`, `/contact`,
`/apply`) is still **hard-coded JSX in English with no mobile menu**.

This plan is the roadmap for making the public site:

1. Mobile-friendly with a real navigation drawer
2. Bilingual (English + French) with a working language toggle
3. Admin-editable for the strings & content blocks that change often
4. Tied back to the CMS so non-engineers can update copy without a deploy

The recommended order — **A → B → C1 → D** — is chosen so each phase
unblocks the next without rework. In particular: externalising strings for
i18n (Phase B) gives us the natural keys we'll later swap to come from the
database (Phases C1 + D).

---

## Phase A — Mobile menu + responsive polish

**Goal**: The public site is usable and looks correct on phones (320–640 px),
tablets (641–1024 px), and desktops (>1024 px). Primary navigation collapses to
a burger that opens a slide-in drawer.

### Scope

- Burger button injected into [`SiteNav`](../src/components/layout/SiteNav.tsx):
  - Visible at `< 768px`, hides the desktop `<NavLinks />` and `<NavActions />`
    sections.
  - Accessible (`aria-expanded`, `aria-controls`, focus trap when open).
- Right-slide drawer component (`MobileNavDrawer`):
  - Contains: the same nav links, the (still placeholder) language button,
    the Apply CTA, and the brand at the top-left.
  - Closes on link click, Escape, backdrop click.
  - `framer-motion` slide + fade, respects `prefers-reduced-motion`.
- Page-by-page responsive sweep:
  - `/` (hero, marquee, services grid, testimonials, footer)
  - `/services`, `/stories`, `/stories/[slug]`
  - `/placements`, `/resources`, `/resources/[slug]`
  - `/blog`, `/blog/[slug]`
  - `/contact` (form layout)
  - `/apply` (step rail, validation alerts)
- Footer: stack columns vertically on mobile; logo + socials get their own row.
- `Container` / `Section` paddings tightened on small screens.

### Files likely touched

- `src/components/layout/SiteNav.tsx`
- `src/components/layout/MobileNavDrawer.tsx` _(new)_
- `src/components/layout/Footer.tsx`
- `src/app/globals.css` (drawer styles + breakpoints audit)
- Each public page file with hero/section layout adjustments

### Out of scope (deferred)

- Animated burger micro-interactions beyond a basic icon switch
- Tablet-specific layouts beyond CSS responsiveness (no separate tablet design)
- Drawer "mega-menu" with sub-sections (links are flat for now)

### Acceptance

- [ ] No horizontal scroll on any public page at 320 px width
- [ ] Drawer opens / closes via burger + Escape + backdrop + link tap
- [ ] All interactive elements are tap-target compliant (≥ 44×44 px)
- [ ] Lighthouse mobile performance ≥ 85 on `/` and `/services`

---

## Phase B — i18n scaffold (English + French)

**Goal**: Every visible string on the public site comes from a translation
file. The language button in the nav actually switches between English and
French and persists the choice. Admin portal stays English-only for now.

### Library choice

[`next-intl`](https://next-intl-docs.vercel.app/) — the de-facto standard for
the Next.js App Router. Supports server components, message namespacing, and
ICU plurals. Works with our Turbopack setup.

### Routing strategy

**Cookie-based**, not URL-prefixed.

- URLs stay clean: `/services`, `/about`, `/apply` regardless of language.
- A `NEXT_LOCALE` cookie + middleware decides which messages bundle to load.
- Pros: simpler links, no duplicate-content SEO concerns, no migration of
  existing internal links.
- Cons: harder for users to share a language-specific URL. Acceptable for now.
- If SEO research later demands `/fr/...` URLs, we can switch — the messages
  files do not change.

### Scope

- Install + configure `next-intl`. Wire root layout + middleware.
- Create `src/messages/en.json` and `src/messages/fr.json`.
- Externalise _all_ visible English strings on public pages into `en.json`
  with hierarchical keys (`nav.services`, `home.hero.title`,
  `apply.steps.1.title`, ...).
- Machine-translate to French as the starting point. **Every French value gets
  a `# REVIEW: ...` companion key** in a sibling `fr.review.json` so a human
  reviewer can grep and approve before we ship publicly.
- Wire the existing language button to call `setLocale('en' | 'fr')` (a server
  action) which writes the cookie and revalidates.
- Add `useLocale()` / `useTranslations()` to every public component.
- Admin portal: keep English-only for now (no i18n on `/admin/*`).

### Files likely touched

- `next.config.ts` (plugin)
- `src/middleware.ts` (locale detection)
- `src/i18n/request.ts` _(new — `next-intl` config)_
- `src/messages/en.json` _(new)_
- `src/messages/fr.json` _(new)_
- `src/app/actions/setLocale.ts` _(new — server action)_
- `src/app/layout.tsx` (provider wrap)
- Every public page + section component (string replacement)

### Out of scope

- Admin portal localisation
- RTL languages
- Per-route locale negotiation (we always use the cookie)
- Translating user-submitted content (blog posts, stories, resources) — those
  stay in whatever language the admin authored them in. We'll revisit when /
  if the business needs per-locale posts.

### Acceptance

- [ ] Toggling the language button on any public page switches all visible
      text on that page within one render
- [ ] Cookie persists across refreshes and sessions
- [ ] No untranslated English strings appear when locale is `fr`
- [ ] All `fr` values have a sibling `# REVIEW` entry until a human signs off

---

## Phase C1 — CMS-lite for editable site content

**Goal**: Admins can edit nav labels, page section titles, hero copy, and
similar high-traffic strings without a code change. Implementation is a simple
key/value JSON store, _not_ a full block-based CMS.

### Backend

- New table `site_settings`:
  ```
  id (uuid)
  key (string, unique)           — e.g. "nav.label.services" or "home.hero.title"
  locale (string, default 'en')  — 'en' | 'fr'
  value (jsonb)                  — string, array, or object
  updated_by (FK users)
  updated_at, created_at
  ```
  Composite unique index on `(key, locale)`.
- `SiteSetting` model + `SiteSettingResource`.
- Admin API endpoints (sanctum-protected, admin role):
  - `GET    /api/admin/site-settings` — paginated, filterable by key prefix
  - `GET    /api/admin/site-settings/{key}` — both locales bundled
  - `PUT    /api/admin/site-settings/{key}` — body: `{ en: ..., fr: ... }`
- Public endpoint (anonymous, cached):
  - `GET    /api/public/site-settings?locale=en` — returns the full bundle as
    a flat key/value map. Cached server-side for 5 min; `Cache::tags(['site-settings'])`
    cleared on update.
- Seeder loads the **English source-of-truth** from `messages/en.json` and the
  French from `messages/fr.json` so we start in sync with Phase B.

### Frontend (admin)

- New page: `/admin/content`
- Default view: tree / collapsible list grouped by key prefix
  (`nav.*`, `home.hero.*`, `home.services.*`, `footer.*`, ...).
- Each leaf is an inline-editable text input (long strings get a textarea, JSON
  values get a small structured editor).
- Side-by-side English / French columns with a "copy EN → FR" button per row.
- Saves call `PUT /api/admin/site-settings/{key}`; optimistic update with
  rollback on error.
- Status banner if `!live` (offline / API down).

### Frontend (public)

- Replace the `next-intl` static messages provider with a hydrated one that
  pulls the latest bundle from `/api/public/site-settings`.
- Render path during SSR: server fetches the bundle and passes it as the
  initial `messages` prop. Client never re-fetches except on locale switch.

### Out of scope (defer to C2 if/when needed)

- Block-based page composition (drag-reorder Hero / Cards / Quote blocks)
- Rich-text editor for arbitrary HTML
- Image / media management for marketing pages (use the upcoming Cloudinary
  integration's image picker once that exists)
- Per-environment content (staging vs prod)
- Content versioning / draft+publish workflow

### Acceptance

- [ ] Editing a nav label in `/admin/content` updates the public site within
      5 minutes (or instantly on cache bust)
- [ ] French + English columns stay independently editable
- [ ] Public bundle endpoint responds in < 50 ms warm
- [ ] No regression in Phase B i18n behaviour when CMS is unreachable
      (fallback to static `messages/*.json`)

---

## Phase D — Hook nav + sections to the CMS

**Goal**: Every string Phase B externalised now actually reads from the Phase
C1 settings table. Sections gain a thin "editable" affordance for logged-in
admins (a small pencil icon that deep-links to the `/admin/content` row).

### Scope

- Replace `useTranslations()` consumers with a wrapper hook
  `useSiteText(key, fallback)` that:
  1. Reads from the hydrated CMS bundle first
  2. Falls back to the `next-intl` static message if the key isn't in the CMS
  3. In dev + admin-session, surfaces a tiny edit pencil that opens
     `/admin/content?key={key}`
- Nav links: `navLinks.ts` becomes a function that reads from CMS bundle keys
  `nav.links` (the ordered list) and `nav.label.{slug}`.
- Footer link columns, socials, address — same treatment.
- Hero copy on `/`, `/services`, `/stories`, `/placements` — keyed and
  CMS-backed.

### Files likely touched

- `src/components/layout/navLinks.ts` (becomes dynamic)
- `src/components/layout/Footer.tsx`
- `src/components/sections/*`
- Hero / intro JSX on each public page
- `src/hooks/useSiteText.ts` _(new)_

### Out of scope

- Per-page SEO meta editing (defer to a future Phase E if needed)

### Acceptance

- [ ] Changing "Services" to "Our services" in `/admin/content` updates the
      live site within one cache cycle
- [ ] No hard-coded user-visible strings remain in components touched by D
- [ ] Admins see the inline edit pencil; logged-out visitors do not

---

## Cross-phase notes

### Tracking translation gaps

Whenever a new visible string is added during normal feature work, the dev
must:

1. Add the English value to `messages/en.json` (and seed it into
   `site_settings` once Phase C1 lands).
2. Add a French value or a placeholder + `# REVIEW` flag.
3. Reference it via `useSiteText()` (post-Phase D) or `useTranslations()`
   (Phase B only).

A CI lint will flag any new string literal in a public component file.

### Caching strategy

- Phase B: static at build time, no caching concerns.
- Phase C1+: public bundle cached server-side 5 min, cache-busted on save.
- Admin bundle: never cached; always live.

### Coordination with Cloudinary + Google Calendar

These are independent tracks. Cloudinary will give us the media picker the
CMS uses for hero images; Google Calendar is unrelated. Neither blocks any
phase here.

---

## Status tracker

| Phase                         | Status      | Started    | Completed  | Notes                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------- | ----------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — Mobile menu + responsive  | done        | —          | 2026-05-28 | Drawer + responsive sweep complete; full audit run in separate session                                                                                                                                                                                                                                                                                                                            |
| B — i18n EN + FR              | in progress | 2026-05-28 | —          | Scaffold landed: `next-intl` installed, cookie-based config (`src/i18n/request.ts`), `messages/en.json` + `messages/fr.json` seeded, layout wraps `NextIntlClientProvider`, `setLocale` server action wired to a real `LanguageButton`. Nav + Footer + MobileNavDrawer migrated. Public page bodies (home/services/stories/placements/resources/blog/contact/apply) still hard-coded — next step. |
| C1 — CMS-lite                 | not started | —          | —          |                                                                                                                                                                                                                                                                                                                                                                                                   |
| D — CMS-backed nav + sections | not started | —          | —          |                                                                                                                                                                                                                                                                                                                                                                                                   |
