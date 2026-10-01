import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { ResourceState } from "../../../components/ui/ResourceState";
import { TitleForm } from "../../../components/ui/TitleForm";
import { manuscriptApi } from "../api/manuscriptApi";
import { comicApi } from "../../comics/api/comicApi";
export function StoryDetailPage() {
  const { storyId = "" } = useParams();
  const navigate = useNavigate();
  const load = useResource(
    useCallback(
      async (s: AbortSignal) => {
        const [story, chapters, comics] = await Promise.all([
          manuscriptApi.story(storyId, s),
          manuscriptApi.chapters(storyId, s),
          comicApi.list(storyId, s),
        ]);
        return { story, chapters, comics };
      },
      [storyId],
    ),
  );
  return (
    <section>
      <Link to={`/stories/${storyId}`}>← Story home</Link>
      <ResourceState
        loading={load.loading}
        error={load.error}
        retry={load.reload}
      />
      {load.data ? (
        <>
          <p className="eyebrow">Manuscript</p>
          <h1>{load.data.story.title}</h1>
          <div className="split">
            <div>
              <h2>Chapters</h2>
              {load.data.chapters.map((c) => (
                <Link
                  className="chapter-row"
                  key={c.id}
                  to={`/chapters/${c.id}`}
                >
                  <span>{String(c.order).padStart(2, "0")}</span>
                  <strong>{c.title}</strong>
                  <span>→</span>
                </Link>
              ))}
              {!load.data.chapters.length ? (
                <p>Your first chapter starts here.</p>
              ) : null}
              <TitleForm
                label="Chapter title"
                action="Add chapter"
                onCreate={async (title) => {
                  const chapter = await manuscriptApi.createChapter(
                    storyId,
                    title,
                  );
                  navigate(`/chapters/${chapter.id}`);
                }}
              />
            </div>
            <aside className="card">
              <h2>Comic adaptations</h2>
              <p>Each adaptation stays connected to its original scenes.</p>
              {load.data.comics.map((c) => (
                <Link className="chapter-row" key={c.id} to={`/comics/${c.id}`}>
                  {c.title} →
                </Link>
              ))}
              {!load.data.comics.length ? (
                <p>Open a chapter and choose “Adapt to comic”.</p>
              ) : null}
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}
