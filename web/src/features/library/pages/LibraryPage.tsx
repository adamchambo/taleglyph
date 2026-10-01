import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Icon } from "../../../components/ui/Icon";
import { ResourceState } from "../../../components/ui/ResourceState";
import { StoryCards } from "../components/StoryCards";
import { StoryArtwork } from "../components/StoryArtwork";
export function LibraryPage() {
  const { library, loading, error, refresh, recent } = useWorkspace();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const stories = library?.stories ?? [];
  const filtered = stories.filter((s) =>
    [s.title, s.overview, s.spaceName, s.seriesName ?? "", ...s.tags]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const groups = new Map<string, { label: string; items: typeof filtered }>();
  for (const story of filtered) {
    const key =
      group === "space"
        ? story.spaceId
        : group === "series"
          ? (story.seriesId ?? "standalone")
          : "all";
    const label =
      group === "space"
        ? story.spaceName
        : group === "series"
          ? (story.seriesName ?? "Standalone stories")
          : "Your stories";
    const entry = groups.get(key) ?? { label, items: [] };
    entry.items.push(story);
    groups.set(key, entry);
  }
  const resumed = stories
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
            Your stories live here<span className="accent-dot">.</span>
          </h1>
          <p className="intro">
            Build a world, follow a character, or start with a single scene.
          </p>
        </div>
        <Link className="button primary-create" to="/stories/new">
          <Icon name="plus" size={18} />
          New story
        </Link>
      </div>
      <ResourceState loading={loading} error={error} retry={refresh} />
      {resumed ? (
        <Link className="resume-banner" to={recent[resumed.id].path}>
          <StoryArtwork assetId={resumed.coverAssetId} title={resumed.title} />
          <div>
            <span className="eyebrow">Pick up the thread</span>
            <h2>{resumed.title}</h2>
            <span>{recent[resumed.id].label} · Continue working</span>
          </div>
          <span className="resume-arrow">
            <Icon name="arrow" />
          </span>
        </Link>
      ) : null}
      <div className="library-controls">
        <label className="search-field">
          <Icon name="search" />
          <span className="sr-only">Search stories</span>
          <input
            placeholder="Search stories, spaces or tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="group-control">
          Group by
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="all">All stories</option>
            <option value="space">Space</option>
            <option value="series">Series</option>
          </select>
        </label>
        <span className="library-count">
          {filtered.length} {filtered.length === 1 ? "story" : "stories"}
        </span>
      </div>
      {[...groups].map(([key, { label, items }]) => (
        <div key={key} className="story-group">
          <h2 className="group-heading">{label}</h2>
          <StoryCards stories={items ?? []} />
        </div>
      ))}
      {library && filtered.length === 0 ? (
        <div className="library-empty">
          <Icon name="novel" size={40} />
          <h2>
            {query ? "No stories found." : "Every story starts somewhere."}
          </h2>
          <p>
            {query
              ? "Try another title, space or tag."
              : "Give your idea a name. The rest can unfold as you go."}
          </p>
          {!query ? (
            <Link className="button" to="/stories/new">
              Create your first story <Icon name="arrow" size={17} />
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
