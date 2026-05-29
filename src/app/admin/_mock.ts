// Mock data for the admin portal — mirrors the shape returned by /api/admin/*.
// Swap to the real API once the UI is locked in.

export type LeadKind = "contact" | "org" | "application";
export type LeadStatus = "new" | "contacted" | "scheduled" | "qualified" | "won" | "lost";
export type ApplicationDecision = "pending" | "approved" | "declined";

export type Lead = {
  id: number;
  uuid: string;
  kind: LeadKind;
  status: LeadStatus;
  assigned_user?: { id: number; name: string; email: string } | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  scheduled_at: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  notes_count: number;
  meetings_count: number;
};

export type Note = {
  id: number;
  body: string;
  created_at: string;
  author: { id: number; name: string; email: string };
  /**
   * Manual notes are written by an admin. System notes are auto-emitted by the
   * app when lifecycle events fire (decision recorded, status changed, meeting
   * scheduled). The UI renders them differently and they are read-only.
   */
  kind?: "manual" | "system";
};

export type Meeting = {
  id: number;
  scheduled_at: string;
  status: "scheduled" | "completed" | "no_show" | "canceled";
  notes: string | null;
  google_event_id: string | null;
  google_meet_link: string | null;
  scheduler: { id: number; name: string; email: string } | null;
};

export type ContactDetail = { topic: string; message: string };
export type OrgDetail = {
  about: string;
  role: string;
  organization: string;
  contact_kind: "email" | "phone";
  contact_value: string;
};
export type ApplicationFile = {
  id: number;
  original_name: string;
  mime: string | null;
  size: number;
  path: string;
};
export type ApplicationDetail = {
  status_self: string;
  status_other: string | null;
  location: string;
  field: string;
  goal: string;
  goal_other: string | null;
  targets: string[];
  timeline: string;
  budget: string;
  story: string | null;
  newsletter: boolean;
  decision: ApplicationDecision;
  decision_note: string | null;
  decided_at: string | null;
  files: ApplicationFile[];
};

export type LeadDetail = Lead & {
  notes: Note[];
  meetings: Meeting[];
  contact_message?: ContactDetail;
  org_inquiry?: OrgDetail;
  application?: ApplicationDetail;
};

const admin = { id: 1, name: "Career360 Admin", email: "admin@career360consult.com" };
const advisor = { id: 2, name: "Akua Mensah", email: "akua@career360consult.com" };

/* ----------------------- Leads ----------------------- */

