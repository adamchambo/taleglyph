import { useCallback } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useResource } from "../../../hooks/useResource";
import { ResourceState } from "../../../components/ui/ResourceState";
import { manuscriptApi } from "../api/manuscriptApi";
export function ChapterEditorPage() {
  const { chapterId = "" } = useParams();
  const load = useResource(
    useCallback(
      (signal: AbortSignal) => manuscriptApi.chapter(chapterId, signal),
      [chapterId],
    ),
  );
  return (
    <>
      <ResourceState
        loading={load.loading}
        error={load.error}
        retry={load.reload}
      />
      {load.data && (
        <Navigate
          replace
          to={`/spaces/${load.data.novel.spaceId}/novels/${load.data.novel.id}?heading=${chapterId}`}
        />
      )}
    </>
  );
}
