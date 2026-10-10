import { useCallback, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { useResource } from "../../../hooks/useResource";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { ResourceState } from "../../../components/ui/ResourceState";
import { Button } from "../../../components/ui/Button";
import { useStoryGraph } from "../../library/hooks/useStoryGraph";
import type { StoryLink } from "../../library/types";
import { manuscriptApi } from "../api/manuscriptApi";
import type { NovelWorkspace } from "../types";
import { ManuscriptEditor } from "../components/ManuscriptEditor";
import { NovelDetailsDialog } from "../components/NovelDetailsDialog";
import { useManuscriptAutosave } from "../hooks/useManuscriptAutosave";
import {
  importLegacy,
  identify,
  type Manuscript,
} from "../manuscript/document";

type View = "write" | "plan";

function Novel({ data }: { data: NovelWorkspace }) {
  const { library } = useWorkspace();
  const [search] = useSearchParams();
  const graph = useStoryGraph(data.novel.spaceId);
  const [novel, setNovel] = useState(data.novel);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsDirty, setDetailsDirty] = useState(false);
  // A deep link to a heading always opens in the writing view.
  const [view, setView] = useState<View>("write");
  const [initial] = useState(() =>
    data.manuscriptJson
      ? identify(JSON.parse(data.manuscriptJson) as Manuscript)
      : importLegacy(data.chapters, data.legacyScenes),
  );
  const { setDocument, status, dirty, retry } = useManuscriptAutosave({
    novelId: novel.id,
    serverJson: data.manuscriptJson,
    initialJson: JSON.stringify(initial),
  });
  const [links, setLinks] = useState<StoryLink[] | null>(null);
  useUnsavedChanges(dirty || detailsDirty);
  const coverage = (links ?? graph.data?.links ?? []).filter(
    (l) => l.fromKind === "novel" && l.fromId === novel.id,
  );
  const arcs = [...(graph.data?.arcs ?? [])]
    .filter((a) =>
      coverage.some((l) =>
        l.toKind === "arc" ? l.toId === a.id : l.toId === a.storyId,
      ),
    )
    .sort((a, b) => {
      const stories = library?.stories ?? [];
      return (
        (stories.find((s) => s.id === a.storyId)?.order ?? 0) -
          (stories.find((s) => s.id === b.storyId)?.order ?? 0) ||
        a.storyId.localeCompare(b.storyId) ||
        a.order - b.order
      );
    });
  function closeDetails() {
    // The dialog unmounts and drops any unsaved form draft, so clear the flag.
    setDetailsOpen(false);
    setDetailsDirty(false);
  }
  return (
    <>
      <header className="novel-topbar">
        <Link
          className="novel-topbar-back"
          to={`/spaces/${novel.spaceId}/novels`}
        >
          ← Novels
        </Link>
        <h1 className="novel-topbar-title" title={novel.title}>
          {novel.title}
        </h1>
        <div className="novel-topbar-views" role="group" aria-label="View">
          <button
            type="button"
            aria-pressed={view === "write"}
            onClick={() => setView("write")}
          >
            Write
          </button>
          <button
            type="button"
            aria-pressed={view === "plan"}
            onClick={() => setView("plan")}
          >
            Plan
          </button>
        </div>
        <span
          role="status"
          className={`novel-topbar-status is-${status.kind}`}
          title={"message" in status ? status.message : undefined}
        >
          <span className="novel-topbar-status-text">
            {status.kind === "saved" && "Saved"}
            {status.kind === "saving" && "Saving…"}
            {status.kind === "dirty" && "Unsaved changes"}
            {(status.kind === "error" || status.kind === "conflict") &&
              status.message}
          </span>
          {status.kind === "error" && (
            <Button variant="secondary" onClick={() => void retry()}>
              Retry
            </Button>
          )}
        </span>
        <Button variant="secondary" onClick={() => setDetailsOpen(true)}>
          Details
        </Button>
      </header>
      <ResourceState
        loading={graph.loading}
        error={graph.error}
        retry={graph.reload}
      />
      <ManuscriptEditor
        initial={initial}
        onChange={setDocument}
        arcs={arcs}
        targetId={search.get("heading") ?? ""}
        view={view}
        onViewChange={setView}
      />
      {detailsOpen ? (
        <NovelDetailsDialog
          novel={novel}
          stories={
            library?.stories.filter((s) => s.spaceId === novel.spaceId) ?? []
          }
          arcs={graph.data?.arcs ?? null}
          links={links ?? graph.data?.links ?? []}
          onSaved={(details) => setNovel((n) => ({ ...n, ...details }))}
          onDirty={setDetailsDirty}
          onLinksChanged={setLinks}
          onClose={closeDetails}
        />
      ) : null}
    </>
  );
}
export function NovelPage() {
  const { novelId = "" } = useParams();
  const load = useResource(
    useCallback(
      (signal: AbortSignal) => manuscriptApi.novel(novelId, signal),
      [novelId],
    ),
  );
  return (
    <section>
      <ResourceState
        loading={load.loading}
        error={load.error}
        retry={load.reload}
      />
      {load.data ? <Novel key={novelId} data={load.data} /> : null}
    </section>
  );
}
