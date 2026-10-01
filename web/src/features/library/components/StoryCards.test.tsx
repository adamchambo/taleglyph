import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { StoryCards } from "./StoryCards";
import type { StoryCard } from "../types";

const story: StoryCard = {
  id: "story-1",
  spaceId: "space-1",
  spaceName: "Space",
  title: "Story",
  overview: "",
  coverAssetId: null,
  tags: [],
  updatedAt: "",
  revision: 1,
  arcCount: 0,
  order: 1,
};

function cards(stories: StoryCard[]) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <StoryCards stories={stories} onReorder={async () => {}} />
    </MemoryRouter>,
  );
}

describe("story covers", () => {
  it("shows different patterned typographic covers when artwork is absent", () => {
    const html = cards([
      story,
      { ...story, id: "story-2", title: "Second", order: 2 },
    ]);
    expect(html.match(/class="cover-placeholder"/g)).toHaveLength(2);
    expect(html).toContain("story-art art-0");
    expect(html).toContain("story-art art-1");
    expect(html).toContain("<span>Second</span>");
  });

  it("shows the selected asset instead of the placeholder", () => {
    const html = cards([{ ...story, coverAssetId: "cover-asset" }]);
    expect(html).toContain("/api/assets/cover-asset/image");
    expect(html).toContain("<img");
    expect(html).not.toContain('class="cover-placeholder"');
  });
});