export const mockLeads: Lead[] = [
  {
    id: 101,
    uuid: "01a4a1de-0001-4ad0-8e2f-0a1b2c3d4e01",
    kind: "application",
    status: "new",
    assigned_user: null,
    name: "Derek Osei",
    email: "derek.osei@example.com",
    phone: "+233 24 412 3456",
    source: "linkedin",
    scheduled_at: null,
    tags: ["UK", "PhD"],
    created_at: "2026-05-27T09:12:00Z",
    updated_at: "2026-05-27T09:12:00Z",
    notes_count: 2,
    meetings_count: 0,
  },
  {
    id: 102,
    uuid: "01a4a1de-0002-4ad0-8e2f-0a1b2c3d4e02",
    kind: "org",
    status: "contacted",
    assigned_user: advisor,
    name: "Naa Adoley Ankrah",
    email: "naa@brightlabs.gh",
    phone: null,
    source: "org-inquiry-modal",
    scheduled_at: null,
    tags: ["partnership", "warm"],
    created_at: "2026-05-26T14:33:00Z",
    updated_at: "2026-05-27T08:00:00Z",
    notes_count: 2,
    meetings_count: 0,
  },
  {
    id: 103,
    uuid: "01a4a1de-0003-4ad0-8e2f-0a1b2c3d4e03",
    kind: "contact",
    status: "scheduled",
    assigned_user: admin,
    name: "Selasi Komla",
    email: "selasi@example.com",
    phone: null,
    source: "contact-page",
    scheduled_at: "2026-05-30T15:00:00Z",
    tags: null,
    created_at: "2026-05-25T11:05:00Z",
    updated_at: "2026-05-26T09:42:00Z",
    notes_count: 1,
    meetings_count: 1,
  },
  {
    id: 104,
    uuid: "01a4a1de-0004-4ad0-8e2f-0a1b2c3d4e04",
    kind: "application",
    status: "qualified",
    assigned_user: advisor,
    name: "Kojo Boateng",
    email: "kojo@example.com",
    phone: "+233 20 555 9091",
    source: "referral",
    scheduled_at: "2026-06-02T10:30:00Z",
    tags: ["Canada", "scholarship"],
    created_at: "2026-05-22T08:21:00Z",
    updated_at: "2026-05-26T16:10:00Z",
    notes_count: 3,
    meetings_count: 1,
  },
  {
    id: 105,
    uuid: "01a4a1de-0005-4ad0-8e2f-0a1b2c3d4e05",
    kind: "application",
    status: "won",
    assigned_user: admin,
    name: "Ama Owusu",
    email: "ama@example.com",
    phone: null,
    source: "google",
    scheduled_at: null,
    tags: ["closed", "MBA"],
    created_at: "2026-05-10T13:00:00Z",
    updated_at: "2026-05-24T17:22:00Z",
    notes_count: 5,
    meetings_count: 2,
  },
  {
    id: 106,
    uuid: "01a4a1de-0006-4ad0-8e2f-0a1b2c3d4e06",
    kind: "contact",
    status: "lost",
    assigned_user: null,
    name: "Mawuli Tete",
    email: "mawuli@example.com",
    phone: null,
    source: "contact-page",
    scheduled_at: null,
    tags: null,
    created_at: "2026-04-30T08:00:00Z",
    updated_at: "2026-05-05T08:00:00Z",
    notes_count: 1,
    meetings_count: 0,
  },
];

