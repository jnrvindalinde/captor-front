import Link from "next/link";

export const metadata = { title: "Site copy (moved) · Captor admin" };

export default function ContentPageRedirect() {
  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <span className="kicker">Content</span>
          <h1 className="h2">Site copy has moved</h1>
          <p className="admin-muted">
            The key/value site-copy editor has been retired. The new CMS lets you
            edit full pages, sections, navigation, and media in one place.
          </p>
        </div>
      </header>

      <div className="admin-card">
        <p>Head over to the new CMS:</p>
        <ul>
          <li><Link href="/admin/cms/media">Media library</Link> — upload and manage images.</li>
          <li><em>Pages, collections, and navigation editors are landing in the next phases.</em></li>
        </ul>
      </div>
    </div>
  );
}
