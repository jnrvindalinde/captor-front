import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { mockClients, type Client, type ClientStatus } from "../_mock";
import { ClientsManager } from "./_ClientsManager";

export const metadata = { title: "Clients · Captor Admin" };

type ClientCounts = Record<ClientStatus | "all", number>;
type ClientsResponse = { data: Client[]; counts?: ClientCounts };

async function loadClients(): Promise<{
  rows: Client[];
  counts?: ClientCounts;
  live: boolean;
}> {
  try {
    const r = await apiFetch<ClientsResponse>("/api/admin/clients?per_page=200");
    return { rows: r.data, counts: r.counts, live: true };
  } catch {
    return { rows: mockClients, live: false };
  }
}

export default async function ClientsPage() {
  const { rows, counts, live } = await loadClients();
  return (
    <Suspense fallback={null}>
      <ClientsManager initialClients={rows} initialCounts={counts} live={live} />
    </Suspense>
  );
}
