import Link from "next/link";
import { notFound } from "next/navigation";
import { mockStories } from "../../../_mock";
import { StoryForm } from "../../_form";

export const metadata = { title: "Edit story · Captor admin" };

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = mockStories.find((s) => s.id === Number(id));
  if (!story) notFound();

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/stories" className="admin-link">← Back to stories</Link>
          <h1 className="h2">{story.title}</h1>
          <p className="admin-muted admin-muted--sm">/{story.slug} · {story.person_name}</p>
        </div>
        <span className={`admin-pill admin-pill--${story.status}`}>{story.status}</span>
      </header>
      <StoryForm story={story} />
    </div>
  );
}
