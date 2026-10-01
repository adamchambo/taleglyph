import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { ResourceState } from "../../../components/ui/ResourceState";
import { TitleForm } from "../../../components/ui/TitleForm";
import { manuscriptApi } from "../api/manuscriptApi";
export function NovelChapterPage() {
  const { storyId = "", novelId = "" } = useParams();
  const navigate = useNavigate();
  const load = useResource(
    useCallback(
      (signal: AbortSignal) => manuscriptApi.novel(novelId, signal),
      [novelId],
    ),
  );
  return (
    <section>
      <Link to={`/stories/${storyId}/novel`}>← Novels</Link>
      <ResourceState
        loading={load.loading}
        error={load.error}
        retry={load.reload}
      />
      {load.data ? (
        <>
          <p className="eyebrow">Novel</p>
          <h1>{load.data.novel.title}</h1>
          <h2>Chapters</h2>
          {load.data.chapters.map((chapter) => (
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
          {!load.data.chapters.length ? (
            <p>This novel has no chapters yet.</p>
          ) : null}
          <TitleForm
            label="Chapter title"
            action="Add chapter"
            onCreate={async (title) => {
              const chapter = await manuscriptApi.createChapter(novelId, title);
              navigate(`/chapters/${chapter.id}`);
            }}
          />
        </>
      ) : null}
    </section>
  );
}
