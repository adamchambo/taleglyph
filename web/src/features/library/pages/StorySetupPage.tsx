import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Icon } from "../../../components/ui/Icon";
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
  const [params] = useSearchParams();
  const spaceId = params.get("space");
  return (
    <section className="onboarding-page">
      <Link
        className="back-link"
        to={
          editing && story
            ? `/stories/${story.id}`
            : spaceId
              ? `/spaces/${spaceId}`
              : "/library"
        }
      >
        ←{" "}
        {editing ? "Back to story" : spaceId ? "Back to space" : "Your library"}
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
        ) : spaceId && library.spaces.some((space) => space.id === spaceId) ? (
          <StorySetupForm spaceId={spaceId} />
        ) : (
          <div className="story-setup">
            <div className="setup-step space-created">
              <h2>Choose a space first.</h2>
              <p className="muted">
                A story belongs to a space. Create one, or open a space you
                already have, and add the story from there.
              </p>
              <div className="setup-actions">
                <Link className="button" to="/spaces/new">
                  New space
                  <Icon name="arrow" size={17} />
                </Link>
              </div>
              {library.spaces.length > 0 ? (
                <div className="space-list">
                  {library.spaces.map((space) => (
                    <Link
                      className="space-entry"
                      key={space.id}
                      to={`/spaces/${space.id}`}
                    >
                      <strong>{space.name}</strong>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )
      ) : null}
    </section>
  );
}
