import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { libraryApi } from "../features/library/api/libraryApi";
import type { LibrarySnapshot, StoryCard } from "../features/library/types";
import {
  WorkspaceContext,
  type NavigationMode,
  type RecentWork,
} from "./workspaceContext";
import { readPreference, writePreference } from "../lib/preferences";
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [library, setLibrary] = useState<LibrarySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nav, setNavState] = useState<NavigationMode>(() => {
    const n = readPreference<string>("navigation", "rail");
    return n === "focus" ? "focus" : "rail";
  });
  const [recent, setRecent] = useState<Record<string, RecentWork>>(() =>
    readPreference("recent", {}),
  );
  const [resolved, setResolved] = useState<{
    key: string;
    storyId: string;
  } | null>(null);
  const direct =
    location.pathname.match(/^\/stories\/([a-f0-9-]{36})(?:\/|$)/)?.[1] ??
    new URLSearchParams(location.search).get("story");
  const legacy = location.pathname.match(
    /^\/(chapters|comics)\/([a-f0-9-]{36})$/,
  );
  const legacyKey = legacy
    ? `${legacy[1] === "chapters" ? "chapter" : "comic"}/${legacy[2]}`
    : "";
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLibrary(await libraryApi.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load your library.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    libraryApi
      .list(abort.signal)
      .then((value) => {
        setLibrary(value);
        setError("");
      })
      .catch((e) => {
        if (!abort.signal.aborted)
          setError(
            e instanceof Error ? e.message : "Unable to load your library.",
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [location.pathname]);
  useEffect(() => {
    if (!legacyKey) return;
    const controller = new AbortController();
    const [kind, id] = legacyKey.split("/");
    libraryApi
      .context(kind, id, controller.signal)
      .then((result) =>
        setResolved({ key: legacyKey, storyId: result.storyId }),
      )
      .catch(() => {});
    return () => controller.abort();
  }, [legacyKey]);
  const storyId =
    direct ?? (resolved?.key === legacyKey ? resolved.storyId : null);
  const story = library?.stories.find((s) => s.id === storyId) ?? null;
  const activeStoryId = story?.id;
  useEffect(() => {
    if (
      !activeStoryId ||
      (!legacyKey &&
        !/\/(novel|comic|characters|assets|plan|world|notes)$/.test(
          location.pathname,
        ))
    )
      return;
    const label = legacyKey.startsWith("chapter")
      ? "Chapter editor"
      : legacyKey.startsWith("comic")
        ? "Comic editor"
        : location.pathname.split("/").at(-1)!;
    const entry = {
      path: location.pathname + location.search,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      visitedAt: new Date().toISOString(),
    };
    setRecent((current) => {
      const next = { ...current, [activeStoryId]: entry };
      writePreference("recent", next);
      return next;
    });
  }, [activeStoryId, legacyKey, location.pathname, location.search]);
  function upsert(value: StoryCard) {
    setLibrary((current) => {
      if (!current)
        return {
          stories: [value],
          spaces: [
            { id: value.spaceId, name: value.spaceName, description: "" },
          ],
          series: [],
        };
      return {
        ...current,
        stories: [value, ...current.stories.filter((s) => s.id !== value.id)],
        spaces: current.spaces.some((s) => s.id === value.spaceId)
          ? current.spaces
          : [
              ...current.spaces,
              { id: value.spaceId, name: value.spaceName, description: "" },
            ],
      };
    });
  }
  function setNav(value: NavigationMode) {
    setNavState(value);
    writePreference("navigation", value);
  }
  return (
    <WorkspaceContext.Provider
      value={{
        library,
        story,
        loading,
        error,
        refresh,
        upsert,
        nav,
        setNav,
        recent,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
