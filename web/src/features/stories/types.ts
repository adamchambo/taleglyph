export type Story = {
  id: string;
  worldId: string;
  title: string;
  synopsis: string;
};
export type Novel = {
  id: string;
  storyId: string;
  title: string;
  chapterCount: number;
};
export type NovelWorkspace = {
  novel: Novel;
  chapters: Chapter[];
};
export type Chapter = {
  id: string;
  storyId: string;
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
  story: Story;
  scenes: Scene[];
};
