import { Link } from "react-router-dom";
import { StoryArtwork } from "./StoryArtwork";
import { Icon } from "../../../components/ui/Icon";
import type { StoryCard } from "../types";
export function StoryCards({ stories }: { stories: StoryCard[] }) {
  return (
    <div className="story-grid">
      {stories.map((story, i) => (
        <Link className="story-tile" key={story.id} to={`/stories/${story.id}`}>
          <StoryArtwork
            key={story.coverAssetId}
            assetId={story.coverAssetId}
            title={story.title}
            variant={i}
          />
          <div className="story-tile-body">
            <div className="tile-kicker">
              <span>{story.seriesName || story.spaceName}</span>
              <Icon name="arrow" size={18} />
            </div>
            <h2>{story.title}</h2>
            <p>
              {story.overview || "An unwritten possibility. Make it yours."}
            </p>
            <div className="tag-row">
              {story.tags.slice(0, 3).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="tile-footer">
              <span>
                <Icon name="clock" size={13} />
                Edited{" "}
                {new Date(story.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>
                {story.novelCount} {story.novelCount === 1 ? "novel" : "novels"}{" "}
                · {story.comicCount}{" "}
                {story.comicCount === 1 ? "comic" : "comics"}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
