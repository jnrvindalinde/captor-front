import { Suspense } from "react";
import { LeadsManager } from "./_LeadsManager";

export const metadata = { title: "Leads · Captor Admin" };

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsManager />
    </Suspense>
  );
}
