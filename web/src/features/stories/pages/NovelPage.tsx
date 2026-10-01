import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { useResource } from "../../../hooks/useResource";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { ResourceState } from "../../../components/ui/ResourceState";
import { TitleForm } from "../../../components/ui/TitleForm";
import { CoverageEditor } from "../../library/components/CoverageEditor";
import { WorkDetailsForm } from "../../library/components/WorkDetailsForm";
import { useStoryGraph } from "../../library/hooks/useStoryGraph";
import { manuscriptApi } from "../api/manuscriptApi";
import type { NovelWorkspace } from "../types";
function Novel({ data }: { data: NovelWorkspace }) {
  const { library } = useWorkspace();
  const navigate = useNavigate();
  const graph = useStoryGraph(data.novel.spaceId);
  const [novel, setNovel] = useState(data.novel);
  const [detailsDirty, setDetailsDirty] = useState(false);
  useUnsavedChanges(detailsDirty);
  return (
    <>
      <Link to={`/spaces/${novel.spaceId}/works`}>← Novels & comics</Link>
      <p className="eyebrow">Novel</p>
      <h1>{novel.title}</h1>
      <ResourceState
        loading={graph.loading}
        error={graph.error}
        retry={graph.reload}
      />
      {graph.data ? (
        <CoverageEditor
          label="What this novel tells"
          fromKind="novel"
          fromId={novel.id}
          stories={
            library?.stories.filter((s) => s.spaceId === novel.spaceId) ?? []
          }
          arcs={graph.data.arcs}
          initial={graph.data.links}
        />
      ) : null}
      <h2>Chapters</h2>
      {data.chapters.map((chapter) => (
        <Link
          className="chapter-row"
          key={chapter.id}
          to={`/chapters/${chapter.id}`}
        >
          <span>{String(chapter.order).padStart(2, "0")}</span>
          <strong>{chapter.title}</strong>
          <span>→</span>
        </Link>
      ))}
      {!data.chapters.length ? <p>This novel has no chapters yet.</p> : null}
      <TitleForm
        label="Chapter title"
        action="Add chapter"
        onCreate={async (title) => {
          const chapter = await manuscriptApi.createChapter(novel.id, title);
          navigate(`/chapters/${chapter.id}`);
        }}
      />
      <details className="work-settings">
        <summary>Title and cover</summary>
        <WorkDetailsForm
          kind="novel"
          id={novel.id}
          spaceId={novel.spaceId}
          initial={{ title: novel.title, coverAssetId: novel.coverAssetId }}
          onSaved={(details) => setNovel((n) => ({ ...n, ...details }))}
          onDirty={setDetailsDirty}
        />
      </details>
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
