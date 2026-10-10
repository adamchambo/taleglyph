import { apiClient } from "../../../lib/apiClient";
import type {
  Chapter,
  Scene,
  ChapterWorkspace,
  NovelWorkspace,
} from "../types";
export const manuscriptApi = {
  novel: (id: string, signal?: AbortSignal) =>
    apiClient<NovelWorkspace>(`/manuscripts/novels/${id}`, { signal }),
  saveDocument: (
    id: string,
    documentJson: string,
    expectedDocumentJson: string | null,
  ) =>
    apiClient<void>(`/manuscripts/novels/${id}/document`, {
      method: "PUT",
      body: JSON.stringify({ documentJson, expectedDocumentJson }),
    }),
  createChapter: (id: string, title: string) =>
    apiClient<Chapter>(`/manuscripts/novels/${id}/chapters`, {
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
