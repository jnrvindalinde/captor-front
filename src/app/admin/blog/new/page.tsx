import Link from "next/link";
import { PostForm } from "../_form";

export const metadata = { title: "New post · Captor admin" };

export default function NewPostPage() {
  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/blog" className="admin-link">← Back to posts</Link>
          <h1 className="h2">New blog post</h1>
        </div>
      </header>
      <PostForm />
    </div>
  );
}
