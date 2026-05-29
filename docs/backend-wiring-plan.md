# Backend Wiring Plan — Admin Portal

> Living document. Tick items off as they ship; capture decisions inline so we
> don't relitigate. Sibling to [adr/0001-application-and-org-inquiry-forms.md](adr/0001-application-and-org-inquiry-forms.md).

**Goal**: replace the mock data driving the admin UI (`src/app/admin/_mock.ts`)
with live Laravel API responses, one screen at a time, without regressing the
UI at any step.

**Frontend touchpoints**: [src/app/admin](../src/app/admin), [src/lib/api.ts](../src/lib/api.ts), [src/lib/session.ts](../src/lib/session.ts).
**Backend touchpoints**: [../../captor-back/app/Http/Controllers/Api](../../captor-back/app/Http/Controllers/Api), [../../captor-back/app/Models](../../captor-back/app/Models), [../../captor-back/database/migrations](../../captor-back/database/migrations), [../../captor-back/routes/api.php](../../captor-back/routes/api.php).

---

## Status legend

- [ ] not started
- [~] in progress
- [x] done

---

## Phase 0 — Audit & smoke test

Establish ground truth before changing anything.

- [x] Read every existing admin controller end-to-end:
  - [x] `DashboardController@index`
  - [x] `LeadController@index / show / update / addNote / addMeeting / decideApplication`
  - [ ] `PostController`, `ResourceController`, `StoryController` (lower priority, used by content sections)
- [x] Read every model used by the admin UI: `Lead`, `Application`, `ApplicationFile`, `Meeting`, `Note`, `OrgInquiry`, `ContactMessage`, `User`.
- [x] Read all migrations and capture the current schema (especially `leads`, the domain tables, and the "extend_for_proposal_alignment" delta).
- [ ] Confirm `php artisan migrate:fresh --seed` runs and seeds a working admin user (`admin@local.com / password`).
- [ ] `curl` each existing admin endpoint with the seeded admin token and dump the response shape.
- [x] Produce a **gap report** comparing the response shapes to the frontend types in [src/app/admin/_mock.ts](../src/app/admin/_mock.ts).
- [ ] Decide: migration deltas vs. JSON-resource field renames.

### Gap report

Pulled directly from reading the migrations, models, and controllers against
[src/app/admin/_mock.ts](../src/app/admin/_mock.ts).

#### `leads` — schema vs UI type

| Frontend (`Lead`)   | Backend column          | Status      | Action                                                                 |
| ------------------- | ----------------------- | ----------- | ---------------------------------------------------------------------- |
| `id` (number)       | `id` BIGINT             | ✅ match    | —                                                                      |
| `uuid` (string)     | **missing**             | ❌ gap      | **Add `uuid` column** to `leads` with index. Generate on create.       |
| `kind`              | `kind`                  | ✅ match    | —                                                                      |
| `status`            | `status`                | ✅ match    | —                                                                      |
| `assigned_user`     | `assigned_user_id` + eager load | ✅ match | Controller already includes `assignedUser:id,name,email`.            |
| `name/email/phone`  | same                    | ✅ match    | —                                                                      |
| `source`            | `source`                | ✅ match    | —                                                                      |
| `scheduled_at`      | `scheduled_at`          | ✅ match    | —                                                                      |
| `tags`              | `tags` jsonb            | ✅ match    | —                                                                      |
| `notes_count`       | `withCount('notes')`    | ✅ match    | `index` already loads `notes_count`.                                   |
| `meetings_count`    | `withCount('meetings')` | ✅ match    | Same.                                                                  |
| `created_at/updated_at` | same                | ✅ match    | —                                                                      |

#### `applications`

| Frontend (`ApplicationDetail`) | Backend                          | Status      | Action                                                                |
| ------------------------------ | -------------------------------- | ----------- | --------------------------------------------------------------------- |
| `status_self / status_other`   | same                             | ✅          | —                                                                     |
| `location / field`             | same                             | ✅          | —                                                                     |
| `goal / goal_other / targets`  | same                             | ✅          | —                                                                     |
| `timeline / budget / story`    | same                             | ✅          | —                                                                     |
| `newsletter`                   | same                             | ✅          | —                                                                     |
| `decision / decision_note / decided_at` | same                    | ✅          | Added by `extend_for_proposal_alignment`.                            |
| `files[]`                      | `application_files` table        | ✅          | Eager loaded via `application.files` in `show`.                       |

