import { Navigate, useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { ResourceState } from "../../../components/ui/ResourceState";
import { storyPath } from "../types";
export function LegacyStoryRedirect() {
  const { storyId = "" } = useParams();
  const { library, loading, error, refresh } = useWorkspace();
  if (!library)
    return <ResourceState loading={loading} error={error} retry={refresh} />;
  const story = library.stories.find((s) => s.id === storyId);
  return <Navigate to={story ? storyPath(story) : "/library"} replace />;
}
