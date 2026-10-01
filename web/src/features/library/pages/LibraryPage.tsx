import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Icon } from "../../../components/ui/Icon";
import { ResourceState } from "../../../components/ui/ResourceState";
import { StoryArtwork } from "../components/StoryArtwork";
export function LibraryPage() {
  const { library, loading, error, refresh, recent } = useWorkspace();
  const [query, setQuery] = useState("");
  const spaces = library?.spaces ?? [];
  const needle = query.trim().toLowerCase();
  const filtered = spaces.filter((space) =>
    [
      space.name,
      space.description,
      ...(library?.stories
        .filter((s) => s.spaceId === space.id)
        .flatMap((s) => [s.title, ...s.tags]) ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
  const resumed = spaces
    .filter((s) => recent[s.id]?.path?.startsWith("/"))
    .sort((a, b) =>
      (recent[b.id]?.visitedAt ?? "").localeCompare(
        recent[a.id]?.visitedAt ?? "",
      ),
    )[0];
  return (
    <section className="library-page">
      <div className="library-heading">
        <div>
          <p className="eyebrow">A little possibility. A whole new world.</p>
          <h1>
            Your spaces live here<span className="accent-dot">.</span>
          </h1>
          <p className="intro">
            Each space is a universe: its world, its stories, and every novel
            and comic that tells them.
          </p>
        </div>
        <Link className="button primary-create" to="/spaces/new">
          <Icon name="plus" size={18} />
          New space
        </Link>
      </div>
      <ResourceState loading={loading} error={error} retry={refresh} />
      {resumed ? (
        <Link className="resume-banner" to={recent[resumed.id].path}>
          <StoryArtwork assetId={resumed.coverAssetId} title={resumed.name} />
          <div>
            <span className="eyebrow">Pick up the thread</span>
            <h2>{resumed.name}</h2>
            <span>{recent[resumed.id].label} · Continue working</span>
          </div>
          <span className="resume-arrow">
            <Icon name="arrow" />
          </span>
        </Link>
      ) : null}
      {spaces.length ? (
        <div className="library-controls">
          <label className="search-field">
            <Icon name="search" />
            <span className="sr-only">Search spaces</span>
            <input
              placeholder="Search spaces, stories or tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <span className="library-count">
            {filtered.length} {filtered.length === 1 ? "space" : "spaces"}
          </span>
        </div>
      ) : null}
      <div className="story-grid">
        {filtered.map((space, i) => (
          <Link
            className="story-tile"
            key={space.id}
            to={`/spaces/${space.id}`}
          >
            <StoryArtwork
              key={space.coverAssetId}
              assetId={space.coverAssetId}
              title={space.name}
              variant={i}
            />
            <div className="story-tile-body">
              <div className="tile-kicker">
                <span>Space</span>
                <Icon name="arrow" size={18} />
              </div>
              <h2>{space.name}</h2>
              <p>
                {space.description || "A universe waiting for its stories."}
              </p>
              <div className="tile-footer">
                <span>
                  {space.storyCount}{" "}
                  {space.storyCount === 1 ? "story" : "stories"}
                </span>
                <span>
                  {space.novelCount}{" "}
                  {space.novelCount === 1 ? "novel" : "novels"} ·{" "}
                  {space.comicCount}{" "}
                  {space.comicCount === 1 ? "comic" : "comics"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {library && filtered.length === 0 ? (
        <div className="library-empty">
          <Icon name="world" size={40} />
          <h2>
            {query ? "No spaces found." : "Every universe starts somewhere."}
          </h2>
          <p>
            {query
              ? "Try another name, story or tag."
              : "Create a space first. Stories, novels and comics live inside it."}
          </p>
          {!query ? (
            <Link className="button" to="/spaces/new">
              Create a space <Icon name="arrow" size={17} />
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
