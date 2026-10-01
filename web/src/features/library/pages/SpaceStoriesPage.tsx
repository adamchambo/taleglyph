import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Icon } from "../../../components/ui/Icon";
import { SpaceRequired } from "../components/SpaceRequired";
import { StoryCards } from "../components/StoryCards";
export function SpaceStoriesPage() {
  const { library } = useWorkspace();
  return (
    <section className="library-page">
      <SpaceRequired>
        {(space) => {
          const stories =
            library?.stories.filter((s) => s.spaceId === space.id) ?? [];
          return (
            <>
              <div className="library-heading">
                <div>
                  <p className="eyebrow">{space.name}</p>
                  <h1>Stories</h1>
                  <p className="intro">
                    A story is what happens. Break it into arcs, then tell it in
                    as many novels and comics as you like.
                  </p>
                </div>
                <Link
                  className="button primary-create"
                  to={`/spaces/${space.id}/stories/new`}
                >
                  <Icon name="plus" size={18} />
                  New story
                </Link>
              </div>
              {stories.length ? (
                <StoryCards stories={stories} />
              ) : (
                <div className="library-empty">
                  <Icon name="plan" size={40} />
                  <h2>No stories in this space yet.</h2>
                  <p>A story name is enough. Arcs can come later.</p>
                </div>
              )}
            </>
          );
        }}
      </SpaceRequired>
    </section>
  );
}
