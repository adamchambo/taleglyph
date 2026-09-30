import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { ResourceState } from "../../../components/ui/ResourceState";
import { TitleForm } from "../../../components/ui/TitleForm";
import { SceneEditor } from "../components/SceneEditor";
import { AdaptChapterForm } from "../components/AdaptChapterForm";
import { manuscriptApi } from "../api/manuscriptApi";
import type { ChapterWorkspace } from "../types";
function ChapterEditor({ data }: { data: ChapterWorkspace }) {
  const [scenes, setScenes] = useState(data.scenes);
  const [dirty, setDirty] = useState<string[]>([]);
  const [adapting, setAdapting] = useState(false);
  useUnsavedChanges(dirty.length > 0);
  return (
    <>
      <Link to={`/stories/${data.story.id}`}>← {data.story.title}</Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Chapter {data.chapter.order}</p>
          <h1>{data.chapter.title}</h1>
          <p className="muted">Write in scenes. Adapt at your own pace.</p>
        </div>
        <button
          className="button"
          disabled={!scenes.length}
          onClick={() => setAdapting((v) => !v)}
        >
          {adapting ? "Close adaptation setup" : "Adapt to comic"}
        </button>
      </div>
      <div
        className={adapting ? "chapter-layout" : "chapter-layout writing-only"}
      >
        <div>
          {scenes.map((scene) => (
            <SceneEditor
              key={`${scene.id}-${scene.revision}`}
              initial={scene}
              onSaved={(saved) =>
                setScenes((items) =>
                  items.map((s) => (s.id === saved.id ? saved : s)),
                )
              }
              onDirty={(id, value) =>
                setDirty((ids) =>
                  value
                    ? [...new Set([...ids, id])]
                    : ids.filter((x) => x !== id),
                )
              }
            />
          ))}
          {!scenes.length ? (
            <div className="empty">
              <h2>One scene is enough to begin</h2>
              <p>
                Add a scene, then write or paste your prose. You can adapt
                selected scenes whenever you’re ready.
              </p>
            </div>
          ) : null}
          <TitleForm
            label="New scene title"
            action="Add scene"
            onCreate={async (title) => {
              const scene = await manuscriptApi.addScene(
                data.chapter.id,
                title,
              );
              setScenes((items) => [...items, scene]);
            }}
          />
        </div>
        {adapting ? (
          <AdaptChapterForm
            data={data}
            scenes={scenes}
            dirty={dirty.length > 0}
          />
        ) : null}
      </div>
    </>
  );
}
export function ChapterEditorPage() {
  const { chapterId = "" } = useParams();
  const load = useResource(
    useCallback(
      (s: AbortSignal) => manuscriptApi.chapter(chapterId, s),
      [chapterId],
    ),
  );
  return (
    <section className="wide">
      <ResourceState
        loading={load.loading}
        error={load.error}
        retry={load.reload}
      />
      {load.data ? <ChapterEditor key={chapterId} data={load.data} /> : null}
    </section>
  );
}
