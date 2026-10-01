import { useWorkspace } from "../../app/workspaceContext";
import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { worldApi } from "../../features/world/api/worldApi";
import { useResource } from "../../hooks/useResource";
import { ResourceState } from "./ResourceState";
export function WorldScope({
  children,
}: {
  children: (worldId: string) => ReactNode;
}) {
  const { space } = useWorkspace();
  const worlds = useResource(worldApi.list);
  const [params, setParams] = useSearchParams();
  const requested = space?.id ?? params.get("world");
  const id =
    worlds.data?.find((w) => w.id === requested)?.id ?? worlds.data?.[0]?.id;
  return (
    <>
      <ResourceState
        loading={worlds.loading}
        error={worlds.error}
        retry={worlds.reload}
      />
      {id ? (
        <>
          {!space ? (
            <label className="world-select">
              Story world
              <select
                value={id}
                onChange={(e) => setParams({ world: e.target.value })}
              >
                {worlds.data?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="scope-caption">Shared assets · {space.name}</p>
          )}
          {children(id)}
        </>
      ) : worlds.data?.length === 0 ? (
        <div className="empty">
          <p>
            Create a world to keep its writing, characters and artwork
            connected.
          </p>
          <Link to="/spaces/new">Create a space →</Link>
        </div>
      ) : null}
    </>
  );
}
