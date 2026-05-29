import { fetchMediaList, type MediaItem } from "@/lib/cms/media";
import { MediaLibrary } from "./_MediaLibrary";

export const metadata = { title: "Media library · Captor admin" };

type SearchParams = { q?: string; folder?: string; format?: string };

type LoadResult = { items: MediaItem[]; live: boolean; error: string | null };

async function loadMedia(params: SearchParams): Promise<LoadResult> {
  try {
    const res = await fetchMediaList({
      q: params.q,
      folder: params.folder,
      format: params.format,
      perPage: 120,
    });
    return { items: res.data, live: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Backend unreachable.";
    return { items: [], live: false, error: msg };
  }
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { items, live, error } = await loadMedia(params);

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <span className="kicker">CMS</span>
          <h1 className="h2">Media library</h1>
          <p className="admin-muted">
            Upload images once and reuse them across pages, blog posts, and stories.
            Files are stored on Cloudinary and served with auto format and quality.
          </p>
        </div>
      </header>

      {!live && (
        <p className="admin-gated" role="status">
          Backend unavailable — {error}.
        </p>
      )}

      <MediaLibrary
        initialItems={items}
        initialQuery={params.q ?? ""}
        live={live}
      />
    </div>
  );
}