export const mockDetails: Record<string, LeadDetail> = {
  "01a4a1de-0001-4ad0-8e2f-0a1b2c3d4e01": {
    ...mockLeads[0],
    notes: [
      {
        id: 101,
        body: "Application received via the website.",
        created_at: "2026-05-27T08:12:00Z",
        author: admin,
        kind: "system",
      },
      {
        id: 102,
        body: "Strong CS background — worth a discovery call once approved.",
        created_at: "2026-05-27T09:05:00Z",
        author: advisor,
        kind: "manual",
      },
    ],
    meetings: [],
    application: {
      status_self: "graduate-recent",
      status_other: null,
      location: "Accra, Ghana",
      field: "Computer Science",
      goal: "study-abroad",
      goal_other: null,
      targets: ["United Kingdom", "Germany", "Netherlands"],
      timeline: "3-6",
      budget: "scholarship",
      story:
        "Two years out of university, currently a backend engineer at a fintech. Looking at applied ML masters with funding.",
      newsletter: true,
      decision: "pending",
      decision_note: null,
      decided_at: null,
      files: [
        { id: 1, original_name: "CV-Derek-Osei.pdf", mime: "application/pdf", size: 184320, path: "applications/101/cv.pdf" },
        { id: 2, original_name: "transcript.pdf", mime: "application/pdf", size: 422912, path: "applications/101/transcript.pdf" },
      ],
    },
  },
  "01a4a1de-0002-4ad0-8e2f-0a1b2c3d4e02": {
    ...mockLeads[1],
    notes: [
      { id: 1, body: "Replied with an intro deck and the standard discovery questions.", created_at: "2026-05-27T07:00:00Z", author: advisor },
      { id: 2, body: "Asked for org headcount + current L&D budget shape.", created_at: "2026-05-27T08:00:00Z", author: advisor },
    ],
    meetings: [],
    org_inquiry: {
      about:
        "We're a 24-person engineering team. Onboarding the last six hires has been rough — looking for structured advising for new engineers in their first 90 days.",
      role: "Head of Engineering",
      organization: "Bright Labs",
      contact_kind: "email",
      contact_value: "naa@brightlabs.gh",
    },
  },
  "01a4a1de-0003-4ad0-8e2f-0a1b2c3d4e03": {
    ...mockLeads[2],
    notes: [
      { id: 3, body: "Called twice, sent Google Calendar invite for the 30-min discovery slot on Saturday.", created_at: "2026-05-26T09:42:00Z", author: admin },
    ],
    meetings: [
      {
        id: 1,
        scheduled_at: "2026-05-30T15:00:00Z",
        status: "scheduled",
        notes: null,
        google_event_id: "gcal_a1B2c3D4e5F6g7H8",
        google_meet_link: "https://meet.google.com/kya-rfvb-zpe",
        scheduler: admin,
      },
    ],
    contact_message: {
      topic: "advising",
      message:
        "Mid-career switch from accounting into product management. I'd like to talk through how realistic a 6-month runway is.",
    },
  },
  "01a4a1de-0004-4ad0-8e2f-0a1b2c3d4e04": {
    ...mockLeads[3],
    notes: [
      { id: 4, body: "Strong fit. GMAT 720, two scholarship-friendly schools shortlisted.", created_at: "2026-05-25T10:00:00Z", author: advisor },
      { id: 5, body: "Drafted recommender list together. Two confirmed, one pending.", created_at: "2026-05-26T11:00:00Z", author: advisor },
      { id: 6, body: "Sent UWaterloo MASc track materials.", created_at: "2026-05-26T16:00:00Z", author: advisor },
    ],
    meetings: [
      {
        id: 2,
        scheduled_at: "2026-06-02T10:30:00Z",
        status: "scheduled",
        notes: "Mock interview + essay review.",
        google_event_id: "gcal_q9R8s7T6u5V4w3X2",
        google_meet_link: "https://meet.google.com/jhd-cqps-mvr",
        scheduler: advisor,
      },
    ],
    application: {
      status_self: "professional",
      status_other: null,
      location: "Kumasi, Ghana",
      field: "Mechanical Engineering",
      goal: "study-abroad",
      goal_other: null,
      targets: ["Canada", "United States"],
      timeline: "6-12",
      budget: "scholarship",
      story:
        "Five years in oil & gas mechanical roles. Pivoting toward renewables / clean energy research masters.",
      newsletter: false,
      decision: "approved",
      decision_note: "Approved for advisory. Schedule mock interview next.",
      decided_at: "2026-05-25T10:00:00Z",
      files: [
        { id: 3, original_name: "kojo-cv.pdf", mime: "application/pdf", size: 198432, path: "applications/104/cv.pdf" },
      ],
    },
  },
  "01a4a1de-0005-4ad0-8e2f-0a1b2c3d4e05": {
    ...mockLeads[4],
    notes: [
      { id: 7, body: "INSEAD MBA offer signed. Onboarding into alumni cohort.", created_at: "2026-05-24T17:22:00Z", author: admin },
    ],
    meetings: [],
    application: {
      status_self: "professional",
      status_other: null,
      location: "Accra, Ghana",
      field: "Banking",
      goal: "study-abroad",
      goal_other: null,
      targets: ["France", "Singapore"],
      timeline: "0-3",
      budget: "employer",
      story: "Sponsored by current employer. Decision finalised — INSEAD intake.",
      newsletter: true,
      decision: "approved",
      decision_note: null,
      decided_at: "2026-05-12T09:00:00Z",
      files: [],
    },
  },
  "01a4a1de-0006-4ad0-8e2f-0a1b2c3d4e06": {
    ...mockLeads[5],
    notes: [
      { id: 8, body: "No response after three follow-ups over two weeks. Marking lost.", created_at: "2026-05-05T08:00:00Z", author: admin },
    ],
    meetings: [],
    contact_message: {
      topic: "other",
      message: "Hi, do you do CV reviews?",
    },
  },
};

/* ----------------------- Dashboard ----------------------- */

/* ----------------------- Clients --------------------- */

export type ClientStatus = "onboarding" | "active" | "on_hold" | "completed" | "churned";
export type ClientProgram =
  | "study-abroad"
  | "scholarship"
  | "career-coaching"
  | "test-prep"
  | "org-partnership";

