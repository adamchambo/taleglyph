import { apiClient } from "../../../lib/apiClient";
import type { Comic, ComicWorkspace, Page, PageTemplate } from "../types";
export const comicApi = {
  list: (storyId: string, signal?: AbortSignal) =>
    apiClient<Comic[]>(`/comics?storyId=${storyId}`, { signal }),
  workspace: (id: string, signal?: AbortSignal) =>
    apiClient<ComicWorkspace>(`/adaptations/comics/${id}`, { signal }),
  templates: (worldId: string, signal?: AbortSignal) =>
    apiClient<PageTemplate[]>(`/adaptations/templates?worldId=${worldId}`, {
      signal,
    }),
  adapt: (
    chapterId: string,
    title: string,
    sceneIds: string[],
    panelCount: number,
    templateId: string | null,
  ) =>
    apiClient<{ id: string }>(`/adaptations/chapters/${chapterId}`, {
      method: "POST",
      body: JSON.stringify({ title, sceneIds, panelCount, templateId }),
    }),
  save: (page: Page) =>
    apiClient<Page>(`/adaptations/pages/${page.id}`, {
      method: "PUT",
      body: JSON.stringify(page),
    }),
  saveTemplate: (pageId: string, title: string, revision: number) =>
    apiClient<PageTemplate>(`/adaptations/pages/${pageId}/templates`, {
      method: "POST",
      body: JSON.stringify({ title, revision }),
    }),
  review: (pageId: string, revision: number) =>
    apiClient<void>(
      `/adaptations/pages/${pageId}/review?revision=${revision}`,
      { method: "POST" },
    ),
};
