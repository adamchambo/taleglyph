export type Section =
  | "overview"
  | "notes"
  | "characters"
  | "world"
  | "plan"
  | "novel"
  | "comic"
  | "assets";
export type SpaceSummary = { id: string; name: string; description: string };
export type SeriesSummary = { id: string; spaceId: string; name: string };
export type StoryCard = {
  id: string;
  spaceId: string;
  spaceName: string;
  title: string;
  overview: string;
  tags: string[];
  seriesId: string | null;
  seriesName: string | null;
  coverAssetId: string | null;
  updatedAt: string;
  startingSection: Section;
  revision: number;
  chapterCount: number;
  comicCount: number;
  characterCount: number;
  assetCount: number;
};
export type LibrarySnapshot = {
  stories: StoryCard[];
  spaces: SpaceSummary[];
  series: SeriesSummary[];
};
export type StorySetup = {
  title: string;
  overview: string;
  spaceId: string | null;
  newSpaceName: string | null;
  tags: string[];
  startingSection: Section;
  coverAssetId: string | null;
  seriesId: string | null;
  revision: number;
};
export const sections: {
  id: Section;
  label: string;
  description: string;
  future?: boolean;
}[] = [
  {
    id: "overview",
    label: "Story home",
    description: "Your story at a glance",
  },
  {
    id: "notes",
    label: "Notes & tasks",
    description: "Catch a thought. Give it somewhere to grow.",
    future: true,
  },
  {
    id: "characters",
    label: "Characters",
    description: "Meet the people who make your story.",
  },
  {
    id: "world",
    label: "World",
    description: "Places, lore and the rules of this world.",
  },
  {
    id: "plan",
    label: "Story plan",
    description: "Find the shape of your story, beat by beat.",
    future: true,
  },
  {
    id: "novel",
    label: "Novel",
    description: "Turn your ideas into chapters and scenes.",
  },
  {
    id: "comic",
    label: "Comic",
    description: "Tell the story in panels, pages and images.",
  },
  {
    id: "assets",
    label: "Assets",
    description: "Your artwork, references and reusable pieces.",
  },
];
export function sectionPath(id: string, section: Section) {
  return `/stories/${id}${section === "overview" ? "" : `/${section}`}`;
}
