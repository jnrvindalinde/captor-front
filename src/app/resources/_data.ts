export type ResourceType = "guide" | "audio" | "video" | "pdf";

export type ContentBlock = 
  | { type: "paragraph"; content: string }
  | { type: "bulletList"; items: string[] }
  | { type: "numberedList"; items: string[] }
  | { type: "indented"; content: string };

export type ResourceSection = {
  heading: string;
  blocks: ContentBlock[];
};

export type Resource = {
  slug: string;
  type: ResourceType;
  typeLabel: string;
  title: string;
  excerpt: string;
  hero: string;
  date: string;
  meta: string;
  readTime?: string;
  duration?: string;
  fileSize?: string;
  author: { name: string; role: string };
  tags: string[];
  sections: ResourceSection[];
  download?: { fileName: string; sizeLabel: string; url: string };
  audio?: { src: string };
  video?: { src: string; poster?: string };
};

export const resources: Resource[] = [
  {
    slug: "sop-that-doesnt-sound-like-everyone-else",
    type: "guide",
    typeLabel: "Guide",
    title: "How to write an SOP that doesn't sound like everyone else",
    excerpt:
      "Five prompts we use with every applicant to surface the story only they can tell.",
    hero: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&auto=format&fit=crop&q=75",
    date: "April 18, 2025",
    meta: "12 min read",
    readTime: "12 min read",
    author: { name: "Akua Boateng", role: "Senior Advisor" },
    tags: ["SOP", "Essay writing", "Storytelling"],
    sections: [
      {
        heading: "Start with the moment, not the résumé",
        blocks: [
          { type: "paragraph", content: "The strongest SOPs we've seen don't open with a credential. They open with a moment — a problem, a frustration, a question that wouldn't leave the applicant alone. The credential becomes the proof later." },
          { type: "paragraph", content: "Try this prompt: write three sentences about the last time your work made you uncomfortable. Not because it was hard — but because it revealed a gap you wanted to close. That gap is your thesis." },
        ],
      },
      {
        heading: "Name the field, not the school",
        blocks: [
          { type: "paragraph", content: "Admissions committees know their own school. What they don't know is whether you understand the field. Spend the second paragraph naming two or three live debates inside your discipline and where you sit on them." },
          { type: "paragraph", content: "This is where most applicants flatten themselves. They write 'I want to study sustainable development.' Better: 'I want to study why community-led adaptation projects outperform donor-led ones in coastal West Africa.'" },
        ],
      },
      {
        heading: "The 60/30/10 split",
        blocks: [
          { type: "paragraph", content: "Past 60% · Present 30% · Future 10%. Most applicants invert this — they spend the bulk of the essay on what they'll do post-degree. But admissions readers buy futures from people whose past makes the future credible." },
          { type: "paragraph", content: "If you can't ground the future in concrete past evidence, you don't have a thesis yet. Go back to prompt one." },
        ],
      },
      {
        heading: "Cut every sentence that could be in someone else's SOP",
        blocks: [
          { type: "paragraph", content: "Highlight every line in your draft. Cross out any sentence that another applicant in your field could plausibly have written. What's left is your essay." },
          { type: "paragraph", content: "This is brutal but it's the single biggest lever between a shortlisted essay and a forgettable one." },
        ],
      },
      {
        heading: "End with a specific question, not a promise",
        blocks: [
          { type: "paragraph", content: "Most SOPs close with 'I'll contribute to the community.' Admissions readers have read this 800 times today. Close with a question only your program can help you answer. That question is your application." },
        ],
      },
    ],
  },
  {
    slug: "scholarship-application-checklist",
    type: "pdf",
    typeLabel: "PDF Checklist",
    title: "The scholarship application checklist we wish we had",
    excerpt:
      "A 24-point pre-submission audit covering eligibility, fit, and interview prep.",
    hero: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&auto=format&fit=crop&q=75",
    date: "March 28, 2025",
    meta: "PDF · 320 KB",
    fileSize: "320 KB",
    author: { name: "Kojo Ansah", role: "Director" },
    tags: ["Scholarships", "Chevening", "Mastercard", "Checklist"],
    download: { fileName: "career360-scholarship-checklist.pdf", sizeLabel: "320 KB · PDF", url: "/downloads/career360-scholarship-checklist.pdf" },
    sections: [
      {
        heading: "What this checklist covers",
        blocks: [
          { type: "paragraph", content: "Twenty-four pre-submission checks split across four phases: eligibility, fit, document craft, and interview readiness. Each check is a yes/no question that surfaces the most common reasons applications get rejected at first review." },
          { type: "paragraph", content: "It's the same instrument our advisors run before any of our applicants press submit. It's not exhaustive — but it catches roughly 80% of the issues we see." },
        ],
      },
      {
        heading: "How to use it",
        blocks: [
          { type: "paragraph", content: "Print it. Open your draft alongside. Walk top to bottom. Any 'no' is a blocker — don't move forward until it becomes a 'yes.'" },
          { type: "paragraph", content: "Most applicants finish the first run with 6-9 blockers. That's normal. The point is to find them before a reviewer does." },
        ],
      },
      {
        heading: "The four phases",
        blocks: [
          { type: "bulletList", items: ["Phase 1 — Eligibility (5 checks): citizenship, work experience, degree class, age, English.", "Phase 2 — Fit (7 checks): program match, faculty alignment, post-degree plan plausibility, prior demonstration.", "Phase 3 — Document craft (8 checks): SOP arc, CV pruning, recommender targeting, referee briefing, evidence anchoring.", "Phase 4 — Interview (4 checks): mock done, weakness rehearsed, panel-specific tailoring, follow-up plan drafted."] },
        ],
      },
    ],
  },
  {
    slug: "shortlisting-universities-you-can-fund",
    type: "audio",
    typeLabel: "Audio Primer",
    title: "Shortlisting universities you can actually fund",
    excerpt:
      "A short walk-through of the budget, scholarship, and ROI lenses we apply.",
    hero: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=1400&auto=format&fit=crop&q=75",
    date: "March 12, 2025",
    meta: "5 min listen",
    duration: "5:18",
    author: { name: "Akua Boateng", role: "Senior Advisor" },
    tags: ["Funding", "Shortlist", "ROI"],
    audio: { src: "https://player.vimeo.com/external/audio-sample.mp3" },
    sections: [
      {
        heading: "Three lenses, in this order",
        blocks: [
          { type: "paragraph", content: "Most applicants shortlist by ranking first. We shortlist by fundability first. The order matters: a fully-funded #40 program beats an unfunded top-10 program every time, for almost every applicant we work with." },
          { type: "paragraph", content: "Lens 1: total cost (tuition + cost of living + visa + travel). Lens 2: realistic scholarship coverage given your profile. Lens 3: 5-year ROI given likely post-degree salary band and home/away decision." },
        ],
      },
      {
        heading: "What this audio walks through",
        blocks: [
          { type: "paragraph", content: "We work through a real applicant's shortlist live: 14 schools narrowed to 4, with the math behind each decision. You'll hear where we kept names that surprised us and where we cut prestigious schools that didn't survive Lens 1." },
        ],
      },
    ],
  },
  {
    slug: "recommender-letter-playbook",
    type: "guide",
    typeLabel: "Guide",
    title: "The recommender letter playbook nobody hands you",
    excerpt:
      "How to brief your recommenders so their letters actually move the needle on your file.",
    hero: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=1400&auto=format&fit=crop&q=75",
    date: "March 4, 2025",
    meta: "9 min read",
    readTime: "9 min read",
    author: { name: "Kojo Ansah", role: "Director" },
    tags: ["Recommenders", "References", "Letters"],
    sections: [
      {
        heading: "Pick the writer, not the title",
        blocks: [
          { type: "paragraph", content: "The senior name only helps if the senior person actually knows your work. A specific letter from a mid-rank manager who saw you build something beats a generic letter from a VP who saw you across a conference room." },
          { type: "paragraph", content: "The test: can your recommender name three things you did, and the impact of each, without checking your CV? If not, find someone who can." },
        ],
      },
      {
        heading: "The brief packet",
        blocks: [
          { type: "paragraph", content: "Every recommender should get the same packet from you: your CV, your draft SOP, the specific programs they're writing for, the prompt the program gave them, and a one-pager listing the three claims you'd like the letter to substantiate." },
          { type: "paragraph", content: "That last document is the unlock. You're not writing the letter for them — you're making sure they answer the question the committee is actually asking." },
        ],
      },
      {
        heading: "Calibrate the calibration",
        blocks: [
          { type: "paragraph", content: "Many recommenders default to 'excellent in every way.' For elite programs, that's a flat letter. Ask your recommenders to rank you against the strongest student they've worked with in the last five years — and to explain the rank." },
        ],
      },
    ],
  },
  {
    slug: "interview-prep-90-minute-method",
    type: "guide",
    typeLabel: "Guide",
    title: "Interview prep: the 90-minute method we use with every applicant",
    excerpt:
      "Three rounds of 30 minutes that simulate the panel and surface every weak spot.",
    hero: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1400&auto=format&fit=crop&q=75",
    date: "February 22, 2025",
    meta: "11 min read",
    readTime: "11 min read",
    author: { name: "Ama Owusu", role: "Lead Coach" },
    tags: ["Interviews", "Panels", "Mock"],
    sections: [
      {
        heading: "Round 1 — Cold opens (30 min)",
        blocks: [
          { type: "paragraph", content: "We start with 10 unscripted opens: 'Tell me about yourself.' 'Why this program?' 'Walk me through your CV.' One minute per answer, no notes. We're listening for filler, hedging, and the gap between the version on paper and the version in your voice." },
          { type: "paragraph", content: "Most applicants find this round brutal. That's the point — the gap closes fastest when you've heard yourself fumble three times in a row." },
        ],
      },
      {
        heading: "Round 2 — Pressure questions (30 min)",
        blocks: [
          { type: "paragraph", content: "We pivot to the questions you don't want. Your lowest grade. The job you left after six months. The gap year. The published-paper retraction. We rehearse these until your tell is gone." },
          { type: "paragraph", content: "The honest answer is almost always the right one. The work is figuring out how to land it without losing your spine." },
        ],
      },
      {
        heading: "Round 3 — Forward questions (30 min)",
        blocks: [
          { type: "paragraph", content: "Last round: panels ask whether you've thought about the program seriously. What course will you take first? Which faculty member do you want to work with and why? What will you have built by month 18?" },
          { type: "paragraph", content: "Specificity is the only currency that works here. Generic enthusiasm loses to particular curiosity every time." },
        ],
      },
    ],
  },
  {
    slug: "university-shortlist-worksheet",
    type: "pdf",
    typeLabel: "PDF Worksheet",
    title: "The university shortlist worksheet",
    excerpt:
      "A one-page scoring sheet to rank programs across cost, fit, and post-degree pathway.",
    hero: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400&auto=format&fit=crop&q=75",
    date: "February 10, 2025",
    meta: "PDF · 180 KB",
    fileSize: "180 KB",
    author: { name: "Kojo Ansah", role: "Director" },
    tags: ["Shortlist", "Worksheet", "Programs"],
    download: { fileName: "career360-shortlist-worksheet.pdf", sizeLabel: "180 KB · PDF", url: "/downloads/career360-shortlist-worksheet.pdf" },
    sections: [
      {
        heading: "What's on the sheet",
        blocks: [
          { type: "paragraph", content: "Twelve columns across three groups: cost & funding, academic fit, post-degree pathway. Each column scores 1-5. The bottom of the sheet sums and ranks." },
          { type: "paragraph", content: "It's deliberately simple. The point isn't to compute the perfect ranking — it's to expose where your gut is overruling the math, so you can decide whether your gut is right." },
        ],
      },
      {
        heading: "How we use it in advising",
        blocks: [
          { type: "paragraph", content: "We fill the sheet once with the applicant, then again on our own, then compare. The disagreements are the conversation. Usually two or three rows account for most of the rank shuffle." },
        ],
      },
    ],
  },
  {
    slug: "documents-matrix-application-season",
    type: "pdf",
    typeLabel: "PDF Matrix",
    title: "The documents matrix for application season",
    excerpt:
      "Every document, every deadline, every program — on one tracker.",
    hero: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&auto=format&fit=crop&q=75",
    date: "January 28, 2025",
    meta: "PDF · 240 KB",
    fileSize: "240 KB",
    author: { name: "Akua Boateng", role: "Senior Advisor" },
    tags: ["Operations", "Deadlines", "Tracking"],
    download: { fileName: "career360-documents-matrix.pdf", sizeLabel: "240 KB · PDF", url: "/downloads/career360-documents-matrix.pdf" },
    sections: [
      {
        heading: "Why a single sheet",
        blocks: [
          { type: "paragraph", content: "Application season fails on operations more often than on craft. A missed transcript request, a referee chased too late, a wrong essay uploaded to the wrong portal — these are the misses we see most." },
          { type: "paragraph", content: "One sheet, one source of truth. The matrix lists every program down the side, every document across the top, and every cell has a status: not started / drafting / submitted / received." },
        ],
      },
    ],
  },
  {
    slug: "networking-abroad-before-you-land",
    type: "audio",
    typeLabel: "Audio Primer",
    title: "Networking abroad before you even land",
    excerpt:
      "Two ways to start building a real network at your future program — months before flight.",
    hero: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&auto=format&fit=crop&q=75",
    date: "January 14, 2025",
    meta: "7 min listen",
    duration: "7:42",
    author: { name: "Ama Owusu", role: "Lead Coach" },
    tags: ["Networking", "Pre-arrival", "Alumni"],
    sections: [
      {
        heading: "Channel one: the alumni network nobody uses",
        blocks: [
          { type: "paragraph", content: "Most programs publish their alumni directory or LinkedIn group and almost no admitted student touches it before arrival. Spend an hour writing five thoughtful messages to alumni who've done what you want to do — not asking for jobs, asking for what they wished they'd known." },
          { type: "paragraph", content: "We've never seen this fail. Of every five messages, expect two replies and one real conversation. That conversation will be worth the entire pre-arrival summer." },
        ],
      },
      {
        heading: "Channel two: the cohort you don't know yet",
        blocks: [
          { type: "paragraph", content: "Most cohorts start a WhatsApp or Slack months before orientation. Be the one who organises a 30-minute intro call once a week. By August you'll know fifteen people personally and you'll arrive with friends." },
        ],
      },
    ],
  },
  {
    slug: "post-acceptance-checklist",
    type: "audio",
    typeLabel: "Audio Primer",
    title: "What to do in the 60 days after acceptance",
    excerpt:
      "A short audio primer on visa, funding, housing, and the conversations to have before you leave.",
    hero: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&auto=format&fit=crop&q=75",
    date: "December 18, 2024",
    meta: "9 min listen",
    duration: "9:04",
    author: { name: "Kojo Ansah", role: "Director" },
    tags: ["Post-acceptance", "Visa", "Pre-departure"],
    sections: [
      {
        heading: "The first 14 days",
        blocks: [
          { type: "paragraph", content: "Accept formally. Get the visa application started — not just the appointment, the document collection. Activate university email. Join the cohort group. These four moves done in week one save you a stressful month later." },
        ],
      },
      {
        heading: "Day 15 to day 60",
        blocks: [
          { type: "paragraph", content: "Funding mechanics: scholarship disbursement schedule, currency strategy, emergency fund. Housing: on-campus vs off-campus, deposits, room shares. Conversations: family, employer, mentor — in that order." },
        ],
      },
    ],
  },
  {
    slug: "mock-interview-teardown-chevening",
    type: "video",
    typeLabel: "Video Teardown",
    title: "Mock interview teardown: Chevening panel, walked back tape",
    excerpt:
      "A 22-minute teardown of an anonymised Chevening mock — what worked, what didn't, what we'd change.",
    hero: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1400&auto=format&fit=crop&q=75",
    date: "December 3, 2024",
    meta: "22 min watch",
    duration: "22:18",
    author: { name: "Ama Owusu", role: "Lead Coach" },
    tags: ["Chevening", "Interview", "Mock"],
    video: {
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      poster:
        "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1400&auto=format&fit=crop&q=75",
    },
    sections: [
      {
        heading: "What the teardown covers",
        blocks: [
          { type: "paragraph", content: "We walk back a real applicant's mock interview in three passes. First pass: content — did the answers actually address the questions asked. Second pass: structure — were the answers arc'd or did they ramble. Third pass: tells — pacing, fillers, eye contact, the moments the panel leaned forward and the moments they didn't." },
        ],
      },
      {
        heading: "The three biggest fixes",
        blocks: [
          { type: "bulletList", items: ["Open every answer with the answer, not the windup.", "Name one specific example per answer — no more, no less.", "End on the implication, not the recap. These three moves, repeated, lifted the next mock by what we'd estimate as a full band."] },
        ],
      },
    ],
  },
  {
    slug: "sop-annotation-real-essay",
    type: "video",
    typeLabel: "Video Annotation",
    title: "SOP annotation: a real essay, marked up paragraph by paragraph",
    excerpt:
      "Watch us mark up a strong-but-not-finished SOP, with the rewrites we asked for and why.",
    hero: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=1400&auto=format&fit=crop&q=75",
    date: "November 19, 2024",
    meta: "18 min watch",
    duration: "18:46",
    author: { name: "Akua Boateng", role: "Senior Advisor" },
    tags: ["SOP", "Annotation", "Drafting"],
    video: {
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      poster:
        "https://images.unsplash.com/photo-1542435503-956c469947f6?w=1400&auto=format&fit=crop&q=75",
    },
    sections: [
      {
        heading: "How the annotation works",
        blocks: [
          { type: "paragraph", content: "Three colour passes on screen: green for what's working, amber for what's almost there, red for what needs to go. We narrate each call with the reasoning, then show the rewrite we proposed." },
          { type: "paragraph", content: "The essay isn't a teardown for its own sake — it's a strong draft that needs the last 20% of work most drafts never receive. That last 20% is usually the difference between shortlisted and admitted." },
        ],
      },
    ],
  },
  {
    slug: "funding-conversation-with-family",
    type: "guide",
    typeLabel: "Guide",
    title: "The funding conversation with your family",
    excerpt:
      "How to have the hard talk about money — before you apply, not after the offer arrives.",
    hero: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1400&auto=format&fit=crop&q=75",
    date: "November 5, 2024",
    meta: "8 min read",
    readTime: "8 min read",
    author: { name: "Kojo Ansah", role: "Director" },
    tags: ["Funding", "Family", "Decisions"],
    sections: [
      {
        heading: "Have the conversation before you apply",
        blocks: [
          { type: "paragraph", content: "The hardest version of this conversation is when an offer is already on the table and the family hasn't been consulted on the cost. Have it earlier — when the conversation can still shape the shortlist." },
          { type: "paragraph", content: "Bring numbers. Total cost. Realistic scholarship coverage. What you'll cover yourself. What you're asking for. Vague conversations about 'going abroad' are how families end up unable to support a decision they didn't see coming." },
        ],
      },
      {
        heading: "The three questions to walk in with",
        blocks: [
          { type: "bulletList", items: ["What can our household realistically support, in a worst case where no scholarship comes through?", "What changes if a partial scholarship comes through?", "What do we need to see from me before we commit?"] },
          { type: "paragraph", content: "Walk in with these. Walk out with answers. Then build your shortlist around the answers, not the other way round." },
        ],
      },
    ],
  },
];

export function getResource(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}

export function getAllSlugs(): string[] {
  return resources.map((r) => r.slug);
}

export const resourceTypeMeta: Record<
  ResourceType,
  { label: string; pluralLabel: string; subtitle: string }
> = {
  guide: {
    label: "Guide",
    pluralLabel: "Guides",
    subtitle: "Long-form reading on the parts of the application that move the needle.",
  },
  pdf: {
    label: "PDF",
    pluralLabel: "PDFs & Checklists",
    subtitle: "Working documents — checklists, worksheets, trackers you can print and run.",
  },
  audio: {
    label: "Audio",
    pluralLabel: "Audio Primers",
    subtitle: "Short listens for the commute. Worked examples, not abstractions.",
  },
  video: {
    label: "Video",
    pluralLabel: "Video",
    subtitle: "Teardowns and annotations — applications walked back on screen.",
  },
};
