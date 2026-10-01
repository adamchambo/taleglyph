import { useWorkspace } from "../../../app/workspaceContext";
import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { ResourceState } from "../../../components/ui/ResourceState";
import { comicApi } from "../api/comicApi";
import { assetApi } from "../../assets/api/assetApi";
import type { Asset } from "../../assets/types";
import type { ComicWorkspace } from "../types";
import { PageEditor } from "../components/PageEditor";
function Studio({
  initial,
  initialAssets,
}: {
  initial: ComicWorkspace;
  initialAssets: Asset[];
}) {
  const { story } = useWorkspace();
  const [comic, setComic] = useState(initial);
  const [assets, setAssets] = useState(initialAssets);
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  const page = comic.pages[selected];
  return (
    <>
      <Link
        to={
          story
            ? `/stories/${story.id}/comic`
            : `/comics?world=${comic.worldId}`
        }
      >
        ← Comic studio
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{comic.storyTitle} / Comic adaptation</p>
          <h1>{comic.title}</h1>
        </div>
        <span className="badge">
          {comic.pages.length} {comic.pages.length === 1 ? "page" : "pages"}
        </span>
      </div>
      <nav className="page-tabs" aria-label="Comic pages">
        {comic.pages.map((p, i) => (
          <button
            key={p.id}
            className={selected === i ? "active" : ""}
            aria-current={selected === i ? "page" : undefined}
            onClick={() => {
              if (
                i !== selected &&
                (!dirty ||
                  window.confirm("Discard unsaved changes on this page?"))
              ) {
                setSelected(i);
                setDirty(false);
              }
            }}
          >
            Page {p.number}
            {p.source?.needsReview ? " · Source changed" : ""}
          </button>
        ))}
      </nav>
      {page ? (
        <PageEditor
          key={page.id}
          page={page}
          worldId={comic.worldId}
          assets={assets}
          onAssets={(a) => setAssets((items) => [...items, a])}
          onDirty={setDirty}
          onSaved={(saved) =>
            setComic((c) => ({
              ...c,
              pages: c.pages.map((p) => (p.id === saved.id ? saved : p)),
            }))
          }
          onSourceRefresh={async () => {
            const fresh = await comicApi.workspace(comic.id);
            setComic((c) => ({
              ...c,
              pages: c.pages.map((p) => ({
                ...p,
                source:
                  fresh.pages.find((f) => f.id === p.id)?.source ?? p.source,
              })),
            }));
          }}
        />
      ) : (
        <p>This comic has no pages.</p>
      )}
    </>
  );
}
export function ComicWorkspacePage() {
  const { comicId = "" } = useParams();
  const data = useResource(
    useCallback(
      async (s: AbortSignal) => {
        const comic = await comicApi.workspace(comicId, s);
        const assets = await assetApi.list(comic.worldId, s);
        return { comic, assets };
      },
      [comicId],
    ),
  );
  return (
    <section className="wide">
      <ResourceState
        loading={data.loading}
        error={data.error}
        retry={data.reload}
      />
      {data.data ? (
        <Studio
          key={comicId}
          initial={data.data.comic}
          initialAssets={data.data.assets}
        />
      ) : null}
    </section>
  );
}
