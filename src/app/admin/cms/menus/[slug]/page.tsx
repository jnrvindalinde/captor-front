import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchAdminMenu } from "@/lib/cms/menus";
import { MenuEditor } from "./_MenuEditor";

export const metadata: Metadata = { title: "Edit menu — CMS" };
export const dynamic = "force-dynamic";

export default async function CmsMenuEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let menu: Awaited<ReturnType<typeof fetchAdminMenu>>;
  try {
    menu = await fetchAdminMenu(slug);
  } catch (err) {
    const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : 0;
    if (status === 404) notFound();
    throw err;
  }

  return (
    <div className="cms-pages">
      <p>
        <Link href="/admin/cms/menus" className="admin-link">← All menus</Link>
      </p>
      <MenuEditor menu={menu} />
    </div>
  );
}
