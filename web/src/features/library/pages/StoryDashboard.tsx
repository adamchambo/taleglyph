import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { sections, sectionPath } from "../types";
import { StoryArtwork } from "../components/StoryArtwork";
import { Icon } from "../../../components/ui/Icon";
import { ResourceState } from "../../../components/ui/ResourceState";
export function StoryDashboard() {
  const { story, loading, error, refresh, recent } = useWorkspace();
  if (!story)
    return (
      <ResourceState
        loading={loading}
        error={error || (!loading ? "Story not found." : "")}
        retry={refresh}
      />
    );
  const last = recent[story.id];
  return (
    <section className="story-dashboard">
      <div className="dashboard-hero">
        <StoryArtwork
          key={story.coverAssetId}
          assetId={story.coverAssetId}
          title={story.title}
        />
        <div className="dashboard-hero-content">
          <p className="eyebrow">
            {story.spaceName}
            {story.seriesName ? ` / ${story.seriesName}` : ""}
          </p>
          <h1>{story.title}</h1>
          <p>
            {story.overview ||
              "A whole story waiting to take shape. Start wherever your imagination takes you."}
          </p>
          <div className="tag-row">
            {story.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          <div className="hero-actions">
            <Link
              className="button"
              to={
                last?.path?.startsWith("/")
                  ? last.path
                  : story.startingSection === "overview"
                    ? "#workspace-sections"
                    : sectionPath(story.id, story.startingSection)
              }
            >
              {last ? "Continue working" : "Find your starting point"}
              <Icon name="arrow" size={17} />
            </Link>
            <Link className="button glass" to={`/stories/${story.id}/settings`}>
              <Icon name="settings" size={16} />
              Story details
            </Link>
          </div>
        </div>
      </div>
      <div className="section-heading" id="workspace-sections">
        <div>
          <p className="eyebrow">Connected pieces. Endless possibilities.</p>
          <h2>Your creative workspace</h2>
        </div>
        <span className="muted">Start anywhere.</span>
      </div>
      <div className="workspace-card-grid">
        {sections
          .filter((s) => s.id !== "overview")
          .map((s) => {
            const count =
              s.id === "characters"
                ? `${story.characterCount} characters`
                : s.id === "assets"
                  ? `${story.assetCount} assets`
                  : s.id === "novel"
                    ? story.chapterCount > 0
                      ? "1 novel"
                      : "0 novels"
                    : s.id === "comic"
                      ? `${story.comicCount} ${story.comicCount === 1 ? "comic" : "comics"}`
                      : s.id === "world"
                        ? story.spaceName
                        : "Coming next";
            return (
              <Link
                className={`workspace-card card-${s.id}`}
                key={s.id}
                to={sectionPath(story.id, s.id)}
              >
                <span className="section-icon">
                  <Icon name={s.id} size={25} />
                </span>
                <div>
                  <h3>{s.label}</h3>
                  <p>{s.description}</p>
                </div>
                <footer>
                  <span>{count}</span>
                  <Icon name="arrow" size={18} />
                </footer>
              </Link>
            );
          })}
      </div>
    </section>
  );
}
