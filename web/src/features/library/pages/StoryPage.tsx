import { useCallback, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { Input, Textarea } from "../../../components/ui/Input";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useResource } from "../../../hooks/useResource";
import { spaceApi } from "../api/spaceApi";
import { useStoryGraph } from "../hooks/useStoryGraph";
import {
  workPath,
  type Arc,
  type StoryCard,
  type StoryLink,
  type WorkCard,
} from "../types";
type ArcDraft = { title: string; summary: string };
function ArcForm({
  initial = { title: "", summary: "" },
  action,
  onSubmit,
  onCancel,
}: {
  initial?: ArcDraft;
  action: string;
  onSubmit: (draft: ArcDraft) => Promise<void>;
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
      await onSubmit({
        title: draft.title.trim(),
        summary: draft.summary.trim(),
      });
      if (!onCancel) setDraft({ title: "", summary: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save arc.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="arc-form" onSubmit={submit}>
      <fieldset disabled={busy}>
        <label>
          Arc title
          <Input
            required
            maxLength={120}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </label>
        <label>
          <span>
            What happens <span className="optional">Optional</span>
          </span>
          <Textarea
            rows={3}
            maxLength={4000}
            value={draft.summary}
            onChange={(e) =>
              setDraft((d) => ({ ...d, summary: e.target.value }))
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
function Arcs({ story, initial }: { story: StoryCard; initial: Arc[] }) {
  const { refresh } = useWorkspace();
  const [arcs, setArcs] = useState(() =>
    initial.filter((a) => a.storyId === story.id),
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update arcs.");
    } finally {
      setBusy(false);
    }
  }
  function move(index: number, by: -1 | 1) {
    const ids = arcs.map((a) => a.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    void run(async () => setArcs(await spaceApi.reorderArcs(story.id, ids)));
  }
  function remove(arc: Arc) {
    if (
      !window.confirm(
        `Delete “${arc.title}”? Novels and comics linked to it keep their writing, but lose this link.`,
      )
    )
      return;
    void run(async () => {
      await spaceApi.deleteArc(arc.id);
      setArcs((items) =>
        items
          .filter((a) => a.id !== arc.id)
          .map((a, i) => ({ ...a, order: i + 1 })),
      );
      void refresh();
    });
  }
  return (
    <>
      {arcs.length ? (
        <ol className="arc-list">
          {arcs.map((arc, i) => (
            <li key={arc.id}>
              <span className="arc-number">
                {String(arc.order).padStart(2, "0")}
              </span>
              {editing === arc.id ? (
                <ArcForm
                  initial={arc}
                  action="Save arc"
                  onCancel={() => setEditing(null)}
                  onSubmit={async (draft) => {
                    const saved = await spaceApi.updateArc(arc.id, draft);
                    setArcs((items) =>
                      items.map((a) => (a.id === saved.id ? saved : a)),
                    );
                    setEditing(null);
                  }}
                />
              ) : (
                <>
                  <div>
                    <strong>{arc.title}</strong>
                    {arc.summary ? <p>{arc.summary}</p> : null}
                  </div>
                  <div className="arc-actions">
                    <button
                      className="icon-button"
                      aria-label={`Move ${arc.title} up`}
                      disabled={busy || i === 0}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Move ${arc.title} down`}
                      disabled={busy || i === arcs.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </button>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => setEditing(arc.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => remove(arc)}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">
          No arcs yet. Arcs are the large movements of a story, such as a
          betrayal, a war or a homecoming.
        </p>
      )}
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
      <details className="arc-create">
        <summary>Add an arc</summary>
        <ArcForm
          action="Add arc"
          onSubmit={async (draft) => {
            const arc = await spaceApi.createArc(story.id, draft);
            setArcs((items) => [...items, arc]);
            void refresh();
          }}
        />
      </details>
    </>
  );
}
function ToldIn({
  story,
  arcs,
  links,
  works,
}: {
  story: StoryCard;
  arcs: Arc[];
  links: StoryLink[];
  works: WorkCard[];
}) {
  const storyArcs = new Map(
    arcs.filter((a) => a.storyId === story.id).map((a) => [a.id, a]),
  );
  const covering = works
    .map((work) => {
      const own = links.filter(
        (l) =>
          l.fromKind === work.kind &&
          l.fromId === work.id &&
          (l.toId === story.id || storyArcs.has(l.toId)),
      );
      const parts = own.map((l) =>
        l.toKind === "story"
          ? "The whole story"
          : (storyArcs.get(l.toId)?.title ?? "An arc"),
      );
      return { work, parts };
    })
    .filter((entry) => entry.parts.length);
  if (!covering.length)
    return (
      <p className="muted">
        No novel or comic tells this story yet. Link one from its own page under{" "}
        <Link to={`/spaces/${story.spaceId}/works`}>Novels & comics</Link>.
      </p>
    );
  return (
    <div className="cards">
      {covering.map(({ work, parts }) => (
        <Link
          className="card comic-entry"
          key={`${work.kind}-${work.id}`}
          to={workPath(work)}
        >
          <Icon name={work.kind} size={30} />
          <h3>{work.title}</h3>
          <span>{parts.join(" · ")}</span>
        </Link>
      ))}
    </div>
  );
}
export function StoryPage() {
  const { spaceId = "" } = useParams();
  const { story, library, loading, error, refresh } = useWorkspace();
  const graph = useStoryGraph(spaceId);
  const works = useResource(
    useCallback((s: AbortSignal) => spaceApi.works(spaceId, s), [spaceId]),
  );
  if (!story)
    return (
      <ResourceState
        loading={loading && !library}
        error={error || (library ? "Story not found." : "")}
        retry={refresh}
      />
    );
  return (
    <section className="library-page">
      <Link className="back-link" to={`/spaces/${story.spaceId}/stories`}>
        ← Stories
      </Link>
      <div className="library-heading">
        <div>
          <p className="eyebrow">{story.spaceName} / Story</p>
          <h1>{story.title}</h1>
          <p className="intro">
            {story.overview || "What happens here is still yours to find."}
          </p>
          <div className="tag-row">
            {story.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <Link
          className="button secondary"
          to={`/spaces/${story.spaceId}/stories/${story.id}/settings`}
        >
          <Icon name="settings" size={16} />
          Story details
        </Link>
      </div>
      <h2>Arcs</h2>
      <ResourceState
        loading={graph.loading}
        error={graph.error}
        retry={graph.reload}
      />
      {graph.data ? (
        <Arcs key={story.id} story={story} initial={graph.data.arcs} />
      ) : null}
      <h2>Told in</h2>
      <ResourceState
        loading={works.loading}
        error={works.error}
        retry={works.reload}
      />
      {graph.data && works.data ? (
        <ToldIn
          story={story}
          arcs={graph.data.arcs}
          links={graph.data.links}
          works={[...works.data.novels, ...works.data.comics]}
        />
      ) : null}
    </section>
  );
}
