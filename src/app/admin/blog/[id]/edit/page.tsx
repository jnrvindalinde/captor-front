import Link from "next/link";
import { notFound } from "next/navigation";
import { mockPosts } from "../../../_mock";
import { PostForm } from "../../_form";

export const metadata = { title: "Edit post · Captor admin" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = mockPosts.find((p) => p.id === Number(id));
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
      <PostForm post={post} />
    </div>
  );
}