#### `notes`

| Frontend (`Note`)       | Backend             | Status   | Action                                                                                  |
| ----------------------- | ------------------- | -------- | --------------------------------------------------------------------------------------- |
| `id / body / created_at` | same               | ✅       | —                                                                                       |
| `author`                | `author_id` + eager | ✅       | `notes.author:id,name,email` already loaded.                                            |
| `kind` (`manual / system`) | **missing**      | ❌       | **Add `kind` enum column** to `notes` (default `manual`). Cast to string in the model.  |

Also need a new route + controller method for editing notes (Phase 6):
`PATCH /admin/leads/{lead}/notes/{note}` — manual only, author-or-admin gate.

#### `meetings`

| Frontend                 | Backend                            | Status | Action |
| ------------------------ | ---------------------------------- | ------ | ------ |
| `id / scheduled_at / status / notes` | same                  | ✅     | —      |
| `google_event_id / google_meet_link` | same                  | ✅     | —      |
| `scheduler`              | `scheduled_by` + eager             | ✅     | —      |

#### `contact_messages` and `org_inquiries`

Both shapes match 1:1.

#### `users`

| Frontend assumption     | Backend            | Status | Action                                                                  |
| ----------------------- | ------------------ | ------ | ----------------------------------------------------------------------- |
| `role` (`super_admin / admin / advisor`) | column exists with `super_admin` default | ✅ | Confirm `role` is migrated and surfaced through the auth `me` endpoint. |
| Bearer token            | Sanctum PAT        | ✅     | `/api/auth/login` returns `token`.                                      |

#### Endpoint shape vs UI expectations

