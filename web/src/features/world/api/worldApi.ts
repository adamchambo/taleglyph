import { apiClient } from "../../../lib/apiClient";
import type { World, CreateWorld, Character, CharacterInput } from "../types";
export const worldApi = {
  list: (signal: AbortSignal) => apiClient<World[]>("/worlds", { signal }),
  get: (id: string, signal: AbortSignal) =>
    apiClient<World>(`/worlds/${encodeURIComponent(id)}`, { signal }),
  create: (input: CreateWorld) =>
    apiClient<World>("/worlds", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  characters: (worldId: string, signal: AbortSignal) =>
    apiClient<Character[]>(
      `/characters?worldId=${encodeURIComponent(worldId)}`,
      { signal },
    ),
  character: (id: string, signal: AbortSignal) =>
    apiClient<Character>(`/characters/${encodeURIComponent(id)}`, { signal }),
  createCharacter: (worldId: string, input: CharacterInput) =>
    apiClient<Character>("/characters", {
      method: "POST",
      body: JSON.stringify({ worldId, ...input }),
    }),
  updateCharacter: (id: string, input: CharacterInput) =>
    apiClient<Character>(`/characters/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
