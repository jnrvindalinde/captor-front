import type { Post } from "../_mock";

export function PostForm({ post }: { post?: Post }) {
  return (
    <form className="admin-form" action="#">
      <div className="admin-form__row">
        <label className="admin-form__field">
          <span>Title</span>
          <input type="text" name="title" required defaultValue={post?.title ?? ""} placeholder="e.g. How to pick a master's program" />
        </label>
        <label className="admin-form__field">
          <span>Slug</span>
          <input type="text" name="slug" defaultValue={post?.slug ?? ""} placeholder="auto-generated from title" />
        </label>
      </div>

      <label className="admin-form__field">
        <span>Excerpt</span>
        <textarea name="excerpt" rows={2} maxLength={500} defaultValue={post?.excerpt ?? ""} placeholder="Short summary shown in listings (max 500 chars)" />
      </label>

      <label className="admin-form__field">
        <span>Body (markdown)</span>
        <textarea name="body" rows={14} defaultValue={post?.body ?? ""} placeholder="## Section heading…" />
      </label>

      <div className="admin-form__row">
        <label className="admin-form__field">
          <span>Status</span>
          <select name="status" defaultValue={post?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="admin-form__field">
          <span>Publish date</span>
          <input type="datetime-local" name="published_at" defaultValue={post?.published_at ? post.published_at.slice(0, 16) : ""} />
        </label>
      </div>

      <div className="admin-form__row">
        <label className="admin-form__field">
          <span>Tags (comma-separated)</span>
          <input type="text" name="tags" defaultValue={post?.tags?.join(", ") ?? ""} placeholder="study-abroad, decisions" />
        </label>
        <label className="admin-form__field">
          <span>Cover image URL</span>
          <input type="url" name="cover_image" defaultValue={post?.cover_image ?? ""} placeholder="https://…" />
        </label>
      </div>

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--solid">
          {post ? "Save changes" : "Create post"}
        </button>
        {post && (
          <button type="submit" name="_action" value="delete" className="admin-btn admin-btn--ghost admin-btn--danger">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
