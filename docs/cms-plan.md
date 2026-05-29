# Captor CMS — Build Plan

**Status**: Approved — implementation in progress
**Last updated**: 2026-05-29
**Supersedes**: Phase C1 / D of [site-buildout-plan.md](./site-buildout-plan.md) (the `site_settings` key/value approach is dropped).

---

## 1. Goal

Give non-engineer admins a real CMS so they can:

1. **Edit existing pages** — change any visible string, image, list item, or section on the public site without a deploy.
2. **Add new content** — new blog posts, success stories, resources, AND new marketing pages (e.g. a landing page for a new scholarship campaign).
3. **Manage the chrome** — reorder nav links, edit the footer, swap socials and logos.
4. **Run a media library** — upload images once, reuse across pages, never re-paste a URL.
5. **Work bilingually** — every editable field has an EN and FR value, with clear "not translated yet" affordances.
6. **Preview + publish safely** — draft changes before they go live; one click to publish or revert.

Out of scope (deferred to a future revision):

- Per-user permissions beyond `admin` / `super_admin` (every admin can edit everything).
- Multi-tenant / multi-site (one site, one admin portal).
- Workflow approval chains (no "submit for review" — author publishes directly).
- Versioning beyond a draft/published pair (no long version history yet).
- A/B testing or scheduled publish (publish is immediate).

---

## 2. Why not the existing `site_settings` table

The seeded `site_settings` key/value table only covers strings already known at seed time. It can't:

- Represent a **page** as an ordered list of **typed sections** (hero, marquee, services grid, testimonials, ...).
- Hold **repeatable items** (a list of partner logos, country tiles, success stories) with their own fields.
- Reference **uploaded media** with consistent sizing/cropping metadata.
- Let admins **add or reorder** rows from the UI — every key has to be seeded by an engineer first.

