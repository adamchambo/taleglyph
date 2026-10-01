import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { ResourceState } from "../../../components/ui/ResourceState";
import { worldApi } from "../api/worldApi";
import { useCharacters } from "../hooks/useCharacters";
import { CharacterCard } from "../components/CharacterCard";
import { CharacterForm } from "../components/CharacterForm";
export function WorldDetailPage({
  scopedWorldId,
  charactersOnly = false,
}: {
  scopedWorldId?: string;
  charactersOnly?: boolean;
}) {
  const params = useParams();
  const worldId = scopedWorldId ?? params.worldId ?? "";
  const world = useResource(
    useCallback(
      (signal: AbortSignal) => worldApi.get(worldId, signal),
      [worldId],
    ),
  );
  const characters = useCharacters(worldId);
  return (
    <section>
      {!charactersOnly ? (
        <Link to={`/spaces/${worldId}/world`}>← World</Link>
      ) : null}
      <ResourceState
        loading={world.loading}
        error={world.error}
        retry={world.reload}
      />
      {world.data ? (
        <>
          <p className="eyebrow">Story world</p>
          <h1>{charactersOnly ? "Characters" : world.data.name}</h1>
          <p className="intro">{world.data.description}</p>
          {!charactersOnly ? (
            <div className="toolbar">
              <Link className="button" to={`/spaces/${worldId}/works`}>
                Novels & comics
              </Link>
              <Link to={`/spaces/${worldId}/assets`}>Browse assets →</Link>
            </div>
          ) : null}
          {!charactersOnly ? <h2>Characters</h2> : null}
          <ResourceState
            loading={characters.loading}
            error={characters.error}
            retry={characters.reload}
          />
          <div className="cards">
            {characters.data?.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
          {characters.data?.length === 0 ? <p>Your cast starts here.</p> : null}
          <CharacterForm
            onSubmit={async (input) => {
              await worldApi.createCharacter(worldId, input);
              characters.reload();
            }}
          />
        </>
      ) : null}
    </section>
  );
}
