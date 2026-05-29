import { notFound } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api";
import { mockClients, type Client } from "../../_mock";
import { ClientDetailView } from "./_ClientDetailView";

export const metadata = { title: "Client · Captor Admin" };

async function loadClient(uuid: string): Promise<
  { client: Client; live: boolean; error?: string } | null
> {
  try {
    const res = await apiFetch<{ client: Client }>(`/api/admin/clients/${uuid}`);
    return { client: res.client, live: true };
  } catch (e) {
    const err = e as ApiError;
    if (err?.status === 404) return null;
    const mock = mockClients.find((c) => c.uuid === uuid);
    if (!mock) return null;
    return {
      client: mock,
      live: false,
      error: err?.message ?? "Backend unavailable — showing demo data.",
    };
  }
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loaded = await loadClient(id);
  if (!loaded) notFound();
  return (
    <ClientDetailView
      client={loaded.client}
      live={loaded.live}
      offlineMessage={loaded.error}
    />
  );
}