| UI page                       | Controller / endpoint                            | Mismatch                                                                                                                                                                                |
| ----------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin` (dashboard)          | `GET /admin/dashboard`                           | Frontend [src/app/admin/_mock.ts](../src/app/admin/_mock.ts) `mockDashboard` includes an **`attention_items[]`** array and richer **`upcoming_meetings[]`** items (meet link, scheduler). Backend currently returns just lead rows with `scheduled_at`. Need to expand. |
| `/admin/leads`                | `GET /admin/leads`                               | Returns Laravel paginator (`data` + `links` + `meta`). Frontend currently expects a bare array. Either change the controller to return `{ data, meta }` and consume it, or wrap on the FE side. Also missing **`meta.counts`** for tab pills.   |
| `/admin/leads/[uuid]`         | `GET /admin/leads/{lead}`                        | Route-model binding currently resolves on `id`. **Switch to UUID resolution** (`getRouteKeyName` returning `uuid` or per-route binding). |
| Stage save                    | `PATCH /admin/leads/{lead}`                      | OK once UUID binding is in.                                                                                                                                                             |
| Decision (approve/decline)    | `POST /admin/leads/{lead}/decision`              | Auto-advances `status = qualified \| lost`. **Frontend model says `approved → contacted`, not `qualified`**. Pick one: update controller to `contacted` (matches the state-machine doc) or update the UI to expect `qualified`. **Decision: change controller to `contacted`** — keep the cleaner pipeline in the UI. |
| Add note                      | `POST /admin/leads/{lead}/notes`                 | OK. Need to also accept/return `kind: manual` and stamp system notes from the controller's other actions.                                                                              |
| Edit note                     | **missing**                                      | New route + method (Phase 6).                                                                                                                                                          |
| Schedule meeting              | `POST /admin/leads/{lead}/meetings`              | Calls `GoogleCalendarService` immediately. For local dev we'll need a "skip Google" path or a fake driver — confirm what happens when env keys aren't set. Also: this currently does NOT auto-advance lead status to `scheduled`; UI expects it to.                                                                                |
| Calendar widget               | **no endpoint yet**                              | Add `GET /admin/meetings?from=&to=` (Phase 4).                                                                                                                                          |

#### Seeders & factories

- Only `UserFactory` exists.
- No factories for `Lead / Application / Note / Meeting / ContactMessage / OrgInquiry`.
- `DatabaseSeeder` only seeds the two admin users.

**Action**: build factories + an `AdminDemoSeeder` that mirrors `mockLeads / mockDetails` so the API serves realistic data while we wire the UI. Put it behind `--class=AdminDemoSeeder` so prod seeds stay lean.

### Decisions captured

1. **Add `uuid` to `leads`** in a new migration; generate on create via the `Lead` model `booted()` hook.
2. **Add `kind` to `notes`** in the same migration; default `manual`.
3. **Decision endpoint auto-advances to `contacted`**, not `qualified`. Matches the UI state machine.
4. **Meeting endpoint auto-advances lead `status` to `scheduled`** in the same transaction.
5. **Route-model binding by `uuid`** for `/api/admin/leads/{lead}` and its sub-routes (override `getRouteKeyName()` on `Lead`).
6. **Tab counts** ship as `meta.counts` in the leads index response (computed once, regardless of filter).
7. **Pagination shape**: keep Laravel's default paginator `{ data, links, meta }`; frontend adapts.

### Phase 0.5 — Schema + seed delta (in progress)

Shipped in this pass:

- [x] [captor-back/database/migrations/2026_05_28_000000_align_with_admin_ui.php](../../captor-back/database/migrations/2026_05_28_000000_align_with_admin_ui.php) — adds `leads.uuid` (unique, backfilled), adds `notes.kind`.
- [x] [captor-back/app/Models/Lead.php](../../captor-back/app/Models/Lead.php) — `uuid` in `$fillable`, `booted()` UUID generator, `getRouteKeyName()` returns `uuid`, `HasFactory`.
- [x] [captor-back/app/Models/Note.php](../../captor-back/app/Models/Note.php) — `kind` in `$fillable`, `KIND_MANUAL/SYSTEM` constants, `HasFactory`.
- [x] [captor-back/app/Models/Application.php](../../captor-back/app/Models/Application.php), [Meeting.php](../../captor-back/app/Models/Meeting.php), [ContactMessage.php](../../captor-back/app/Models/ContactMessage.php), [OrgInquiry.php](../../captor-back/app/Models/OrgInquiry.php) — `HasFactory`.
- [x] [captor-back/app/Http/Controllers/Api/Admin/LeadController.php](../../captor-back/app/Http/Controllers/Api/Admin/LeadController.php):
  - `index` now returns `{ data, links, meta, counts }` with a tab-count breakdown.
  - `update` emits a `Note { kind: system }` on status change.
  - `addNote` stamps `kind: manual`.
  - new `updateNote(lead, note)` — manual only, author-or-admin gated.
  - `addMeeting` auto-advances `status` to `scheduled` and emits a system note.
  - `decideApplication` advances `approved → contacted` (not `qualified`) and `declined → lost`, plus system note.
- [x] [captor-back/routes/api.php](../../captor-back/routes/api.php) — `PATCH /admin/leads/{lead}/notes/{note}`.
- [x] Factories: [Lead](../../captor-back/database/factories/LeadFactory.php), [Application](../../captor-back/database/factories/ApplicationFactory.php), [Note](../../captor-back/database/factories/NoteFactory.php), [Meeting](../../captor-back/database/factories/MeetingFactory.php), [ContactMessage](../../captor-back/database/factories/ContactMessageFactory.php), [OrgInquiry](../../captor-back/database/factories/OrgInquiryFactory.php).
- [x] [captor-back/database/seeders/AdminDemoSeeder.php](../../captor-back/database/seeders/AdminDemoSeeder.php) — mirrors the six leads in `_mock.ts` (Derek, Naa/Bright Labs, Esi, Kojo, Ama, Mawuli) with notes, meetings, applications and files.

### Verification (run locally)

```powershell
cd captor-back
php artisan migrate
php artisan db:seed --class=AdminDemoSeeder

# Sanity check
php artisan tinker
> App\Models\Lead::count()                         # → 6 (or 6 + any prior demo data)
> App\Models\Lead::first()->uuid                   # → non-null UUID
> App\Models\Lead::where('status', 'lost')->count() # → 1 (Mawuli)
```

Then with a token from `/api/auth/login` (POST `{ email: "admin@local.com", password: "password" }`):

```powershell
$T = "<paste token>"
curl -H "Authorization: Bearer $T" http://localhost:8000/api/admin/leads | jq .counts
# → { all: 5, application: 2, org: 1, contact: 1, lost: 1 }

