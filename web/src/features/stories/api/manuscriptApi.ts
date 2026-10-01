import { apiClient } from "../../../lib/apiClient";
import type { Story, Chapter, Scene, ChapterWorkspace } from "../types";
export const manuscriptApi = {
  stories: (worldId: string, signal?: AbortSignal) =>
    apiClient<Story[]>(`/stories?worldId=${worldId}`, { signal }),
  story: (id: string, signal?: AbortSignal) =>
    apiClient<Story>(`/stories/${id}`, { signal }),
  chapters: (id: string, signal?: AbortSignal) =>
    apiClient<Chapter[]>(`/stories/${id}/chapters`, { signal }),
  createStory: (worldId: string, title: string) =>
    apiClient<Story>("/manuscripts/stories", {
      method: "POST",
      body: JSON.stringify({ worldId, title }),
    }),
  createChapter: (id: string, title: string) =>
    apiClient<Chapter>(`/manuscripts/stories/${id}/chapters`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  chapter: (id: string, signal?: AbortSignal) =>
    apiClient<ChapterWorkspace>(`/manuscripts/chapters/${id}`, { signal }),
  addScene: (id: string, title: string) =>
    apiClient<Scene>(`/manuscripts/chapters/${id}/scenes`, {
      method: "POST",
      body: JSON.stringify({ title, prose: "" }),
    }),
  saveScene: (scene: Scene) =>
    apiClient<Scene>(`/manuscripts/scenes/${scene.id}`, {
      method: "PUT",
      body: JSON.stringify(scene),
    }),
};
