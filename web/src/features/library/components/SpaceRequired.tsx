import type { ReactNode } from "react";
import { useWorkspace } from "../../../app/workspaceContext";
import { ResourceState } from "../../../components/ui/ResourceState";
import type { SpaceCard } from "../types";
export function SpaceRequired({
  children,
}: {
  children: (space: SpaceCard) => ReactNode;
}) {
  const { space, library, loading, error, refresh } = useWorkspace();
  if (space) return children(space);
  return (
    <ResourceState
      loading={loading && !library}
      error={error || (library ? "Space not found." : "")}
      retry={refresh}
    />
  );
}