export type Client = {
  id: number;
  uuid: string;
  name: string;
  email: string | null;
  phone: string | null;
  program: ClientProgram;
  consultant: { id: number; name: string; email: string } | null;
  status: ClientStatus;
  start_date: string;
  next_milestone: { label: string; due_at: string } | null;
  satisfaction: number | null;
  /** Originating lead, if converted. */
  source_lead_id: number | null;
  created_at: string;
  updated_at: string;
};

export const clientProgramLabels: Record<ClientProgram, string> = {
  "study-abroad": "Study abroad",
  scholarship: "Scholarship support",
  "career-coaching": "Career coaching",
  "test-prep": "Test prep",
  "org-partnership": "Org partnership",
};

export const clientStatusLabels: Record<ClientStatus, string> = {
  onboarding: "Onboarding",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  churned: "Churned",
};

export const mockClients: Client[] = [
  {
    id: 9001,
    uuid: "01a4b2cf-0001-4ad0-9f2f-0a1b2c3d4e01",
    name: "Ama Owusu",
    email: "ama@example.com",
    phone: null,
    program: "study-abroad",
    consultant: admin,
    status: "active",
    start_date: "2026-05-25T00:00:00Z",
    next_milestone: { label: "SOP first draft", due_at: "2026-06-05T17:00:00Z" },
    satisfaction: 5,
    source_lead_id: 105,
    created_at: "2026-05-25T10:00:00Z",
    updated_at: "2026-05-28T14:22:00Z",
  },
  {
    id: 9002,
    uuid: "01a4b2cf-0002-4ad0-9f2f-0a1b2c3d4e02",
    name: "Yaw Boakye",
    email: "yaw@example.com",
    phone: "+233 26 778 1212",
    program: "scholarship",
    consultant: advisor,
    status: "onboarding",
    start_date: "2026-05-28T00:00:00Z",
    next_milestone: { label: "Intake call", due_at: "2026-06-01T10:00:00Z" },
    satisfaction: null,
    source_lead_id: null,
    created_at: "2026-05-28T09:30:00Z",
    updated_at: "2026-05-28T09:30:00Z",
  },
  {
    id: 9003,
    uuid: "01a4b2cf-0003-4ad0-9f2f-0a1b2c3d4e03",
    name: "BrightLabs Academy",
    email: "naa@brightlabs.gh",
    phone: null,
    program: "org-partnership",
    consultant: advisor,
    status: "active",
    start_date: "2026-04-10T00:00:00Z",
    next_milestone: { label: "Q2 cohort kickoff", due_at: "2026-06-10T09:00:00Z" },
    satisfaction: 4,
    source_lead_id: 102,
    created_at: "2026-04-10T09:00:00Z",
    updated_at: "2026-05-22T11:10:00Z",
  },
  {
    id: 9004,
    uuid: "01a4b2cf-0004-4ad0-9f2f-0a1b2c3d4e04",
    name: "Selasi Komla",
    email: "selasi@example.com",
    phone: null,
    program: "career-coaching",
    consultant: admin,
    status: "on_hold",
    start_date: "2026-03-15T00:00:00Z",
    next_milestone: { label: "Resume mock interview", due_at: "2026-06-12T15:00:00Z" },
    satisfaction: 4,
    source_lead_id: 103,
    created_at: "2026-03-15T08:00:00Z",
    updated_at: "2026-05-18T10:00:00Z",
  },
  {
    id: 9005,
    uuid: "01a4b2cf-0005-4ad0-9f2f-0a1b2c3d4e05",
    name: "Kwesi Mensah",
    email: "kwesi@example.com",
    phone: "+233 24 119 4400",
    program: "test-prep",
    consultant: advisor,
    status: "completed",
    start_date: "2025-12-01T00:00:00Z",
    next_milestone: null,
    satisfaction: 5,
    source_lead_id: null,
    created_at: "2025-12-01T08:00:00Z",
    updated_at: "2026-04-30T17:00:00Z",
  },
  {
    id: 9006,
    uuid: "01a4b2cf-0006-4ad0-9f2f-0a1b2c3d4e06",
    name: "Efua Asare",
    email: "efua@example.com",
    phone: null,
    program: "study-abroad",
    consultant: null,
    status: "onboarding",
    start_date: "2026-05-29T00:00:00Z",
    next_milestone: { label: "Assign consultant", due_at: "2026-05-31T09:00:00Z" },
    satisfaction: null,
    source_lead_id: null,
    created_at: "2026-05-29T08:15:00Z",
    updated_at: "2026-05-29T08:15:00Z",
  },
];

