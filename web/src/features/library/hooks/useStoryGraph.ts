import { useCallback } from "react";
import { useResource } from "../../../hooks/useResource";
import { spaceApi } from "../api/spaceApi";
export function useStoryGraph(spaceId: string) {
  return useResource(
    useCallback(
      async (signal: AbortSignal) => {
        const [arcs, links] = await Promise.all([
          spaceApi.arcs(spaceId, signal),
          spaceApi.links(spaceId, signal),
        ]);
        return { arcs, links };
      },
      [spaceId],
    ),
  );
}