curl -H "Authorization: Bearer $T" `
  http://localhost:8000/api/admin/leads/01a4a1de-0001-4ad0-8e2f-0a1b2c3d4e01 | jq '.lead.notes | length'
# → 2
```



```php
Schema::table('leads', function (Blueprint $t) {
    $t->uuid('uuid')->nullable()->after('id')->unique();
});

// Backfill uuids for existing rows, then make NOT NULL.
DB::table('leads')->whereNull('uuid')->cursor()->each(fn ($r) =>
    DB::table('leads')->where('id', $r->id)->update(['uuid' => (string) Str::uuid()])
);

Schema::table('leads', function (Blueprint $t) {
    $t->uuid('uuid')->nullable(false)->change();
});

Schema::table('notes', function (Blueprint $t) {
    $t->string('kind')->default('manual')->after('body');
});
```

`Lead` model gets:

```php
protected static function booted(): void
{
    static::creating(fn (Lead $l) => $l->uuid ??= (string) Str::uuid());
}
public function getRouteKeyName(): string { return 'uuid'; }
```

`Note` model:

```php
protected $fillable = ['lead_id', 'author_id', 'body', 'kind'];
public const KIND_MANUAL = 'manual';
public const KIND_SYSTEM = 'system';
```

---

## Phase 1 — Dashboard

Wire `/admin` to live data.

- [x] Audit `DashboardController@index` against the shape consumed by:
  - [src/app/admin/page.tsx](../src/app/admin/page.tsx)
  - [src/app/admin/_AttentionPanel.tsx](../src/app/admin/_AttentionPanel.tsx)
  - [src/app/admin/_LeadsTable.tsx](../src/app/admin/_LeadsTable.tsx)
- [x] `DashboardController` already returns `{ totals, recent, upcoming_meetings }` matching `DashboardData`. No resource layer needed yet.
- [x] [src/app/admin/page.tsx](../src/app/admin/page.tsx) now calls `apiFetch<DashboardData>("/api/admin/dashboard")` server-side with a `mockDashboard` fallback + visible "demo data" banner when the backend is unreachable.
- [x] `CalendarOverview`, `AttentionPanel`, and `LeadsTable` accept an optional `leads` / `rows` prop and default to `mockLeads` for backwards compat. The dashboard now hands them `data.recent`.
- [ ] Calendar widget stays on `recent` until Phase 4 ships a real `/admin/meetings` endpoint.
- [ ] Smoke test: log in, load `/admin`, confirm counts and recent leads come from the backend.

### Verification

```powershell
# In one shell
cd captor-back; php artisan serve

# In another
cd captor-front; pnpm dev
# → http://localhost:3000/admin
# Demo banner should disappear once you log in and the API call succeeds.
```

---

## Phase 2 — Leads list (`/admin/leads`)

- [x] Audit `LeadController@index` — already supports `kind`, `status`, `assignee`, `q`, `per_page` and ships `meta.counts` (added in 0.5).
- [x] [src/app/admin/leads/page.tsx](../src/app/admin/leads/page.tsx) is now `async`; it server-fetches `/api/admin/leads?per_page=100` and passes `initialLeads` + `initialCounts` into `<LeadsManager />`. Falls back to mock + dashed banner on failure.
- [x] `LeadsManager` accepts `{ initialLeads, initialCounts, live, offlineMessage }`; counts come from the server when present.
- [x] URL contract (`?kind=…&status=…&assignee=…&q=…`) preserved on the client side.
- [x] **Phase 2.1** — Server now reads `searchParams` and forwards `kind` + `status` + `q` into `/api/admin/leads`. Client `router.replace` to a new query re-runs the server component (App Router re-renders on `searchParams` change), so filter changes round-trip to the backend.
  - `kind=lost` is rewritten to `status=lost` at the page boundary (UI shape → backend shape).
  - `assignee=mine|unassigned` stays a UI-only refinement until the backend grows a `me` alias.
