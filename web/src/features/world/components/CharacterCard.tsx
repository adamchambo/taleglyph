import { useWorkspace } from "../../../app/workspaceContext";
import { Link } from "react-router-dom";
import type { Character } from "../types";
export function CharacterCard({ character }: { character: Character }) {
  const { story } = useWorkspace();
  return (
    <article className="card">
      <small>{character.canonStatus}</small>
      <h3>
        <Link
          to={`/characters/${character.id}${story ? `?story=${story.id}` : ""}`}
        >
          {character.name}
        </Link>
      </h3>
      <p>{character.role}</p>
      <p>{character.description}</p>
    </article>
  );
}
