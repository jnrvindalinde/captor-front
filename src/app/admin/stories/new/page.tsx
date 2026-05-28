import Link from "next/link";
import { StoryForm } from "../_form";

export const metadata = { title: "New story · Captor admin" };

export default function NewStoryPage() {
  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/stories" className="admin-link">← Back to stories</Link>
          <h1 className="h2">New story</h1>
        </div>
      </header>
      <StoryForm />
    </div>
  );
}