export type DashboardData = {
  totals: {
    leads: number;
    new: number;
    scheduled: number;
    won: number;
    lost: number;
    applications: number;
    org_inquiries: number;
    contacts: number;
  };
  recent: Lead[];
  upcoming_meetings: Array<Pick<Lead, "id" | "uuid" | "kind" | "name" | "email" | "scheduled_at">>;
};

export const mockDashboard: DashboardData = {
  totals: {
    leads: mockLeads.length,
    new: mockLeads.filter((l) => l.status === "new").length,
    scheduled: mockLeads.filter((l) => l.status === "scheduled").length,
    won: mockLeads.filter((l) => l.status === "won").length,
    lost: mockLeads.filter((l) => l.status === "lost").length,
    applications: mockLeads.filter((l) => l.kind === "application").length,
    org_inquiries: mockLeads.filter((l) => l.kind === "org").length,
    contacts: mockLeads.filter((l) => l.kind === "contact").length,
  },
  recent: [...mockLeads].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  upcoming_meetings: mockLeads
    .filter((l) => l.scheduled_at && l.scheduled_at >= new Date().toISOString())
    .sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? "")),
};

/* ----------------------- Blog posts ----------------------- */

export type PostStatus = "draft" | "published";

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  status: PostStatus;
  tags: string[] | null;
  author: { id: number; name: string };
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const mockPosts: Post[] = [
  {
    id: 1,
    slug: "how-to-pick-a-masters-program-in-2026",
    title: "How to pick a master's program in 2026",
    excerpt:
      "A practical, honest framework for ranking programs by fit, funding, and post-grad placement.",
    body: "## The short version\n\nDon't optimise for prestige. Optimise for **fit × funding × placement**.\n\n…",
    cover_image: "https://images.example.com/blog/masters-2026.jpg",
    status: "published",
    tags: ["study-abroad", "decisions"],
    author: { id: 1, name: "Career360 Admin" },
    published_at: "2026-05-20T09:00:00Z",
    created_at: "2026-05-19T08:00:00Z",
    updated_at: "2026-05-20T09:00:00Z",
  },
  {
    id: 2,
    slug: "scholarships-2026-the-six-applications-that-actually-paid-off",
    title: "Scholarships 2026: the six applications that actually paid off",
    excerpt:
      "We tracked outcomes across 50 clients. Here are the six funding pipes that consistently land offers.",
    body: "Lorem ipsum…",
    cover_image: null,
    status: "published",
    tags: ["scholarships", "funding"],
    author: { id: 2, name: "Akua Mensah" },
    published_at: "2026-05-12T11:30:00Z",
    created_at: "2026-05-11T10:00:00Z",
    updated_at: "2026-05-12T11:30:00Z",
  },
  {
    id: 3,
    slug: "draft-cv-mistakes-we-keep-seeing",
    title: "CV mistakes we keep seeing",
    excerpt: "Five formatting and content patterns that quietly kill applications.",
    body: null,
    cover_image: null,
    status: "draft",
    tags: ["cv", "applications"],
    author: { id: 2, name: "Akua Mensah" },
    published_at: null,
    created_at: "2026-05-26T15:42:00Z",
    updated_at: "2026-05-27T08:10:00Z",
  },
];

/* ----------------------- Resources ----------------------- */

export type ResourceFormat = "guide" | "document" | "video" | "audio" | "external";
export type ResourceStatus = "draft" | "published";

export type ResourceItem = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  format: ResourceFormat;
  file_path: string | null;
  file_label: string | null;
  external_url: string | null;
  cover_image: string | null;
  status: ResourceStatus;
  tags: string[] | null;
  author: { id: number; name: string };
  created_at: string;
  updated_at: string;
};