We will keep the `site_settings` table around for a deprecation window (so the dashboard cards / footer chrome it already powers don't break) but the **new CMS is a different data model entirely** — see §4.

---

## 3. Data model (high level)

```
pages
  id, uuid, slug (unique), kind ("marketing" | "landing"), status ("draft" | "published"),
  title_en, title_fr, seo_title_en, seo_title_fr, seo_description_en, seo_description_fr,
  og_image_id (FK media), published_at, updated_by (FK users), timestamps

page_sections
  id, page_id (FK pages), type (string — see registry §5), position (int),
  data (jsonb — schema-validated per type), status ("draft" | "published"),
  timestamps, deleted_at (soft delete)

collections
  id, slug (unique), name, schema (jsonb — describes the item shape)
    # e.g. "partners", "countries", "trust-badges", "service-cards"

collection_items
  id, collection_id, position, data (jsonb — validated against collection.schema),
  status ("draft" | "published"), timestamps

navigation_menus
  id, slug (unique — "primary", "footer-explore", "footer-legal", ...), name

navigation_items
  id, menu_id, parent_id (nullable for nested), position,
  label_en, label_fr, href, external (bool), status

media
  id, uuid, disk, path, mime, width, height, size_bytes,
  alt_en, alt_fr, caption_en, caption_fr, uploaded_by, timestamps

site_globals
  id, key (unique — "footer.address", "social.linkedin", "brand.logo_id"),
  value (jsonb), timestamps
  # this is the *only* surviving key/value bag, for true one-off chrome.
```

### Why this shape

- **`pages` + `page_sections`** is a true page builder — admins compose a page from typed sections, in any order, and each section validates its own data against a JSON schema.
- **`collections`** handle the _repeatable lists_ that currently live as JS arrays in code (`partners`, `countries`, `stories`, `services`, `reasons`, `trustBadges`, `steps`). The home page composes a "PartnersMarquee" section that points at the `partners` collection — no engineer needed to add a new logo.
- **`media`** is its own table with EN/FR alt text — gives us a real library, dedupes uploads, lets us swap an image everywhere it's used.
- **`navigation_menus`** + `navigation_items` make `navLinks.ts` and the footer columns editable.
- **`site_globals`** is the deliberate escape hatch for genuinely-singleton chrome (logo, address, socials), but it is **not** the primary CMS surface.

All localized fields are paired (`_en` / `_fr`) at the column or jsonb-property level — no parallel rows per locale, no separate translation table. This is simpler to query, easier to keep in sync, and matches how editors actually work (they edit both languages side-by-side).

---

## 4. Section type registry

Every `page_sections.type` value is one entry in a **section registry** shared between backend (validation) and frontend (rendering). New section types are an engineer change — a section is essentially a typed React component plus a JSON schema.

Initial registry (covers everything currently hard-coded):

| Type slug          | Renders                                            | Editable fields                                                       |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------- |
| `hero.split`       | Home / Services hero (text left, image right)      | eyebrow, title, subtitle, primary CTA, secondary CTA, image           |
| `hero.centered`    | Apply / Contact hero                               | eyebrow, title, subtitle                                              |
| `reasons.grid`     | "Why Captor" three-icon grid                       | section header, items[] (icon enum, title, copy) — or `collectionRef` |
| `services.cards`   | Three big service cards                            | header, items[] (image, title, copy, href)                            |
| `marquee.logos`    | Partners marquee                                   | header, `collectionRef: partners`                                     |
| `steps.numbered`   | "How it works" 3-step strip                        | header, items[] (number, title, copy)                                 |
| `trust.badges`     | Trust badge row                                    | items[] (icon enum, title, copy)                                      |
| `stories.carousel` | Student stories carousel                           | header, `collectionRef: stories` (latest N or hand-picked)            |
| `countries.tabs`   | "We place students in..." tabbed grid              | header, `collectionRef: countries`                                    |
| `cta.banner`       | Full-bleed call-to-action band                     | title, subtitle, CTA                                                  |
| `resources.list`   | Resources index renderer                           | filter config, paging                                                 |
| `posts.list`       | Blog index renderer                                | filter config, paging                                                 |
| `richtext`         | Markdown / TipTap rich text                        | body_en, body_fr                                                      |
| `embed.form`       | Embed a known form (contact / apply / org-inquiry) | form slug enum                                                        |

A section can either **inline** its items (`items[]` array of objects) or **reference a collection** (`collectionRef: <slug>`). Editors typically use collections for anything that appears on more than one page (partners, countries, stories), and inline items for page-specific copy.

---

## 5. Backend changes (Laravel)

### 5.1 Migrations

One new migration per entity, ordered so foreign keys resolve:

1. `create_media_table`
2. `create_collections_table` + `create_collection_items_table`
3. `create_pages_table` + `create_page_sections_table`
4. `create_navigation_menus_table` + `create_navigation_items_table`
5. `create_site_globals_table`
6. `drop_or_freeze_site_settings_table` — keep rows for backfill, mark table as deprecated in a comment; we'll drop in a follow-up once nothing reads from it.

Each table gets a `uuid` column where the admin URL needs one (`pages.uuid`, `media.uuid`).

### 5.2 Models

`Page`, `PageSection`, `Collection`, `CollectionItem`, `NavigationMenu`, `NavigationItem`, `Media`, `SiteGlobal` — standard Eloquent models, `getRouteKeyName = 'uuid'` where applicable, factories for all.

### 5.3 Section schema validation

A `SectionRegistry` service class maps a section `type` slug to:

- A Laravel form-request rule set used by `PageSectionController@store/update` to validate the `data` payload.
- A frontend-shared JSON schema (exported via a generator command into `captor-front/src/cms/sections/*.schema.json`) so the editor knows what fields to render.

This keeps the two sides honest — if you add a field on the backend without updating the frontend schema, the editor won't expose it.

### 5.4 Controllers / routes (all under `auth:sanctum` admin group)

```
GET    /admin/pages                      list (filter: status, q)
POST   /admin/pages                      create
GET    /admin/pages/{page}               show (with sections)
PATCH  /admin/pages/{page}               update meta (title, slug, seo, ...)
DELETE /admin/pages/{page}               soft delete
POST   /admin/pages/{page}/publish       publish current draft
POST   /admin/pages/{page}/revert        discard draft, revert to published

POST   /admin/pages/{page}/sections                 add section
PATCH  /admin/pages/{page}/sections/{section}       update section data
DELETE /admin/pages/{page}/sections/{section}       remove section
POST   /admin/pages/{page}/sections/reorder         body: [{id, position}, ...]

GET    /admin/collections                                 list
POST   /admin/collections                                 create
GET    /admin/collections/{collection}                    show (with items)
PATCH  /admin/collections/{collection}                    update schema (engineer-gated)
POST   /admin/collections/{collection}/items              add item
PATCH  /admin/collections/{collection}/items/{item}       update
DELETE /admin/collections/{collection}/items/{item}       remove
POST   /admin/collections/{collection}/items/reorder      reorder

GET    /admin/menus                                  list
GET    /admin/menus/{menu}                           show with items
POST   /admin/menus/{menu}/items                     add
PATCH  /admin/menus/{menu}/items/{item}              update
DELETE /admin/menus/{menu}/items/{item}              remove
POST   /admin/menus/{menu}/items/reorder             reorder

GET    /admin/media                                  list (filter: q, mime, used_in)
POST   /admin/media                                  multipart upload (returns Media)
PATCH  /admin/media/{media}                          update alt/caption
DELETE /admin/media/{media}                          delete (refuse if referenced)

GET    /admin/globals                                map of key → value
PUT    /admin/globals/{key}                          upsert
```

Public consumption:

```
GET /api/public/pages/{slug}?locale=en      published page + sections, hydrated
                                            (collection refs resolved server-side)
GET /api/public/navigation/{menu}?locale=en menu items, published only
GET /api/public/collections/{slug}?locale=en collection items, published only
GET /api/public/globals?locale=en           map of key → value
```

All public endpoints are **cache-tagged** (`Cache::tags(['cms', "page:{slug}"])`) and busted on publish.

### 5.5 Media storage — Cloudinary

- **Provider**: Cloudinary (creds provided). Uploads stream from the Laravel backend to Cloudinary via the official `cloudinary/cloudinary_php` SDK; the `media` row stores `public_id`, `secure_url`, `width`, `height`, `format`, `bytes`, plus our own EN/FR alt + caption.
- **Transformations**: derivatives are generated on the fly by Cloudinary (`w_,h_,c_fill,q_auto,f_auto`) — we don't pre-render breakpoints ourselves. A small `mediaUrl(media, { w, h, crop })` helper on the frontend builds the URL.
- **Local dev**: same Cloudinary account, separate `dev/` upload preset folder, so dev uploads don't pollute prod.
- **Originals**: immutable; re-cropping creates a new `media` row pointing at the same `public_id` with different transformation defaults stored alongside.

### 5.6 Auth + roles

- Existing `super_admin` / `admin` roles can do everything in the CMS.
- New role `editor` (no schema/collection-shape edits, no media delete, no publish on critical pages) — defer to v2 unless asked for.

---

## 6. Frontend changes (Next.js)

### 6.1 Admin routes

```
/admin/cms/pages                  page list
/admin/cms/pages/new              create page (slug, title, kind)
/admin/cms/pages/[uuid]           page editor — left rail = sections, right pane = field form
/admin/cms/pages/[uuid]/preview   live preview of draft (renders the public page with draft data)
/admin/cms/pages/[uuid]/seo       SEO + social card fields

/admin/cms/collections                  list
/admin/cms/collections/[slug]           items editor

/admin/cms/menus                        list
/admin/cms/menus/[slug]                 menu editor (drag-reorder, nested)

/admin/cms/media                        media library (grid, upload, search)

/admin/cms/globals                      globals editor (footer address, socials, logo)
```

The existing `/admin/content` page becomes a redirect to `/admin/cms/pages` for the deprecation window.

### 6.2 Section editor

- Left rail: ordered list of the page's sections, with `+ Add section` menu (lists the registry).
- Drag handles for reorder (`dnd-kit`), trash icon for remove (soft delete with undo toast).
- Right pane: form for the selected section, auto-generated from the section's JSON schema.
- "Inline items" use a nested editable list (drag-reorder, +Add, Remove).
- Collection refs render a read-only summary + a "Open collection" deep link.
- Each text field has an EN tab and an FR tab; a third "Not translated" badge appears if FR is empty.
- Media fields open the media library in a modal picker.
- Save = save-draft (autosave on blur, 800ms debounce). Publish button at top right.

### 6.3 Public rendering

- New file `src/cms/sections/registry.ts` maps a section `type` → React component.
- `src/app/[[...slug]]/page.tsx` (a catch-all) fetches `/api/public/pages/{slug}` server-side and renders sections in order.
- Existing hard-coded pages (`/`, `/services`, ...) get migrated to this catch-all by seeding their content as CMS pages with the same slugs.
- `useLocale()` from `next-intl` decides which `*_en` / `*_fr` field to pick.

### 6.4 Media library component

- Standalone modal usable both in the media admin page and as a picker from any section field.
- Grid view with infinite scroll, filter by mime / search by filename or alt text.
- Upload: dropzone, supports multi-file, shows per-file progress, blocks publish until upload completes.

### 6.5 Server actions

Mirrors the existing pattern (colocated `_actions.ts` next to each admin page):

- `savePageMeta`, `publishPage`, `revertPage`
- `addSection`, `saveSection`, `removeSection`, `reorderSections`
- `uploadMedia`, `updateMedia`, `deleteMedia`
- `saveMenuItem`, `reorderMenu`
- `saveGlobal`

Each calls `revalidateTag('cms')` (plus `revalidatePath` on the affected public route) so the public site picks up the change on the next request without a full deploy.

---

## 7. Migration of existing content

We **migrate, not rewrite** — every page that exists today gets seeded into the CMS so the cutover is invisible.

### 7.1 Seeders

`CmsSeeder` (idempotent):

1. Seeds **collections**: `partners`, `countries`, `stories-featured`, `service-cards`, `trust-badges`, `reasons`, `steps`. Items are mined directly from the current hard-coded arrays in [src/app/page.tsx](../src/app/page.tsx), [src/app/services/page.tsx](../src/app/services/page.tsx), [src/app/stories/page.tsx](../src/app/stories/page.tsx), etc.
2. Seeds **media**: every `/public/imports/*.jpg` referenced today is registered as a Media row (path-only, no copy needed — it already lives on the public disk). Cloudflared images are skipped and replaced with admin TODO entries.
3. Seeds **pages**: `home`, `services`, `placements`, `stories`, `resources`, `blog`, `contact`, `apply`, `about` — each with its current sections, in order.
4. Seeds **menus**: `primary` (from `navLinks.ts`), `footer-explore`, `footer-legal`, `socials` (from `Footer.tsx`).
5. Seeds **globals**: `brand.logo_id`, `brand.name`, `footer.address`, `footer.tagline`, `social.linkedin`, `social.instagram`, ...

After this runs, the CMS has parity with the current site. The frontend cutover (§6.3) replaces the hard-coded JSX with the CMS renderer page-by-page; nothing visible changes for the public visitor.

### 7.2 i18n source-of-truth

After cutover, `messages/en.json` and `messages/fr.json` only hold **UI chrome strings** (button labels, form validation messages, aria-labels) — anything content-y is in the CMS. The seeder copies the existing translated values out of `messages/*.json` into CMS rows so we don't lose FR work.

---

## 8. Phased rollout

Each phase is independently shippable and reversible (the previous public render stays in place until the section is migrated).

| Phase | Scope                                                                                     | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Freeze old `/admin/content` key/value editor with a "moved" notice                        | **done** — page replaced with a redirect notice; CMS section added to admin sidenav.                                                                                                                                                                                                                                                                                                                                                                  |
| 1     | Media library — backend table + admin UI + Cloudinary upload                              | **done** — `media` table + `Media` model + `CloudinaryService` + admin CRUD at `/admin/cms/media`. Cloudinary credentials wired (cloud `dailfnloz`, folder `captor`); uploads live.                                                                                                                                                                                                                                                                   |
| 2     | Collections + `partners` collection migrated; home Marquee reads from API                 | **done** — `collections` + `collection_items` tables, admin editor at `/admin/cms/collections`, `partners` seeded, home page wired via `CmsPartnersMarquee`.                                                                                                                                                                                                                                                                                          |
| 3     | Section registry + Page model; migrate `/services` (smallest marketing page) as the pilot | **done** — `pages` + `page_sections` tables, `SectionRegistry` (13 section types: hero.split, hero.centered, richtext, cta.banner, marquee.logos, steps.numbered, reasons.grid, services.cards, stories.carousel, countries.tabs, faq.list, gallery.grid), admin editor at `/admin/cms/pages`, public renderer at `/p/{slug}`, demo page seeded at `/p/cms-demo`.                                                                                     |
| 4     | Home page migration (largest blast radius)                                                | **injection points done** — two CMS page slots (`home-after-hero`, `home-before-footer`) seeded as draft pages; home page renders any CMS sections published into them. Admins can add announcements, promos, banners, additional CTAs without code. Full hardcoded → CMS migration of existing hero/services/steps/stories sections deferred to a follow-up.                                                                                         |
| 5     | Remaining marketing pages + `/public/imports` migrated to media library                   | **injection slots done** — every marketing page (`/`, `/services`, `/placements`, `/stories`, `/resources`, `/blog`, `/contact`, `/apply`) renders a CMS slot above its footer; corresponding draft pages seeded as `{page}-before-footer`. `/public/imports` → Cloudinary still pending (Phase 1 envs).                                                                                                                                              |
| 6     | Navigation menus — `navLinks.ts` and footer columns become CMS-driven                     | **done** — `navigation_menus`/`navigation_items` tables, admin at `/admin/cms/menus`, header reads `primary`, footer reads `footer-explore`/`footer-resources`/`footer-reach` with hardcoded fallback.                                                                                                                                                                                                                                                |
| 7     | Globals editor — logo, footer chrome, socials                                             | **done** — `site_globals` singleton table, admin at `/admin/cms/globals` (company, tagline, logos, contact, address, socials, copyright). Footer reads CMS globals with translation fallback.                                                                                                                                                                                                                                                         |
| 8     | Draft / preview / publish flow                                                            | **done** — every page has a deterministic preview token (HMAC of uuid + APP_KEY) exposed to authenticated admins; public preview endpoint at `GET /api/public/pages/{slug}/preview/{token}` renders drafts incl. draft sections; `/p/{slug}?preview=…` shows them on the live site with a banner. `page_audits` table records create/update/publish/unpublish/delete + section ops with user attribution; last 100 entries shown in the admin editor. |
| 9     | Deprecate `site_settings` table                                                           | **done** — table dropped (migration `2026_06_06_000000_drop_site_settings_table`); backend model, controllers (admin + public), resource, seeder, and routes removed; frontend `lib/siteSettings.ts`, `i18n` CMS-bundle merge, and `/admin/content` editor/actions removed (redirect notice page retained).                                                                                                                                           |

---

## 9. Caching, invalidation, and performance

- **Server-side cache**: `Cache::tags(['cms'])` wraps every public CMS read. Publish/edit actions flush the tag (or, finer, `page:{slug}`, `collection:{slug}`, `menu:{slug}`).
- **Next.js cache**: server components fetch with `next: { tags: ['cms'] }`; server actions call `revalidateTag('cms')` after every mutation that affects the public site.
- **HTTP cache**: public CMS endpoints emit `Cache-Control: public, max-age=60, stale-while-revalidate=600` so even uncached page loads stay fast.
- **Asset cache**: Media derivatives are content-addressed (filename includes a hash) — safe to set `max-age=31536000, immutable`.

Performance budget: every public marketing page must keep its current Lighthouse mobile score (≥85) post-migration. We measure before/after each migration phase.

---

## 10. Risk register

| Risk                                                                         | Mitigation                                                                                                                   |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Editors create broken pages by deleting required sections                    | Pages have a schema: certain section types are required on certain page `kind`s; editor blocks delete with a warning.        |
| Section schema changes break previously-saved pages                          | Schema migrations: each schema change ships with a `php artisan cms:migrate-sections` script that rewrites old payloads.     |
| Media files get orphaned / referenced media gets deleted                     | `media.delete` checks references across `page_sections.data`, `collection_items.data`, `site_globals.value`; refuses if any. |
| FR translations lag EN and the public site shows English everywhere          | The renderer falls back to EN if FR is empty and surfaces "Translation missing" badges in the admin row.                     |
| Cutover regresses SEO (URLs / meta change)                                   | Each migrated page keeps its existing slug + meta. SEO fields are seeded from the current `<head>` of the live page.         |
| Cache invalidation misses a related page (e.g. menu change but header stale) | Publish/menu/global writes invalidate the broad `cms` tag, accepting a small over-invalidation cost.                         |

---

## 11. Decisions (locked)

1. **Rich text editor**: TipTap for marketing pages.
2. **Media storage**: Cloudinary (both prod and dev, separate folders).
3. **Page kinds**: Landing pages with custom slugs supported from day one (`pages.kind = "landing"`).
4. **Preview auth**: Admin-only for v1; share-via-token deferred.
5. **Section additions**: Engineer-gated, no custom-HTML escape hatch.
6. **`/admin/blog`, `/admin/resources`, `/admin/stories`**: Stay as separate CRUD; `posts.list` / `resources.list` / `stories.list` section types just render from those tables.

---

## 12. What this plan does not change

- The leads / clients / meetings CRM stays exactly as is.
- The auth model stays as is.
- `next-intl` cookie-based locale selection stays as is.
- `/admin/blog`, `/admin/resources`, `/admin/stories`, `/admin/clients`, `/admin/leads` stay as they are today.
