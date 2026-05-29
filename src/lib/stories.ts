// Server-only public stories API client + API→view-model mapper.
import "server-only";
import { apiFetch } from "@/lib/api";

export type StoryCategory = "School" | "Scholarship" | "Job" | "Career";

export type ApiStory = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  quote: string | null;
  body: string | null;
  person_name: string;
  person_role: string | null;
  outcome:
    | "admission"
    | "scholarship"
    | "placement"
    | "transition"
    | "achievement"
    | null;
  outcome_label: string | null;
  categories: StoryCategory[] | null;
  cover_image: string | null;
  gallery: string[] | null;
  status: string;
  updated_at: string;
  created_at: string;
  author: { id: number; name: string; email: string } | null;
};

export type StoryView = {
  slug: string;
  initials: string;
  quote: string;
  name: string;
  role: string;
  outcome: string;
  color: string;
  image: string;
  categories: StoryCategory[];
  gallery: string[];
  bodyHtml: string | null;
  bodyParagraphs: string[];
};

type Paginated<T> = { data: T[]; current_page: number; last_page: number; total: number };

const DEFAULT_HERO = "/imports/18702.jpg";
const PALETTE = ["var(--color-sky)", "#72b4d6", "rgba(165, 206, 0, 0.8)"];

const OUTCOME_FALLBACK: Record<NonNullable<ApiStory["outcome"]>, string> = {
  admission: "Admitted",
  scholarship: "Funded",
  placement: "Placed",
  transition: "Career repositioned",
  achievement: "Achievement",
};

export async function fetchPublicStories(
  opts: { perPage?: number; q?: string; category?: string; outcome?: string } = {},
): Promise<ApiStory[] | null> {
  const qs = new URLSearchParams();
  qs.set("per_page", String(opts.perPage ?? 24));
  if (opts.q) qs.set("q", opts.q);
  if (opts.category) qs.set("category", opts.category);
  if (opts.outcome) qs.set("outcome", opts.outcome);
  try {
    const res = await apiFetch<Paginated<ApiStory>>(
      `/api/public/stories?${qs.toString()}`,
      { anonymous: true },
    );
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchPublicStory(slug: string): Promise<ApiStory | null> {
  try {
    const res = await apiFetch<{ story: ApiStory }>(
      `/api/public/stories/${encodeURIComponent(slug)}`,
      { anonymous: true },
    );
    return res.story;
  } catch {
    return null;
  }
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function bodyToParagraphs(body: string): string[] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function mapApiStoryToView(s: ApiStory, index = 0): StoryView {
  const body = s.body ?? "";
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
  const outcomeLabel =
    (s.outcome_label && s.outcome_label.trim()) ||
    (s.outcome ? OUTCOME_FALLBACK[s.outcome] : "");

  return {
    slug: s.slug,
    initials: initialsFor(s.person_name),
    quote: s.quote ?? s.summary ?? "",
    name: s.person_name,
    role: s.person_role ?? "",
    outcome: outcomeLabel,
    color: PALETTE[index % PALETTE.length],
    image: s.cover_image && s.cover_image.trim() ? s.cover_image : DEFAULT_HERO,
    categories: Array.isArray(s.categories) ? s.categories : [],
    gallery: Array.isArray(s.gallery) ? s.gallery : [],
    bodyHtml: isHtml ? body : null,
    bodyParagraphs: isHtml ? [] : bodyToParagraphs(body),
  };
}
