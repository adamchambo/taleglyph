import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WorldScope } from "../../../components/ui/WorldScope";
import { TitleForm } from "../../../components/ui/TitleForm";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useResource } from "../../../hooks/useResource";
import { manuscriptApi } from "../api/manuscriptApi";
function Stories({ worldId }: { worldId: string }) {
  const stories = useResource(
    useCallback(
      (s: AbortSignal) => manuscriptApi.stories(worldId, s),
      [worldId],
    ),
  );
  const navigate = useNavigate();
  return (
    <>
      <ResourceState
        loading={stories.loading}
        error={stories.error}
        retry={stories.reload}
      />
      <div className="cards">
        {stories.data?.map((story) => (
          <article className="card" key={story.id}>
            <small>Manuscript</small>
            <h2>
              <Link to={`/stories/${story.id}`}>{story.title}</Link>
            </h2>
            <p>
              {story.synopsis ||
                "Chapters, scenes, and their comic adaptations."}
            </p>
          </article>
        ))}
      </div>
      {stories.data?.length === 0 ? (
        <p>No manuscripts yet. Start with a title.</p>
      ) : null}
      <TitleForm
        label="Story title"
        action="Create manuscript"
        onCreate={async (title) => {
          const story = await manuscriptApi.createStory(worldId, title);
          navigate(`/stories/${story.id}`);
        }}
      />
    </>
  );
}
export function ManuscriptPage() {
  return (
    <section>
      <p className="eyebrow">Words into worlds</p>
      <h1>Manuscripts</h1>
      <p className="intro">
        Write a scene. Find its rhythm. Give it another life on the page.
      </p>
      <WorldScope>{(id) => <Stories key={id} worldId={id} />}</WorldScope>
    </section>
  );
}
