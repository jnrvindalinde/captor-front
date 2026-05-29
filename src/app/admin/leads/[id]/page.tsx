import { notFound } from "next/navigation";
import { mockDetails, type LeadDetail } from "../../_mock";
import { LeadDetailView } from "./_LeadDetailView";
import { apiFetch, type ApiError } from "@/lib/api";

type Params = Promise<{ id: string }>;

async function loadLead(uuid: string): Promise<{ lead: LeadDetail; live: boolean; error?: string } | null> {
  try {
    const res = await apiFetch<{ lead: LeadDetail }>(`/api/admin/leads/${uuid}`);
    return { lead: res.lead, live: true };
  } catch (e) {
    const err = e as ApiError;
    if (err?.status === 404) return null;
    // Network / auth failure → fall back to mock if we have one for this uuid.
    const mock = mockDetails[uuid];
    if (!mock) return null;
    return {
      lead: mock,
      live: false,
      error: err?.message ?? "Backend unavailable — showing demo data.",
    };
  }
}

export default async function LeadDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const loaded = await loadLead(id);
  if (!loaded) notFound();
  return <LeadDetailView lead={loaded.lead} live={loaded.live} offlineMessage={loaded.error} />;
}
