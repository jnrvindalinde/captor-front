// Server-only CMS Media client.
import "server-only";
import { apiFetch } from "@/lib/api";

export type MediaItem = {
  id: number;
  uuid: string;
  provider: string;
  public_id: string;
  url: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  original_filename: string | null;
  folder: string | null;
  alt: { en: string | null; fr: string | null };
  caption: { en: string | null; fr: string | null };
  meta: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
};

export type MediaListResponse = {
  data: MediaItem[];
  links?: unknown;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

export async function fetchMediaList(params: {
  q?: string;
  folder?: string;
  format?: string;
  perPage?: number;
} = {}): Promise<MediaListResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.folder) search.set("folder", params.folder);
  if (params.format) search.set("format", params.format);
  search.set("per_page", String(params.perPage ?? 60));
  return apiFetch<MediaListResponse>(`/api/admin/media?${search.toString()}`);
}

/** Cloudinary URL helper — inserts transformation params. */
export function mediaUrl(
  m: Pick<MediaItem, "url">,
  opts: { w?: number; h?: number; crop?: "fill" | "fit" | "limit" } = {},
): string {
  const { w, h, crop = "fill" } = opts;
  if (!w && !h) return m.url;

  const parts: string[] = [];
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);
  if (crop) parts.push(`c_${crop}`);
  parts.push("q_auto", "f_auto");
  const tx = parts.join(",");

  // Cloudinary URL pattern: .../upload/<transform>/<public_id>.ext
  return m.url.replace("/upload/", `/upload/${tx}/`);
}
