import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Icon } from "../../../components/ui/Icon";
import { StoryArtwork } from "../components/StoryArtwork";
import { SpaceRequired } from "../components/SpaceRequired";
import {
  spacePath,
  spaceSections,
  type SpaceCard,
  type SpaceSection,
} from "../types";
function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
function summary(space: SpaceCard, section: SpaceSection) {
  switch (section) {
    case "stories":
      return plural(space.storyCount, "story", "stories");
    case "works":
      return `${plural(space.novelCount, "novel", "novels")} · ${plural(space.comicCount, "comic", "comics")}`;
    case "characters":
      return plural(space.characterCount, "character", "characters");
    case "notes":
      return plural(space.noteCount, "note", "notes");
    case "assets":
      return plural(space.assetCount, "asset", "assets");
    case "world":
      return space.name;
    default:
      return "Coming next";
  }
}
function SpaceHub({ space }: { space: SpaceCard }) {
  const { recent } = useWorkspace();
  const last = recent[space.id];
  return (
    <section className="story-dashboard">
      <div className="dashboard-hero">
        <StoryArtwork
          key={space.coverAssetId}
          assetId={space.coverAssetId}
          title={space.name}
        />
        <div className="dashboard-hero-content">
          <p className="eyebrow">Space</p>
          <h1>{space.name}</h1>
          <p>
            {space.description ||
              "A whole universe waiting to take shape. Its stories, books and comics share everything here."}
          </p>
          <div className="hero-actions">
            <Link
              className="button"
              to={
                last?.path?.startsWith("/") ? last.path : "#workspace-sections"
              }
            >
              {last ? `Continue: ${last.label}` : "Find your starting point"}
              <Icon name="arrow" size={17} />
            </Link>
            <Link className="button glass" to={`/spaces/${space.id}/settings`}>
              <Icon name="settings" size={16} />
              Space details
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
        {spaceSections
          .filter((s) => s.id !== "overview")
          .map((s) => (
            <Link
              className={`workspace-card card-${s.id}`}
              key={s.id}
              to={spacePath(space.id, s.id)}
            >
              <span className="section-icon">
                <Icon name={s.icon} size={25} />
              </span>
              <div>
                <h3>{s.label}</h3>
                <p>{s.description}</p>
              </div>
              <footer>
                <span>{summary(space, s.id)}</span>
                <Icon name="arrow" size={18} />
              </footer>
            </Link>
          ))}
      </div>
    </section>
  );
}
export function SpaceHomePage() {
  return <SpaceRequired>{(space) => <SpaceHub space={space} />}</SpaceRequired>;
}