- [ ] Smoke test: filter switches work; archived tab returns lost leads.

---

## Phase 3 — Lead detail (`/admin/leads/[uuid]`)

- [x] Audit `LeadController@show` — already returns Lead + `notes` (with `kind` + author) + `meetings` + (`application` with `files` | `org_inquiry` | `contact_message`).
- [x] Server-side: [src/app/admin/leads/[id]/page.tsx](../src/app/admin/leads/%5Bid%5D/page.tsx) fetches `/api/admin/leads/{uuid}`; 404 → `notFound()`; other errors → mock fallback + dashed banner.
- [x] Server actions in [src/app/admin/leads/[id]/_actions.ts](../src/app/admin/leads/%5Bid%5D/_actions.ts):
  - [x] `updateLeadStageAction(uuid, { status, assigned_user_id })` → `PATCH /admin/leads/{uuid}`.
  - [x] `addLeadNoteAction(uuid, body)` → `POST /admin/leads/{uuid}/notes`.
  - [x] `editLeadNoteAction(uuid, noteId, body)` → `PATCH /admin/leads/{uuid}/notes/{noteId}`.
  - [x] `decideApplicationAction(uuid, { decision, note })` → `POST /admin/leads/{uuid}/decision` — fires `ApplicationDecisionMail`.
  - [x] `scheduleMeetingAction(uuid, { scheduled_at })` → `POST /admin/leads/{uuid}/meetings` — fires `MeetingScheduledMail` and (via the controller) auto-advances status + appends a system note.
  - Each action calls `revalidatePath` for `/admin/leads/{uuid}`, `/admin/leads`, and `/admin`.
- [x] Client `_LeadDetailView` keeps its optimistic UX. After the optimistic update it `startTransition`s the matching server action; on `!ok` it pushes a `warn` toast. Backend-driven system notes will hydrate on the next navigation thanks to revalidation.
- [x] Mock-mode (`live === false`) skips server calls so the demo still works without the backend.

### Open follow-ups for Phase 3.x

- [x] Reconcile optimistic note IDs with the server-assigned IDs immediately. `editNote` now overwrites with the server's authoritative copy; `decideApplication` and `scheduleMeeting` controllers now also return the full lead (with `notes.author` + `meetings.scheduler` eager-loaded via `LeadResource`), and the client swaps the local `notes` state for the server's list on success.
- [x] `LeadResource` ([../../captor-back/app/Http/Resources/LeadResource.php](../../captor-back/app/Http/Resources/LeadResource.php)) — locks the lead JSON shape (`id, uuid, kind, status, assigned_user, notes, meetings, contact_message, org_inquiry, application.files`). Wired into `LeadController@index/show/update/decideApplication`.
- [x] Stage-form `Save` button — `onSave` now hands the parent `{ status, assignedUserId }`; `_LeadDetailView` routes it through `updateLeadStageAction({ status, assigned_user_id })`.

---

## Phase 4 — Meetings & calendar

- [x] New endpoint: `GET /admin/meetings?from=&to=` ([MeetingController.php](../../captor-back/app/Http/Controllers/Api/Admin/MeetingController.php)). Eager-loads the lead summary (`id, uuid, kind, name, email, status`) and the scheduler. Defaults to a 7d-back / 30d-forward window.
- [x] Wired into [src/app/admin/page.tsx](../src/app/admin/page.tsx) — fetches a wider window (14d / 60d), maps `MeetingRow → Lead`-shaped objects, hands them to `<CalendarOverview leads={...} />`. Falls back to `data.recent` silently if the new endpoint fails.
- [x] LeadResource freezes the JSON contract so the calendar widget keeps working when the model picks up new attrs.
- [ ] (Deferred) Google Calendar sync — schema already has `google_event_id` / `google_meet_link`. Wire when API access is provisioned.

---

## Phase 5 — Auth glue

