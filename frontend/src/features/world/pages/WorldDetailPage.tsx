import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { ResourceState } from "../../../components/ui/ResourceState";
import { worldApi } from "../api/worldApi";
import { useCharacters } from "../hooks/useCharacters";
import { CharacterCard } from "../components/CharacterCard";
import { CharacterForm } from "../components/CharacterForm";
export function WorldDetailPage() {
  const { worldId = "" } = useParams();
  const world = useResource(
    useCallback(
      (signal: AbortSignal) => worldApi.get(worldId, signal),
      [worldId],
    ),
  );
  const characters = useCharacters(worldId);
  return (
    <section>
      <Link to="/worlds">← All worlds</Link>
      <ResourceState
        loading={world.loading}
        error={world.error}
        retry={world.reload}
      />
      {world.data ? (
        <>
          <p className="eyebrow">Story world</p>
          <h1>{world.data.name}</h1>
          <p className="intro">{world.data.description}</p>
          <div className="toolbar">
            <Link className="button" to={`/stories?world=${worldId}`}>
              Open manuscripts
            </Link>
            <Link to={`/assets?world=${worldId}`}>Browse assets →</Link>
          </div>
          <h2>Characters</h2>
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
