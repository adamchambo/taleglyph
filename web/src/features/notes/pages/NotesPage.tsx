import { useCallback, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { Input, Textarea } from "../../../components/ui/Input";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useOpenWhenEmpty } from "../../../hooks/useOpenWhenEmpty";
import { useResource } from "../../../hooks/useResource";
import { spaceApi } from "../../library/api/spaceApi";
import { CoverageEditor } from "../../library/components/CoverageEditor";
import { SpaceRequired } from "../../library/components/SpaceRequired";
import { useStoryGraph } from "../../library/hooks/useStoryGraph";
import type { Arc, Note, StoryCard, StoryLink } from "../../library/types";
type Draft = { title: string; content: string };
function NoteForm({
  initial = { title: "", content: "" },
  action,
  onSubmit,
  onCancel,
}: {
  initial?: Draft;
  action: string;
  onSubmit: (draft: Draft) => Promise<void>;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({ ...draft, title: draft.title.trim() });
      if (!onCancel) setDraft({ title: "", content: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save note.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="note-form" onSubmit={submit}>
      <fieldset disabled={busy}>
        <label>
          Note title
          <Input
            required
            maxLength={120}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </label>
        <label>
          Note
          <Textarea
            rows={5}
            maxLength={20000}
            value={draft.content}
            onChange={(e) =>
              setDraft((d) => ({ ...d, content: e.target.value }))
            }
          />
        </label>
        <div className="toolbar">
          <Button type="submit" disabled={!draft.title.trim()}>
            {busy ? "Saving…" : action}
          </Button>
          {onCancel ? (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
      </fieldset>
    </form>
  );
}
function NoteCard({
  initial,
  stories,
  arcs,
  links,
  onDeleted,
}: {
  initial: Note;
  stories: StoryCard[];
  arcs: Arc[];
  links: StoryLink[];
  onDeleted: (id: string) => void;
}) {
  const [note, setNote] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (!window.confirm(`Delete “${note.title}”?`)) return;
    setError("");
    try {
      await spaceApi.deleteNote(note.id);
      onDeleted(note.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete note.");
    }
  }
  return (
    <article className="card note-card">
      {editing ? (
        <NoteForm
          initial={note}
          action="Save note"
          onCancel={() => setEditing(false)}
          onSubmit={async (draft) => {
            setNote(await spaceApi.updateNote(note.id, draft));
            setEditing(false);
          }}
        />
      ) : (
        <>
          <div className="note-heading">
            <h2>{note.title}</h2>
            <div className="toolbar">
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" onClick={remove}>
                Delete
              </Button>
            </div>
          </div>
          {note.content ? <p className="note-content">{note.content}</p> : null}
        </>
      )}
      <CoverageEditor
        label="Linked stories"
        fromKind="note"
        fromId={note.id}
        stories={stories}
        arcs={arcs}
        initial={links}
      />
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
    </article>
  );
}
function Notes({
  notes: initial,
  spaceName,
}: {
  notes: Note[];
  spaceName: string;
}) {
  const { spaceId = "" } = useParams();
  const { library, refresh } = useWorkspace();
  const graph = useStoryGraph(spaceId);
  const [notes, setNotes] = useState(initial);
  const stories = library?.stories.filter((s) => s.spaceId === spaceId) ?? [];
  const [creating, toggleCreating, closeCreating] = useOpenWhenEmpty(
    notes.length === 0,
  );
  return (
    <>
      <div className="library-heading">
        <div>
          <p className="eyebrow">{spaceName}</p>
          <h1>Notes</h1>
          <p className="intro">
            Notes belong to the whole space. Link one to the stories or arcs it
            is about.
          </p>
        </div>
        <Button
          className="primary-create"
          aria-expanded={creating}
          aria-controls="note-create"
          onClick={toggleCreating}
        >
          <Icon name="plus" size={18} />
          New note
        </Button>
      </div>
      {creating ? (
        <div className="create-panel" id="note-create">
          <NoteForm
            action="Add note"
            onSubmit={async (draft) => {
              const note = await spaceApi.createNote(spaceId, draft);
              setNotes((items) => [note, ...items]);
              closeCreating();
              void refresh();
            }}
          />
        </div>
      ) : null}
      <ResourceState
        loading={graph.loading}
        error={graph.error}
        retry={graph.reload}
      />
      {graph.data ? (
        <div className="note-list">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              initial={note}
              stories={stories}
              arcs={graph.data!.arcs}
              links={graph.data!.links}
              onDeleted={(id) => {
                setNotes((items) => items.filter((n) => n.id !== id));
                void refresh();
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
export function NotesPage() {
  const { spaceId = "" } = useParams();
  const notes = useResource(
    useCallback((s: AbortSignal) => spaceApi.notes(spaceId, s), [spaceId]),
  );
  return (
    <section className="library-page">
      <SpaceRequired>
        {(space) =>
          notes.data ? (
            <Notes key={spaceId} notes={notes.data} spaceName={space.name} />
          ) : (
            <>
              <p className="eyebrow">{space.name}</p>
              <h1>Notes</h1>
              <p className="intro">
                Notes belong to the whole space. Link one to the stories or arcs
                it is about.
              </p>
              <ResourceState
                loading={notes.loading}
                error={notes.error}
                retry={notes.reload}
              />
            </>
          )
        }
      </SpaceRequired>
    </section>
  );
}
