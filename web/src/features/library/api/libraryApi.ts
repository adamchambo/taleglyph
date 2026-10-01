import { apiClient } from "../../../lib/apiClient";
import type { LibrarySnapshot, StoryCard, StorySetup } from "../types";
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
  context: (kind: string, id: string, signal?: AbortSignal) =>
    apiClient<{ spaceId: string }>(`/library/context/${kind}/${id}`, {
      signal,
    }),
  cover: (id: string) => `${config.apiBaseUrl}/assets/${id}/image`,
};