- [x] `POST /api/auth/login` wired through [src/app/actions/auth.ts](../src/app/actions/auth.ts) → [src/lib/session.ts](../src/lib/session.ts) httpOnly cookie. Server action now honors `?next=` from the middleware bounce (safe local paths only, otherwise role-route to `/admin` or `/`).
- [x] `GET /api/auth/me` wired through [src/lib/auth.ts](../src/lib/auth.ts). On `401/419`, the stale session cookie is cleared so we don't loop middleware → layout → /me on every request.
- [x] `requireAdmin()` in [src/app/admin/layout.tsx](../src/app/admin/layout.tsx) — redirects unauthenticated to `/login`, non-admin roles to `/`.
- [x] Real logout flow — sidebar `Sign out` form posts to `logoutAction` which hits `POST /api/auth/logout`, clears the cookie, and redirects to `/login`.
- [x] [src/app/login/page.tsx](../src/app/login/page.tsx) reads `?next=` (awaited `searchParams`) and forwards it to `<LoginForm next={…} />` as a hidden field. If the user is already authenticated, they're redirected straight to `next` (or role home).
- [x] [src/middleware.ts](../src/middleware.ts) bounces `/admin/*` to `/login?next=…` when no cookie is present.

---

## Phase 6 — Edit notes + server-side system notes

- [x] `PATCH /admin/leads/{uuid}/notes/{note}` route + `LeadController@updateNote` (manual only, author-or-admin gate) wired in [routes/api.php](../../captor-back/routes/api.php).
- [x] `notes.kind` column already exists; backend emits `KIND_SYSTEM` notes from `update`, `addMeeting`, `decideApplication`, and `convertToClient`.
- [x] `LeadController::update()` now eager-loads `notes.author` + `meetings.scheduler` so frontend reconciliation works on stage saves.
- [x] Frontend [_LeadDetailView.tsx](../src/app/admin/leads/%5Bid%5D/_LeadDetailView.tsx) only emits optimistic system notes when `!live`; when live, the response's `lead.notes` replaces the optimistic copy, eliminating drift/duplication.

---

## Phase 7 — Clients

- [x] Migration [2026_05_29_000000_create_clients_table.php](../../captor-back/database/migrations/2026_05_29_000000_create_clients_table.php) — `name`, `email`, `phone`, `program`, `consultant_id` (FK users), `status`, `start_date`, `next_milestone_label`, `next_milestone_due_at`, `satisfaction`, `source_lead_id` (FK leads). UUID column for URL routing.
- [x] [Client model](../../captor-back/app/Models/Client.php) — UUID auto, `getRouteKeyName = 'uuid'`, `belongsTo` consultant + sourceLead, status/program constants.
- [x] [ClientFactory](../../captor-back/database/factories/ClientFactory.php) + 6 demo rows in [AdminDemoSeeder](../../captor-back/database/seeders/AdminDemoSeeder.php) using the same UUIDs as `_mock.ts` so the UI stays in parity.
- [x] [ClientController@index/show/update](../../captor-back/app/Http/Controllers/Api/Admin/ClientController.php) — filters (`status`, `program`, `consultant=assigned|unassigned`, `q`), `counts` summary in `additional()`. [ClientResource](../../captor-back/app/Http/Resources/ClientResource.php) bundles `next_milestone` as `{label, due_at}` and exposes `consultant` via `whenLoaded`.
- [x] Routes registered in the admin Sanctum group: `GET /admin/clients`, `GET /admin/clients/{client}`, `PATCH /admin/clients/{client}`.
- [x] [clients/page.tsx](../src/app/admin/clients/page.tsx) now server-fetches `/api/admin/clients?per_page=200` and forwards `{initialClients, initialCounts, live}` to `<ClientsManager />`. Mock fallback + dashed banner on backend failure.
- [x] [_ClientsManager.tsx](../src/app/admin/clients/_ClientsManager.tsx) accepts `initialClients`/`initialCounts`/`live` props; counts use server numbers when present.
- [x] **Lead → Client conversion**: `POST /admin/leads/{lead}/convert` ([LeadController@convertToClient](../../captor-back/app/Http/Controllers/Api/Admin/LeadController.php)) creates a Client with `source_lead_id`, emits a system note, idempotent. UI: a "Convert to client" panel appears in `/admin/leads/[uuid]` whenever `status === "won"`; after success it links to the new client.

---

## Phase 8 — Content sections

