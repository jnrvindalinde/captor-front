import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { mockStories, type Story } from "../../../_mock";
import { StoryForm } from "../../_form";

export const metadata = { title: "Edit story · Captor admin" };

async function loadStory(id: number): Promise<{ story: Story | null; live: boolean }> {
  try {
    const r = await apiFetch<{ story: Story }>(`/api/admin/stories/${id}`);
    return { story: r.story, live: true };
  } catch (e) {
    const err = e as { status?: number };
    if (err?.status === 404) return { story: null, live: true };
    return { story: mockStories.find((s) => s.id === id) ?? null, live: false };
  }
}

export default async function EditStoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const { story, live } = await loadStory(Number(id));
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
      {sp.saved && <p className="admin-gated admin-gated--ok" role="status">Saved.</p>}
      <StoryForm story={story} live={live} />
    </div>
  );
}
