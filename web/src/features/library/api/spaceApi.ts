import { apiClient } from "../../../lib/apiClient";
import type {
  Arc,
  LinkSource,
  LinkTarget,
  Note,
  SpaceWorks,
  StoryLink,
  WorkCard,
  WorkKind,
} from "../types";
type NoteDraft = { title: string; content: string };
type ArcDraft = { title: string; summary: string };
const json = (method: string, body: unknown) => ({
  method,
  body: JSON.stringify(body),
});
export const spaceApi = {
  update: (
    id: string,
    space: { name: string; description: string; coverAssetId: string | null },
  ) => apiClient<void>(`/spaces/${id}`, json("PUT", space)),
  works: (id: string, signal?: AbortSignal) =>
    apiClient<SpaceWorks>(`/spaces/${id}/works`, { signal }),
  createWork: (id: string, kind: WorkKind, title: string) =>
    apiClient<WorkCard>(
      `/spaces/${id}/${kind === "novel" ? "novels" : "comics"}`,
      json("POST", { title }),
    ),
  updateWork: (
    kind: WorkKind,
    id: string,
    work: { title: string; coverAssetId: string | null },
  ) => apiClient<void>(`/works/${kind}/${id}`, json("PUT", work)),
  arcs: (spaceId: string, signal?: AbortSignal) =>
    apiClient<Arc[]>(`/spaces/${spaceId}/arcs`, { signal }),
  createArc: (storyId: string, arc: ArcDraft) =>
    apiClient<Arc>(`/stories/${storyId}/arcs`, json("POST", arc)),
  updateArc: (id: string, arc: ArcDraft) =>
    apiClient<Arc>(`/arcs/${id}`, json("PUT", arc)),
  deleteArc: (id: string) =>
    apiClient<void>(`/arcs/${id}`, { method: "DELETE" }),
  reorderArcs: (storyId: string, arcIds: string[]) =>
    apiClient<Arc[]>(`/stories/${storyId}/arcs/order`, json("PUT", { arcIds })),
  links: (spaceId: string, signal?: AbortSignal) =>
    apiClient<StoryLink[]>(`/spaces/${spaceId}/links`, { signal }),
  createLink: (link: {
    fromKind: LinkSource;
    fromId: string;
    toKind: LinkTarget;
    toId: string;
  }) => apiClient<StoryLink>("/links", json("POST", link)),
  deleteLink: (id: string) =>
    apiClient<void>(`/links/${id}`, { method: "DELETE" }),
  notes: (spaceId: string, signal?: AbortSignal) =>
    apiClient<Note[]>(`/spaces/${spaceId}/notes`, { signal }),
  createNote: (spaceId: string, note: NoteDraft) =>
    apiClient<Note>(`/spaces/${spaceId}/notes`, json("POST", note)),
  updateNote: (id: string, note: NoteDraft) =>
    apiClient<Note>(`/notes/${id}`, json("PUT", note)),
  deleteNote: (id: string) =>
    apiClient<void>(`/notes/${id}`, { method: "DELETE" }),
};