export const mockResources: ResourceItem[] = [
  {
    id: 1,
    slug: "scholarship-readiness-guide",
    title: "Scholarship Readiness Guide",
    description:
      "A 28-page printable workbook that walks through eligibility, document prep, and timeline planning.",
    format: "guide",
    file_path: "resources/guides/scholarship-readiness.pdf",
    file_label: null,
    external_url: null,
    cover_image: null,
    status: "published",
    tags: ["scholarship", "workbook"],
    author: { id: 1, name: "Career360 Admin" },
    created_at: "2026-04-12T09:00:00Z",
    updated_at: "2026-04-12T09:00:00Z",
  },
  {
    id: 2,
    slug: "interview-prep-walkthrough",
    title: "Interview prep walkthrough (video)",
    description: "45-minute walkthrough covering behavioural and case interview structure.",
    format: "video",
    file_path: null,
    file_label: null,
    external_url: "https://youtu.be/example",
    cover_image: null,
    status: "published",
    tags: ["interview"],
    author: { id: 2, name: "Akua Mensah" },
    created_at: "2026-05-01T10:00:00Z",
    updated_at: "2026-05-01T10:00:00Z",
  },
  {
    id: 3,
    slug: "study-abroad-checklist",
    title: "Study abroad checklist",
    description: "Pre-departure checklist covering visa, finance, accommodation, mental health.",
    format: "document",
    file_path: "resources/docs/study-abroad-checklist.pdf",
    file_label: null,
    external_url: null,
    cover_image: null,
    status: "draft",
    tags: ["checklist"],
    author: { id: 1, name: "Career360 Admin" },
    created_at: "2026-05-26T11:00:00Z",
    updated_at: "2026-05-26T11:00:00Z",
  },
];

/* ----------------------- Stories ----------------------- */

export type StoryOutcome =
  | "admission"
  | "scholarship"
  | "placement"
  | "transition"
  | "achievement";

export type StoryCategory = "School" | "Scholarship" | "Job" | "Career";

export type Story = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  quote: string | null;
  body: string | null;
  person_name: string;
  person_role: string | null;
  outcome: StoryOutcome | null;
  outcome_label: string | null;
  categories: StoryCategory[] | null;
  cover_image: string | null;
  gallery: string[] | null;
  status: "draft" | "published";
  author: { id: number; name: string };
  created_at: string;
  updated_at: string;
};

export const mockStories: Story[] = [
  {
    id: 1,
    slug: "ama-owusu-insead-mba",
    title: "From banking floor to INSEAD",
    summary:
      "How Ama landed an employer-sponsored INSEAD MBA seat after a 6-month structured prep cycle.",
    quote:
      "They challenged every vague answer I gave until the why behind my MBA was crystal clear.",
    body: "Ama joined us in September…",
    person_name: "Ama Owusu",
    person_role: "Banking → MBA candidate",
    outcome: "admission",
    outcome_label: "INSEAD MBA, sponsored",
    categories: ["School"],
    cover_image: null,
    gallery: null,
    status: "published",
    author: { id: 1, name: "Career360 Admin" },
    created_at: "2026-05-24T18:00:00Z",
    updated_at: "2026-05-24T18:00:00Z",
  },
  {
    id: 2,
    slug: "kojo-mit-scholarship",
    title: "Full-ride scholarship: Kojo's clean-energy pivot",
    summary:
      "Kojo went from oil & gas mechanical engineering to a fully-funded MIT research masters in 11 months.",
    quote: "The shortlist work alone saved me a year of scattered applications.",
    body: null,
    person_name: "Kojo Boateng",
    person_role: "Mechanical Eng. → Clean energy research",
    outcome: "scholarship",
    outcome_label: "MIT — fully funded",
    categories: ["School", "Scholarship"],
    cover_image: null,
    gallery: null,
    status: "draft",
    author: { id: 2, name: "Akua Mensah" },
    created_at: "2026-05-26T14:00:00Z",
    updated_at: "2026-05-26T14:00:00Z",
  },
];
