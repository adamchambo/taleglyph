import { createBrowserRouter, Navigate } from "react-router-dom";
import { WorkspaceLayout } from "../layouts/WorkspaceLayout";
import { WorldOverviewPage } from "../features/world/pages/WorldOverviewPage";
import { WorldDetailPage } from "../features/world/pages/WorldDetailPage";
import { CharacterDetailPage } from "../features/world/pages/CharacterDetailPage";
import { ManuscriptPage } from "../features/stories/pages/ManuscriptPage";
import { ComicEditorPage } from "../features/comics/pages/ComicEditorPage";
import { AssetLibraryPage } from "../features/assets/pages/AssetLibraryPage";
import { ExplorePage } from "../features/explore/pages/ExplorePage";
import { NotesPage } from "../features/notes/pages/NotesPage";
import { StoryDetailPage } from "../features/stories/pages/StoryDetailPage";
import { ChapterEditorPage } from "../features/stories/pages/ChapterEditorPage";
import { ComicWorkspacePage } from "../features/comics/pages/ComicWorkspacePage";
export const router = createBrowserRouter([
  {
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <Navigate to="/worlds" replace /> },
      { path: "worlds", element: <WorldOverviewPage /> },
      { path: "worlds/:worldId", element: <WorldDetailPage /> },
      { path: "characters/:characterId", element: <CharacterDetailPage /> },
      { path: "stories", element: <ManuscriptPage /> },
      { path: "stories/:storyId", element: <StoryDetailPage /> },
      { path: "chapters/:chapterId", element: <ChapterEditorPage /> },
      { path: "comics/:comicId", element: <ComicWorkspacePage /> },
      { path: "comics", element: <ComicEditorPage /> },
      { path: "assets", element: <AssetLibraryPage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "notes", element: <NotesPage /> },
      {
        path: "*",
        element: (
          <section>
            <h1>Page not found</h1>
            <a href="/worlds">Return to your worlds</a>
          </section>
        ),
      },
    ],
  },
]);
