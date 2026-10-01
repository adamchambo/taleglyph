import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import { Link, useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { Input, Textarea } from "../../../components/ui/Input";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useOpenWhenEmpty } from "../../../hooks/useOpenWhenEmpty";
import { useResource } from "../../../hooks/useResource";
import { spaceApi } from "../api/spaceApi";
import { StoryArtwork } from "../components/StoryArtwork";
import { useStoryGraph } from "../hooks/useStoryGraph";
import {
  workPath,
  type Arc,
  type StoryCard,
  type StoryLink,
  type WorkCard,
} from "../types";
type ArcDraft = { title: string; summary: string };
type RailDrag = {
  index: number;
  destination: number;
  height: number;
  tops: number[];
  heights: number[];
};
type RailGesture = RailDrag & { pointerId: number };
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
  const [creating, toggleCreating, closeCreating] = useOpenWhenEmpty(
    arcs.length === 0,
  );
  const [rail, setRail] = useState<RailDrag | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const gesture = useRef<RailGesture | null>(null);
  const arcsRef = useRef(arcs);
  arcsRef.current = arcs;
  useEffect(() => {
    if (!rail) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      gesture.current = null;
      setRail(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rail]);
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
  function reorder(ids: string[]) {
    const previous = arcsRef.current;
    const order = new Map(ids.map((id, index) => [id, index]));
    setArcs(
      [...previous]
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
        .map((arc, index) => ({ ...arc, order: index + 1 })),
    );
    void run(async () => {
      try {
        setArcs(await spaceApi.reorderArcs(story.id, ids));
      } catch (error) {
        setArcs(previous);
        throw error;
      }
    });
  }
  function move(index: number, by: -1 | 1) {
    const ids = arcs.map((a) => a.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    reorder(ids);
  }
  function cancelRail() {
    gesture.current = null;
    setRail(null);
  }
  function placeOnRail(
    index: number,
    destination: number,
    tops: number[],
    heights: number[],
  ) {
    if (destination === index) return 0;
    if (destination > index) {
      return (
        tops[destination] + heights[destination] - heights[index] - tops[index]
      );
    }
    return tops[destination] - tops[index];
  }
  function beginRail(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (event.button !== 0 || busy || editing || arcs.length < 2) return;
    const list = listRef.current;
    if (!list) return;
    const listTop = list.getBoundingClientRect().top;
    const rows = [...list.querySelectorAll<HTMLLIElement>(":scope > li")];
    const rects = rows.map((row) => row.getBoundingClientRect());
    const tops = rects.map((rect) => rect.top - listTop);
    const heights = rects.map((rect) => rect.height);
    const next = {
      index,
      destination: index,
      height: heights[index],
      pointerId: event.pointerId,
      tops,
      heights,
    };
    gesture.current = next;
    setRail(next);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function moveRail(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    const list = listRef.current;
    if (!current || !list || event.pointerId !== current.pointerId) return;
    const pointer = event.clientY - list.getBoundingClientRect().top;
    let destination = 0;
    for (let i = 0; i < current.tops.length; i++) {
      if (pointer >= current.tops[i] + current.heights[i] / 2) destination = i;
    }
    if (destination === current.destination) return;
    const next = { ...current, destination };
    gesture.current = next;
    setRail(next);
  }
  function endRail(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || event.pointerId !== current.pointerId) return;
    gesture.current = null;
    setRail(null);
    if (current.destination === current.index) return;
    const ids = arcsRef.current.map((arc) => arc.id);
    const [id] = ids.splice(current.index, 1);
    ids.splice(current.destination, 0, id);
    reorder(ids);
  }
  function shift(index: number) {
    if (!rail) return 0;
    if (index === rail.index)
      return placeOnRail(rail.index, rail.destination, rail.tops, rail.heights);
    if (
      rail.destination > rail.index &&
      index > rail.index &&
      index <= rail.destination
    )
      return -rail.height;
    if (
      rail.destination < rail.index &&
      index >= rail.destination &&
      index < rail.index
    )
      return rail.height;
    return 0;
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
      <div className="section-heading">
        <h2>Arcs</h2>
        <Button
          className="primary-create"
          aria-expanded={creating}
          aria-controls="arc-create"
          onClick={toggleCreating}
        >
          <Icon name="plus" size={18} />
          New arc
        </Button>
      </div>
      {creating ? (
        <div className="create-panel" id="arc-create">
          <ArcForm
            action="Add arc"
            onSubmit={async (draft) => {
              const arc = await spaceApi.createArc(story.id, draft);
              setArcs((items) => [...items, arc]);
              closeCreating();
              void refresh();
            }}
          />
        </div>
      ) : null}
      {arcs.length ? (
        <ol
          ref={listRef}
          className={rail ? "arc-list is-reordering" : "arc-list"}
        >
          {arcs.map((arc, i) => {
            const offset = shift(i);
            return (
              <li
                key={arc.id}
                className={rail?.index === i ? "arc-dragging" : undefined}
                style={
                  offset ? { transform: `translateY(${offset}px)` } : undefined
                }
              >
                <button
                  type="button"
                  className="arc-grip"
                  aria-label={`Reorder ${arc.title}`}
                  disabled={
                    busy ||
                    !!editing ||
                    arcs.length < 2 ||
                    (rail !== null && rail.index !== i)
                  }
                  onPointerDown={(event) => beginRail(event, i)}
                  onPointerMove={moveRail}
                  onPointerUp={endRail}
                  onPointerCancel={cancelRail}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") cancelRail();
                  }}
                >
                  <Icon name="grip" size={16} />
                </button>
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
                        disabled={busy || rail !== null || i === 0}
                        onClick={() => move(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Move ${arc.title} down`}
                        disabled={
                          busy || rail !== null || i === arcs.length - 1
                        }
                        onClick={() => move(i, 1)}
                      >
                        ↓
                      </button>
                      <Button
                        variant="secondary"
                        disabled={busy || rail !== null}
                        onClick={() => setEditing(arc.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        disabled={busy || rail !== null}
                        onClick={() => remove(arc)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
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
        <Link to={`/spaces/${story.spaceId}/novels`}>Novels</Link> or{" "}
        <Link to={`/spaces/${story.spaceId}/graphic-novels`}>
          Graphic novels
        </Link>
        .
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
      <div className="dashboard-hero story-hero">
        <StoryArtwork
          key={story.coverAssetId}
          assetId={story.coverAssetId}
          title={story.title}
          variant={(story.order || 1) - 1}
        />
        <div className="dashboard-hero-content">
          <p className="eyebrow">{story.spaceName} / Story</p>
          <h1>{story.title}</h1>
          <p>{story.overview || "What happens here is still yours to find."}</p>
          {story.tags.length ? (
            <div className="tag-row">
              {story.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <div className="hero-actions">
            <Link
              className="button glass"
              to={`/spaces/${story.spaceId}/stories/${story.id}/settings`}
            >
              <Icon name="settings" size={16} />
              Story details
            </Link>
          </div>
        </div>
      </div>
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
