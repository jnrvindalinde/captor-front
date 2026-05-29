import "server-only";
import { apiFetch } from "@/lib/api";
import type { CollectionSummary, CollectionDetail } from "@/lib/cms/collections";

export async function fetchAdminCollections(): Promise<{ data: CollectionSummary[] }> {
  return apiFetch<{ data: CollectionSummary[] }>("/api/admin/collections");
}

export async function fetchAdminCollection(slug: string): Promise<{ data: CollectionDetail }> {
  return apiFetch<{ data: CollectionDetail }>(`/api/admin/collections/${encodeURIComponent(slug)}`);
}
