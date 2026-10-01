import { useCallback } from "react";
import { useResource } from "../../../hooks/useResource";
import { worldApi } from "../api/worldApi";
export function useCharacters(worldId: string) {
  return useResource(
    useCallback(
      (signal: AbortSignal) => worldApi.characters(worldId, signal),
      [worldId],
    ),
  );
}
