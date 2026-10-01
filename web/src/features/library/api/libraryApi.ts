import { apiClient } from "../../../lib/apiClient";
import type { Novel } from "../../stories/types";
import type {
  LibrarySnapshot,
  StoryCard,
  StorySetup,
  SeriesSummary,
} from "../types";
import { config } from "../../../lib/config";
export const libraryApi = {
  list: (signal?: AbortSignal) =>
    apiClient<LibrarySnapshot>("/library", { signal }),
  create: (draft: StorySetup) =>
    apiClient<StoryCard>("/library/stories", {
      method: "POST",
      body: JSON.stringify(draft),
    }),
  update: (id: string, draft: StorySetup) =>
    apiClient<StoryCard>(`/library/stories/${id}`, {
      method: "PUT",
      body: JSON.stringify(draft),
    }),
  createSeries: (spaceId: string, name: string) =>
    apiClient<SeriesSummary>("/library/series", {
      method: "POST",
      body: JSON.stringify({ spaceId, name }),
    }),
  context: (kind: string, id: string, signal?: AbortSignal) =>
    apiClient<{ storyId: string; spaceId: string }>(
      `/library/context/${kind}/${id}`,
      { signal },
    ),
  novels: (id: string, signal?: AbortSignal) =>
    apiClient<Novel[]>(`/library/stories/${id}/novels`, { signal }),
  createNovel: (id: string, title: string) =>
    apiClient<Novel>(`/library/stories/${id}/novels`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  createComic: (id: string, title: string) =>
    apiClient<{ id: string }>(`/library/stories/${id}/comics`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  cover: (id: string) => `${config.apiBaseUrl}/assets/${id}/image`,
};
