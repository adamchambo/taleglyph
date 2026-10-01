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
import { ChapterEditorPage } from "../features/stories/pages/ChapterEditorPage";
import { ComicWorkspacePage } from "../features/comics/pages/ComicWorkspacePage";
import { LibraryPage } from "../features/library/pages/LibraryPage";
import { StoryDashboard } from "../features/library/pages/StoryDashboard";
import { StorySetupPage } from "../features/library/pages/StorySetupPage";
import { StorySectionPage } from "../features/library/pages/StorySectionPage";
import { AppearancePage } from "../features/library/pages/AppearancePage";
export const router = createBrowserRouter([
  {
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <Navigate to="/library" replace /> },
      { path: "worlds", element: <WorldOverviewPage /> },
      { path: "worlds/:worldId", element: <WorldDetailPage /> },
      { path: "characters/:characterId", element: <CharacterDetailPage /> },
      { path: "stories", element: <ManuscriptPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "appearance", element: <AppearancePage /> },
      { path: "stories/new", element: <StorySetupPage /> },
      { path: "stories/:storyId", element: <StoryDashboard /> },
      {
        path: "stories/:storyId/settings",
        element: <StorySetupPage editing />,
      },
      ...(
        [
          "notes",
          "characters",
          "world",
          "plan",
          "novel",
          "comic",
          "assets",
        ] as const
      ).map((section) => ({
        path: `stories/:storyId/${section}`,
        element: <StorySectionPage section={section} />,
      })),
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
