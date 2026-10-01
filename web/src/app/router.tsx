import { createBrowserRouter, Navigate } from "react-router-dom";
import { WorkspaceLayout } from "../layouts/WorkspaceLayout";
import { WorldDetailPage } from "../features/world/pages/WorldDetailPage";
import { CharacterDetailPage } from "../features/world/pages/CharacterDetailPage";
import { AssetLibraryPage } from "../features/assets/pages/AssetLibraryPage";
import { ExplorePage } from "../features/explore/pages/ExplorePage";
import { NotesPage } from "../features/notes/pages/NotesPage";
import { ChapterEditorPage } from "../features/stories/pages/ChapterEditorPage";
import { NovelPage } from "../features/stories/pages/NovelPage";
import { ComicWorkspacePage } from "../features/comics/pages/ComicWorkspacePage";
import { LibraryPage } from "../features/library/pages/LibraryPage";
import { SpaceHomePage } from "../features/library/pages/SpaceHomePage";
import { SpaceSetupPage } from "../features/library/pages/SpaceSetupPage";
import { SpaceSettingsPage } from "../features/library/pages/SpaceSettingsPage";
import { SpaceStoriesPage } from "../features/library/pages/SpaceStoriesPage";
import { SpaceSectionPage } from "../features/library/pages/SpaceSectionPage";
import { StoryPage } from "../features/library/pages/StoryPage";
import { StorySetupPage } from "../features/library/pages/StorySetupPage";
import { WorksPage } from "../features/library/pages/WorksPage";
import { LegacyStoryRedirect } from "../features/library/pages/LegacyStoryRedirect";
import { AppearancePage } from "../features/library/pages/AppearancePage";
export const router = createBrowserRouter([
  {
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <Navigate to="/library" replace /> },
      { path: "library", element: <LibraryPage /> },
      { path: "appearance", element: <AppearancePage /> },
      { path: "spaces/new", element: <SpaceSetupPage /> },
      { path: "spaces/:spaceId", element: <SpaceHomePage /> },
      { path: "spaces/:spaceId/settings", element: <SpaceSettingsPage /> },
      { path: "spaces/:spaceId/stories", element: <SpaceStoriesPage /> },
      { path: "spaces/:spaceId/stories/new", element: <StorySetupPage /> },
      { path: "spaces/:spaceId/stories/:storyId", element: <StoryPage /> },
      {
        path: "spaces/:spaceId/stories/:storyId/settings",
        element: <StorySetupPage editing />,
      },
      {
        path: "spaces/:spaceId/novels",
        element: <WorksPage kind="novel" />,
      },
      {
        path: "spaces/:spaceId/graphic-novels",
        element: <WorksPage kind="comic" />,
      },
      {
        path: "spaces/:spaceId/works",
        element: <Navigate to="../novels" relative="path" replace />,
      },
      { path: "spaces/:spaceId/novels/:novelId", element: <NovelPage /> },
      { path: "spaces/:spaceId/notes", element: <NotesPage /> },
      ...(["world", "characters", "timeline", "assets"] as const).map(
        (section) => ({
          path: `spaces/:spaceId/${section}`,
          element: <SpaceSectionPage section={section} />,
        }),
      ),
      { path: "stories/:storyId/*", element: <LegacyStoryRedirect /> },
      { path: "worlds", element: <Navigate to="/library" replace /> },
      { path: "worlds/:worldId", element: <WorldDetailPage /> },
      { path: "characters/:characterId", element: <CharacterDetailPage /> },
      { path: "chapters/:chapterId", element: <ChapterEditorPage /> },
      { path: "comics/:comicId", element: <ComicWorkspacePage /> },
      { path: "assets", element: <AssetLibraryPage /> },
      { path: "explore", element: <ExplorePage /> },
      {
        path: "*",
        element: (
          <section>
            <h1>Page not found</h1>
            <a href="/library">Return to your library</a>
          </section>
        ),
      },
    ],
  },
]);
