import { useWorkspace } from "../../../app/workspaceContext";
import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { ResourceState } from "../../../components/ui/ResourceState";
import { worldApi } from "../api/worldApi";
import { CharacterForm } from "../components/CharacterForm";
export function CharacterDetailPage() {
  const { story } = useWorkspace();
  const { characterId = "" } = useParams();
  const character = useResource(
    useCallback(
      (signal: AbortSignal) => worldApi.character(characterId, signal),
      [characterId],
    ),
  );
  const [saved, setSaved] = useState(false);
  return (
    <section>
      <ResourceState
        loading={character.loading}
        error={character.error}
        retry={character.reload}
      />
      {character.data ? (
        <>
          <Link
            to={
              story
                ? `/stories/${story.id}/characters`
                : `/worlds/${character.data.worldId}`
            }
          >
            ← {story ? "Back to characters" : "Back to world"}
          </Link>
          <h1>{character.data.name}</h1>
          {saved ? <p role="status">Character saved.</p> : null}
          <CharacterForm
            key={character.data.id}
            initial={character.data}
            label="Save character"
            onSubmit={async (input) => {
              await worldApi.updateCharacter(characterId, input);
              setSaved(true);
              character.reload();
            }}
          />
        </>
      ) : null}
    </section>
  );
}
