export type Layer = {
  name: string;
  kind: "Text" | "Image";
  x: number;
  y: number;
  width: number;
  visible: boolean;
  locked: boolean;
  assetId: string | null;
  text: string | null;
};
export type Panel = { title: string; layers: Layer[] };
export type Source = {
  sceneId: string;
  chapterId: string;
  chapterTitle: string;
  originalTitle: string;
  originalProse: string;
  sourceRevision: number;
  currentTitle: string;
  currentProse: string;
  currentRevision: number;
  needsReview: boolean;
};
export type Page = {
  id: string;
  number: number;
  revision: number;
  panels: Panel[];
  source: Source | null;
};
export type ComicWorkspace = {
  id: string;
  worldId: string;
  title: string;
  coverAssetId: string | null;
  spaceName: string;
  pages: Page[];
};
export type PageTemplate = {
  id: string;
  worldId: string;
  name: string;
  panelCount: number;
};
