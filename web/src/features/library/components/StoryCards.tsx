import { StoryArtwork } from "./StoryArtwork";
import { useState } from "react";
import { Link } from "react-router-dom";
import { overviewTags } from "../storyTags";
import { storyPath, type StoryCard } from "../types";
import { Icon } from "../../../components/ui/Icon";
export function StoryCards({
  stories,
  onReorder,
}: {
  stories: StoryCard[];
  onReorder: (ids: string[]) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function commit(
    story: StoryCard,
    current: number,
    input: HTMLInputElement,
  ) {
    const position = Number(input.value);
    if (
      !Number.isInteger(position) ||
      position < 1 ||
      position > stories.length ||
      position === current
    ) {
      input.value = String(current);
      return;
    }
    const ids = stories.map((item) => item.id);
    ids.splice(ids.indexOf(story.id), 1);
    ids.splice(position - 1, 0, story.id);
    setBusy(true);
    setError("");
    try {
      await onReorder(ids);
    } catch (e) {
      input.value = String(current);
      setError(e instanceof Error ? e.message : "Unable to reorder stories.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="cards">
        {stories.map((story, index) => {
          const position = story.order || index + 1;
          return (
            <article className="card story-entry" key={story.id}>
              <Link to={storyPath(story)} aria-label={`Open ${story.title}`}>
                <StoryArtwork
                  key={story.coverAssetId}
                  assetId={story.coverAssetId}
                  title={story.title}
                  variant={index}
                />
              </Link>
              <div className="tile-kicker">
                <label className="story-position">
                  <span className="sr-only">
                    Position of {story.title}. 1 is the top left.
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={stories.length}
                    disabled={busy || stories.length < 2}
                    defaultValue={position}
                    key={`${story.id}:${position}`}
                    onBlur={(event) =>
                      void commit(story, position, event.currentTarget)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                  />
                </label>
                <span>
                  {story.arcCount} {story.arcCount === 1 ? "arc" : "arcs"}
                </span>
                <Link to={storyPath(story)} aria-label={story.title}>
                  <Icon name="arrow" size={18} />
                </Link>
              </div>
              <Link to={storyPath(story)}>
                <h2>{story.title}</h2>
                <p>
                  {story.overview ||
                    "What happens here is still yours to find."}
                </p>
                <div className="tag-row">
                  {overviewTags(story.tags).map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
    </>
  );
}
