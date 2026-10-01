import { Link, useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Icon } from "../../../components/ui/Icon";
import { ResourceState } from "../../../components/ui/ResourceState";
import { StoryCards } from "../components/StoryCards";
export function SpaceHomePage() {
  const { spaceId = "" } = useParams();
  const { library, loading, error, refresh } = useWorkspace();
  const space = library?.spaces.find((item) => item.id === spaceId);
  const stories =
    library?.stories.filter((story) => story.spaceId === spaceId) ?? [];
  return (
    <section className="library-page">
      <Link className="back-link" to="/library">
        ← Your library
      </Link>
      <ResourceState
        loading={loading && !library}
        error={error}
        retry={refresh}
      />
      {library && !space ? (
        <h1>Space not found.</h1>
      ) : space ? (
        <>
          <div className="library-heading">
            <div>
              <p className="eyebrow">Space</p>
              <h1>{space.name}</h1>
              <p className="intro">
                {space.description ||
                  "Stories in this space share its places, peoples and assets."}
              </p>
            </div>
            <Link
              className="button primary-create"
              to={`/stories/new?space=${space.id}`}
            >
              <Icon name="plus" size={18} />
              New story
            </Link>
          </div>
          {stories.length > 0 ? (
            <StoryCards stories={stories} />
          ) : (
            <div className="library-empty">
              <Icon name="novel" size={40} />
              <h2>No stories in this space yet.</h2>
              <p>A story name is enough. It will belong to {space.name}.</p>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
