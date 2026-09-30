import { useCallback } from "react";
import { Link } from "react-router-dom";
import { WorldScope } from "../../../components/ui/WorldScope";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useResource } from "../../../hooks/useResource";
import { manuscriptApi } from "../../stories/api/manuscriptApi";
import { comicApi } from "../api/comicApi";
function Comics({ worldId }: { worldId: string }) {
  const resource = useResource(
    useCallback(
      async (signal: AbortSignal) => {
        const stories = await manuscriptApi.stories(worldId, signal);
        return await Promise.all(
          stories.map(async (s) => ({
            story: s,
            comics: await comicApi.list(s.id, signal),
          })),
        );
      },
      [worldId],
    ),
  );
  const count = resource.data?.reduce((sum, x) => sum + x.comics.length, 0);
  return (
    <>
      <ResourceState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      <div className="cards">
        {resource.data?.flatMap((group) =>
          group.comics.map((c) => (
            <article className="card" key={c.id}>
              <small>{group.story.title}</small>
              <h2>
                <Link to={`/comics/${c.id}`}>{c.title}</Link>
              </h2>
              <p>Open pages, panels and their source scenes.</p>
            </article>
          )),
        )}
      </div>
      {count === 0 ? (
        <div className="empty">
          <h2>Your next adaptation starts with a scene</h2>
          <p>
            Open a chapter and select “Adapt to comic”. You can start with blank
            panels or a page template you’ve saved.
          </p>
          <Link className="button" to={`/stories?world=${worldId}`}>
            Open manuscripts
          </Link>
        </div>
      ) : null}
    </>
  );
}
export function ComicEditorPage() {
  return (
    <section>
      <p className="eyebrow">From prose to panels</p>
      <h1>Comic studio</h1>
      <p className="intro">
        Connected to your story. Free to take its own shape.
      </p>
      <WorldScope>{(id) => <Comics key={id} worldId={id} />}</WorldScope>
    </section>
  );
}
