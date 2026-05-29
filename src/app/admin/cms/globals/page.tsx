import type { Metadata } from "next";
import { fetchAdminGlobals } from "@/lib/cms/globals";
import { GlobalsEditor } from "./_GlobalsEditor";

export const metadata: Metadata = { title: "Globals — CMS" };
export const dynamic = "force-dynamic";

export default async function CmsGlobalsPage() {
  let globals: Awaited<ReturnType<typeof fetchAdminGlobals>> | null = null;
  let banner: string | null = null;
  try {
    globals = await fetchAdminGlobals();
  } catch (err) {
    banner = `Backend not reachable — ${err instanceof Error ? err.message : "unknown error"}.`;
  }

  return (
    <div className="cms-pages">
      {banner ? <div className="admin-gated">{banner}</div> : null}
      <header className="cms-pages__head">
        <div>
          <h1>Site globals</h1>
          <p className="admin-muted">Company name, tagline, contact details, socials, footer copyright.</p>
        </div>
      </header>
      {globals ? <GlobalsEditor globals={globals} /> : null}
    </div>
  );
}
