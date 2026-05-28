import { Suspense } from "react";
import { ClientsManager } from "./_ClientsManager";

export const metadata = { title: "Clients · Captor Admin" };

export default function ClientsPage() {
  return (
    <Suspense fallback={null}>
      <ClientsManager />
    </Suspense>
  );
}
