import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { SpaceRequired } from "../components/SpaceRequired";
import { StorySetupForm } from "../components/StorySetupForm";
import { storyPath } from "../types";
export function StorySetupPage({ editing = false }: { editing?: boolean }) {
  const { story } = useWorkspace();
  return (
    <section className="onboarding-page">
      <SpaceRequired>
        {(space) =>
          editing ? (
            story ? (
              <>
                <Link className="back-link" to={storyPath(story)}>
                  ← {story.title}
                </Link>
                <h1>Story details</h1>
                <StorySetupForm
                  key={story.id}
                  initial={story}
                  spaceId={space.id}
                />
              </>
            ) : (
              <p>Story not found.</p>
            )
          ) : (
            <>
              <Link className="back-link" to={`/spaces/${space.id}/stories`}>
                ← Stories
              </Link>
              <div className="onboarding-title">
                <span className="eyebrow">A new story in {space.name}</span>
                <h1>Let’s make room for your story.</h1>
              </div>
              <StorySetupForm spaceId={space.id} />
            </>
          )
        }
      </SpaceRequired>
    </section>
  );
}
