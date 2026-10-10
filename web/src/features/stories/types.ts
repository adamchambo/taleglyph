export type Novel = {
  id: string;
  spaceId: string;
  title: string;
  coverAssetId: string | null;
  chapterCount: number;
};
export type NovelWorkspace = {
  novel: Novel;
  chapters: Chapter[];
  manuscriptJson: string | null;
  legacyScenes: Scene[];
};
export type Chapter = {
  id: string;
  novelId: string;
  title: string;
  order: number;
};
export type Scene = {
  id: string;
  chapterId: string;
  title: string;
  prose: string;
  order: number;
  revision: number;
};
export type ChapterWorkspace = {
  chapter: Chapter;
  novel: Novel;
  scenes: Scene[];
};
