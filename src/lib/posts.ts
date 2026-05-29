// Server-only public blog API client + API→view-model mapper.
import "server-only";
import { apiFetch } from "@/lib/api";
import type { BlogPost, ContentBlock } from "@/app/blog/_data";

export type ApiPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  status: string;
  tags: string[] | null;
  published_at: string | null;
  updated_at: string;
  author: { id: number; name: string; email: string } | null;
};

type Paginated<T> = { data: T[]; current_page: number; last_page: number; total: number };

const DEFAULT_HERO = "/imports/18702.jpg";
const WPM = 200;

export async function fetchPublicPosts(opts: { perPage?: number; tag?: string; q?: string } = {}): Promise<ApiPost[] | null> {
  const qs = new URLSearchParams();
  qs.set("per_page", String(opts.perPage ?? 24));
  if (opts.tag) qs.set("tag", opts.tag);
  if (opts.q) qs.set("q", opts.q);
  try {
    const res = await apiFetch<Paginated<ApiPost>>(`/api/public/posts?${qs.toString()}`, { anonymous: true });
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchPublicPost(slug: string): Promise<ApiPost | null> {
  try {
    const res = await apiFetch<{ post: ApiPost }>(`/api/public/posts/${encodeURIComponent(slug)}`, { anonymous: true });
    return res.post;
  } catch {
    return null;
  }
}

export function mapApiPostToBlogPost(p: ApiPost): BlogPost {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    hero: p.cover_image && p.cover_image.trim() ? p.cover_image : DEFAULT_HERO,
    date: formatDate(p.published_at ?? p.updated_at),
    author: { name: p.author?.name ?? "Captor team", role: "" },
    readTime: estimateReadTime(p.body ?? ""),
    tags: Array.isArray(p.tags) ? p.tags : [],
    sections: bodyToSections(p.body ?? ""),
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function estimateReadTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WPM));
  return `${minutes} min read`;
}

/**
 * Convert the post body into the section/block structure the blog detail
 * renderer expects. Parses simple Markdown-ish headings ("## …") and splits
 * paragraphs on blank lines. Falls back to a single untitled section.
 */
function bodyToSections(body: string): BlogPost["sections"] {
  const raw = body.replace(/\r\n/g, "\n").trim();
  if (!raw) return [{ heading: "", blocks: [] }];

  // Rich-text bodies from the admin editor arrive as HTML. We pass them through
  // verbatim — the detail renderer will inject them via dangerouslySetInnerHTML
  // when it sees the synthetic `__html` block we emit below.
  if (/<\/?[a-z][\s\S]*>/i.test(raw)) {
    return [{
      heading: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks: [{ type: "html", html: raw } as any],
    }];
  }

  const chunks = raw.split(/\n{2,}/);
  const sections: BlogPost["sections"] = [];
  let current: { heading: string; blocks: ContentBlock[] } | null = null;

  const ensure = () => {
    if (!current) {
      current = { heading: "", blocks: [] };
      sections.push(current);
    }
    return current;
  };

  for (const chunk of chunks) {
    const text = chunk.trim();
    if (!text) continue;
    const headingMatch = text.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      current = { heading: headingMatch[1].trim(), blocks: [] };
      sections.push(current);
      continue;
    }
    ensure().blocks.push({ type: "paragraph", content: text });
  }

  return sections.length > 0 ? sections : [{ heading: "", blocks: [{ type: "paragraph", content: raw }] }];
}
