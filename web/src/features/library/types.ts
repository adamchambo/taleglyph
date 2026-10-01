export type SpaceCard = {
  id: string;
  name: string;
  description: string;
  coverAssetId: string | null;
  storyCount: number;
  novelCount: number;
  comicCount: number;
  characterCount: number;
  assetCount: number;
  noteCount: number;
};
export type StoryCard = {
  id: string;
  spaceId: string;
  spaceName: string;
  title: string;
  overview: string;
  coverAssetId: string | null;
  tags: string[];
  updatedAt: string;
  revision: number;
  arcCount: number;
  order: number;
};
export type LibrarySnapshot = {
  spaces: SpaceCard[];
  stories: StoryCard[];
};
export type StorySetup = {
  title: string;
  overview: string;
  coverAssetId?: string | null;
  spaceId: string;
  tags: string[];
  revision: number;
};
export type WorkKind = "novel" | "comic";
export type WorkCard = {
  id: string;
  kind: WorkKind;
  spaceId: string;
  title: string;
  coverAssetId: string | null;
  updatedAt: string;
  partCount: number;
};
export type SpaceWorks = { novels: WorkCard[]; comics: WorkCard[] };
export type Arc = {
  id: string;
  storyId: string;
  title: string;
  summary: string;
  order: number;
};
export type LinkSource = WorkKind | "note";
export type LinkTarget = "story" | "arc";
export type StoryLink = {
  id: string;
  fromKind: LinkSource;
  fromId: string;
  toKind: LinkTarget;
  toId: string;
};
export type Note = {
  id: string;
  spaceId: string;
  title: string;
  content: string;
  updatedAt: string;
};
export type SpaceSection =
  | "overview"
  | "stories"
  | "works"
  | "world"
  | "characters"
  | "notes"
  | "timeline"
  | "assets";
export const spaceSections: {
  id: SpaceSection;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "overview",
    label: "Space home",
    icon: "overview",
    description: "Everything in this space at a glance",
  },
  {
    id: "stories",
    label: "Stories",
    icon: "plan",
    description: "What happens, told arc by arc.",
  },
  {
    id: "works",
    label: "Novels & graphic novels",
    icon: "novel",
    description: "Novels and graphic novels, kept as different works.",
  },
  {
    id: "world",
    label: "World",
    icon: "world",
    description: "Places, lore and the rules of this world.",
  },
  {
    id: "characters",
    label: "Characters",
    icon: "characters",
    description: "The people who move through every story here.",
  },
  {
    id: "notes",
    label: "Notes",
    icon: "notes",
    description: "Loose threads, linked to the stories they belong to.",
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: "clock",
    description: "One timeline for every story in this space.",
  },
  {
    id: "assets",
    label: "Assets",
    icon: "assets",
    description: "Artwork, references and reusable pieces.",
  },
];
export function spacePath(spaceId: string, section: SpaceSection) {
  return `/spaces/${spaceId}${section === "overview" ? "" : `/${section}`}`;
}
export function storyPath(story: { id: string; spaceId: string }) {
  return `/spaces/${story.spaceId}/stories/${story.id}`;
}
export function workPath(work: {
  id: string;
  kind: WorkKind;
  spaceId: string;
}) {
  return work.kind === "novel"
    ? `/spaces/${work.spaceId}/novels/${work.id}`
    : `/comics/${work.id}`;
}
