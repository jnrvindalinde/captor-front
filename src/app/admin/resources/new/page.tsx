import Link from "next/link";
import { ResourceForm } from "../_form";

export const metadata = { title: "New resource · Captor admin" };

export default function NewResourcePage() {
  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/resources" className="admin-link">← Back to resources</Link>
          <h1 className="admin-page__title">New resource</h1>
        </div>
      </header>
      <ResourceForm />
    </div>
  );
}
