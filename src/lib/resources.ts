// Server-only public resources API client + API→view-model mapper.
import "server-only";
import { apiFetch } from "@/lib/api";
import type { Resource, ContentBlock, ResourceType } from "@/app/resources/_data";
import { resourceTypeMeta } from "@/app/resources/_data";

export type ApiResource = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  format: "guide" | "document" | "video" | "audio" | "external";
  file_path: string | null;
  file_label: string | null;
  external_url: string | null;
  cover_image: string | null;
  status: string;
  tags: string[] | null;
  updated_at: string;
  created_at: string;
  author: { id: number; name: string; email: string } | null;
};

type Paginated<T> = { data: T[]; current_page: number; last_page: number; total: number };

const DEFAULT_HERO = "/imports/18702.jpg";

export async function fetchPublicResources(
  opts: { perPage?: number; tag?: string; q?: string; format?: string } = {},
): Promise<ApiResource[] | null> {
  const qs = new URLSearchParams();
  qs.set("per_page", String(opts.perPage ?? 24));
  if (opts.tag) qs.set("tag", opts.tag);
  if (opts.q) qs.set("q", opts.q);
  if (opts.format) qs.set("format", opts.format);
  try {
    const res = await apiFetch<Paginated<ApiResource>>(
      `/api/public/resources?${qs.toString()}`,
      { anonymous: true },
    );
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchPublicResource(slug: string): Promise<ApiResource | null> {
  try {
    const res = await apiFetch<{ resource: ApiResource }>(
      `/api/public/resources/${encodeURIComponent(slug)}`,
      { anonymous: true },
    );
    return res.resource;
  } catch {
    return null;
  }
}

function mapFormatToType(format: ApiResource["format"]): ResourceType {
  switch (format) {
    case "audio": return "audio";
    case "video": return "video";
    case "document": return "pdf";
    case "external": return "guide";
    case "guide":
    default:
      return "guide";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// Forces browser download for Cloudinary-hosted files by injecting fl_attachment.
// If `label` is provided it becomes the suggested filename (Cloudinary appends the extension).
function forceCloudinaryDownload(url: string, label?: string | null): string {
  if (!/^https?:\/\/res\.cloudinary\.com\//i.test(url)) return url;
  if (/\/upload\/fl_attachment/i.test(url)) return url;
  const safeName = label
    ? label
        .replace(/\.[^./\\]+$/, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 100)
    : "";
  const flag = safeName ? `fl_attachment:${safeName}` : "fl_attachment";
  return url.replace(/\/upload\//, `/upload/${flag}/`);
}

function descriptionToSections(description: string): Resource["sections"] {
  const raw = description.replace(/\r\n/g, "\n").trim();
  if (!raw) return [{ heading: "", blocks: [] }];

  if (/<\/?[a-z][\s\S]*>/i.test(raw)) {
    return [{
      heading: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks: [{ type: "html", html: raw } as any],
    }];
  }

  const chunks = raw.split(/\n{2,}/);
  const sections: Resource["sections"] = [];
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

export function mapApiResourceToResource(r: ApiResource): Resource {
  const type = mapFormatToType(r.format);
  const typeLabel = resourceTypeMeta[type]?.label ?? type;
  const descRaw = r.description ?? "";
  const excerpt = stripHtml(descRaw).slice(0, 220);
  const date = formatDate(r.updated_at ?? r.created_at);

  const out: Resource = {
    slug: r.slug,
    type,
    typeLabel,
    title: r.title,
    excerpt,
    hero: r.cover_image && r.cover_image.trim() ? r.cover_image : DEFAULT_HERO,
    date,
    meta: typeLabel,
    author: { name: r.author?.name ?? "Captor team", role: "" },
    tags: Array.isArray(r.tags) ? r.tags : [],
    sections: descriptionToSections(descRaw),
  };

  if (r.format === "video" && r.file_path) {
    out.video = { src: r.file_path };
  } else if (r.format === "audio" && r.file_path) {
    out.audio = { src: r.file_path };
  } else if (r.file_path) {
    const last = r.file_path.split("?")[0].split("/").pop() ?? r.slug;
    const displayName = (r.file_label && r.file_label.trim()) || decodeURIComponent(last) || r.slug;
    out.download = {
      fileName: displayName,
      sizeLabel: typeLabel,
      url: forceCloudinaryDownload(r.file_path, r.file_label),
    };
  } else if (r.format === "external" && r.external_url) {
    out.download = {
      fileName: (r.file_label && r.file_label.trim()) || "Open external link",
      sizeLabel: "External",
      url: r.external_url,
    };
  }

  return out;
}
