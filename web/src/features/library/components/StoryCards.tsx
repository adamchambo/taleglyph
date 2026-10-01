import { Link } from "react-router-dom";
import { Icon } from "../../../components/ui/Icon";
import { storyPath, type StoryCard } from "../types";
export function StoryCards({ stories }: { stories: StoryCard[] }) {
  return (
    <div className="cards">
      {stories.map((story) => (
        <Link className="card story-entry" key={story.id} to={storyPath(story)}>
          <div className="tile-kicker">
            <span>
              {story.arcCount} {story.arcCount === 1 ? "arc" : "arcs"}
            </span>
            <Icon name="arrow" size={18} />
          </div>
          <h2>{story.title}</h2>
          <p>{story.overview || "What happens here is still yours to find."}</p>
          <div className="tag-row">
            {story.tags.slice(0, 3).map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
