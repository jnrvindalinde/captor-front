import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { mockPosts, type Post } from "../../../_mock";
import { PostForm } from "../../_form";

export const metadata = { title: "Edit post · Captor admin" };

async function loadPost(id: number): Promise<{ post: Post | null; live: boolean }> {
  try {
    const r = await apiFetch<{ post: Post }>(`/api/admin/posts/${id}`);
    return { post: r.post, live: true };
  } catch (e) {
    const err = e as { status?: number };
    if (err?.status === 404) return { post: null, live: true };
    const post = mockPosts.find((p) => p.id === id) ?? null;
    return { post, live: false };
  }
}

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const { post, live } = await loadPost(Number(id));
  if (!post) notFound();

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/blog" className="admin-link">← Back to posts</Link>
          <h1 className="h2">{post.title}</h1>
          <p className="admin-muted admin-muted--sm">/{post.slug}</p>
        </div>
        <div className="admin-actions">
          <span className={`admin-pill admin-pill--${post.status}`}>{post.status}</span>
        </div>
      </header>
      {sp.saved && (
        <p className="admin-gated admin-gated--ok" role="status">Saved.</p>
      )}
      <PostForm post={post} live={live} />
    </div>
  );
}
