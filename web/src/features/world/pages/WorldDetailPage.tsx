import { useCallback, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { Textarea } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useResource } from "../../../hooks/useResource";
import { worldApi } from "../api/worldApi";
import { useCharacters } from "../hooks/useCharacters";
import { CharacterCard } from "../components/CharacterCard";
import { CharacterForm } from "../components/CharacterForm";
import type { World } from "../types";
function CastSummary({ world }: { world: World }) {
  const [summary, setSummary] = useState(world.castSummary);
  const [draft, setDraft] = useState(world.castSummary);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const saved = await worldApi.updateCastSummary(world.id, draft.trim());
      setSummary(saved.castSummary);
      setDraft(saved.castSummary);
      setEditing(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save the cast summary.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (editing) {
    return (
      <form className="cast-summary" onSubmit={save}>
        <label>
          Cast summary
          <Textarea
            rows={4}
            maxLength={4000}
            value={draft}
            disabled={busy}
            autoFocus
            placeholder="Who these characters are, as a cast."
            onChange={(e) => setDraft(e.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
        <div className="toolbar">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save summary"}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              setDraft(summary);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }
  return (
    <div className="cast-summary">
      <p className="intro">
        {summary ||
          "No cast summary yet. This is about the characters, not the story."}
      </p>
      <Button variant="secondary" onClick={() => setEditing(true)}>
        Edit summary
      </Button>
    </div>
  );
}
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
  const castEmpty = characters.data ? characters.data.length === 0 : undefined;
  const [creating, setCreating] = useState(false);
  const createButton = (
    <Button
      className="primary-create"
      aria-expanded={creating}
      aria-haspopup="dialog"
      onClick={() => setCreating(true)}
    >
      <Icon name="plus" size={18} />
      New character
    </Button>
  );
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
          {charactersOnly ? (
            <div className="library-heading">
              <div>
                <p className="eyebrow">{world.data.name}</p>
                <h1>Characters</h1>
                <CastSummary key={world.data.id} world={world.data} />
              </div>
              {createButton}
            </div>
          ) : (
            <>
              <p className="eyebrow">Story world</p>
              <h1>{world.data.name}</h1>
              <p className="intro">{world.data.description}</p>
              <div className="toolbar">
                <Link className="button" to={`/spaces/${worldId}/novels`}>
                  Novels
                </Link>
                <Link
                  className="button secondary"
                  to={`/spaces/${worldId}/graphic-novels`}
                >
                  Graphic novels
                </Link>
                <Link to={`/spaces/${worldId}/assets`}>Browse assets →</Link>
              </div>
              <div className="section-heading">
                <h2>Characters</h2>
                {createButton}
              </div>
            </>
          )}
          {creating ? (
            <Modal title="New character" onClose={() => setCreating(false)}>
              <CharacterForm
                showLegend={false}
                onCancel={() => setCreating(false)}
                onSubmit={async (input) => {
                  await worldApi.createCharacter(worldId, input);
                  characters.reload();
                  setCreating(false);
                }}
              />
            </Modal>
          ) : null}
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
          {castEmpty ? <p>Your cast starts here.</p> : null}
        </>
      ) : null}
    </section>
  );
}