- [x] Backend `PostController` / `ResourceController` / `StoryController` (`apiResource` CRUD) wired into the admin Sanctum group ([routes/api.php](../../captor-back/routes/api.php)). All three controllers do slug auto-generation, server-side filtering (`status`, `format`/`outcome`, `q`), and `latest()` ordering.
- [x] Frontend list pages — [/admin/blog](../src/app/admin/blog/page.tsx), [/admin/resources](../src/app/admin/resources/page.tsx), [/admin/stories](../src/app/admin/stories/page.tsx) — now server-fetch from the API, forward filters/search as query params, fall back to `_mock.ts` with a dashed banner if the backend is unreachable. `?deleted=1` shows a confirmation banner.
- [x] Frontend edit pages — [/admin/blog/[id]/edit](../src/app/admin/blog/%5Bid%5D/edit/page.tsx), [/admin/resources/[id]/edit](../src/app/admin/resources/%5Bid%5D/edit/page.tsx), [/admin/stories/[id]/edit](../src/app/admin/stories/%5Bid%5D/edit/page.tsx) — server-fetch by id, `notFound()` on real 404, mock-fallback (with banner) on other errors. `?saved=1` shows a confirmation banner.
- [x] Forms ([blog/_form.tsx](../src/app/admin/blog/_form.tsx), [resources/_form.tsx](../src/app/admin/resources/_form.tsx), [stories/_form.tsx](../src/app/admin/stories/_form.tsx)) are now client components driven by `useActionState` against `save{Post,Resource,Story}Action`. Successful saves redirect to `…/edit?saved=1`. Tags are split client-side on commas.
- [x] Delete uses a separate server action submitted by a colocated `<form>` with native `confirm()` guard. Server action calls `revalidatePath` and redirects to `…?deleted=1`.

These mirror the leads pattern: per-section colocated `_actions.ts`, server pages own the fetch, client components own the optimistic/interactive state.

---

## Phase 9 — Public site → backend lead intake

- [x] All three public forms now create real `Lead` rows via the existing `/api/public/*` endpoints (server actions in [src/app/actions/publicForms.ts](../src/app/actions/publicForms.ts), `anonymous: true`).
- [x] [Contact page](../src/app/contact/page.tsx) → `POST /api/public/contact` (`KIND_CONTACT` lead + `ContactMessage`). Inline error banner on backend failure; success state shown when received.
- [x] [Organization inquiry modal](../src/components/forms/OrgInquiryModal.tsx) → `POST /api/public/org-inquiry` (`KIND_ORG` lead + `OrgInquiry`, contact auto-classified as email/phone). Button shows "Sending…" while pending.
- [x] [Apply form](../src/app/apply/page.tsx) → `POST /api/public/applications` (multipart, `KIND_APPLICATION` lead + `Application` + uploaded `ApplicationFile` rows). All multi-step fields serialized into `FormData`; submit button disables during upload; backend errors surface in the existing step-error banner.
- [x] Calls go server→server via the Next.js server action, so no CORS / token concerns. Backend already responds `201 {id, status:"received"}` and the existing success UI is unchanged.

---

## Cross-cutting decisions

| Decision                        | Choice                                                                  | Reason                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Identifier in admin URLs        | `uuid`                                                                  | Already enforced in the UI; avoids leaking sequential IDs.             |
| Mutation style                  | Server actions in colocated `_actions.ts` files                         | Lets us call `revalidatePath` cleanly; keeps tokens server-only.       |
| System notes                    | Backend writes them inside the same transaction as the lifecycle event  | Single source of truth; can't drift between client and server.         |
| Lost leads                      | `status = "lost"` and partitioned into the Archived tab                 | Already shipped on the frontend.                                       |
| Email side-effects              | Backend dispatches the `ApplicationDecisionMail` job; frontend just toasts | Don't trust the client to send mail.                                  |

---

## Open questions

- Does `LeadController@index` already return `meta.counts` for the tab pills, or do we need to add it?
- Are the public form endpoints already creating `Lead` rows with `uuid` populated? (Check the `Lead` migration / model.)
- Do we have a soft-delete column on `leads`, or is `status = "lost"` the only archive mechanism?
- For the calendar in the dashboard, do we want `Meeting` rows from all leads regardless of status, or only active (`scheduled`)?
