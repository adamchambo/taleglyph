import type { Arc, StoryCard, StoryLink } from "./types";
export function describeLink(
  link: StoryLink,
  stories: StoryCard[],
  arcs: Arc[],
) {
  if (link.toKind === "story")
    return stories.find((s) => s.id === link.toId)?.title ?? "Unknown story";
  const arc = arcs.find((a) => a.id === link.toId);
  const story = stories.find((s) => s.id === arc?.storyId);
  return arc ? `${story?.title ?? "Story"} · ${arc.title}` : "Unknown arc";
}
