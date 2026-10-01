import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { ResourceState } from "../../../components/ui/ResourceState";
import { StorySetupForm } from "../components/StorySetupForm";
import { useResource } from "../../../hooks/useResource";
import { assetApi } from "../../assets/api/assetApi";
function ExistingSetup() {
  const { story } = useWorkspace();
  const worldId = story?.spaceId ?? "";
  const assets = useResource(
    useCallback((s: AbortSignal) => assetApi.list(worldId, s), [worldId]),
  );
  return (
    <>
      <ResourceState
        loading={assets.loading}
        error={assets.error}
        retry={assets.reload}
      />
      {assets.data && story ? (
        <StorySetupForm key={story.id} initial={story} assets={assets.data} />
      ) : null}
    </>
  );
}
export function StorySetupPage({ editing = false }: { editing?: boolean }) {
  const { story, loading, error, refresh, library } = useWorkspace();
  return (
    <section className="onboarding-page">
      <Link
        className="back-link"
        to={editing && story ? `/stories/${story.id}` : "/library"}
      >
        ← {editing ? "Back to story" : "Your library"}
      </Link>
      {editing ? (
        <h1>Story details</h1>
      ) : (
        <div className="onboarding-title">
          <span className="eyebrow">A new beginning</span>
          <h1>Let’s make room for your story.</h1>
        </div>
      )}
      <ResourceState
        loading={loading && !library}
        error={error}
        retry={refresh}
      />
      {library ? (
        editing ? (
          story ? (
            <ExistingSetup />
          ) : (
            <p>Story not found.</p>
          )
        ) : (
          <StorySetupForm />
        )
      ) : null}
    </section>
  );
}
