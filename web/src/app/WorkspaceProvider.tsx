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
const uuid = "[a-f0-9-]{36}";
const recentLabels: [RegExp, string][] = [
  [new RegExp(`^/spaces/${uuid}/stories/${uuid}$`), "Story"],
  [new RegExp(`^/spaces/${uuid}/novels/${uuid}$`), "Novel"],
  [new RegExp(`^/chapters/${uuid}$`), "Chapter editor"],
  [new RegExp(`^/comics/${uuid}$`), "Comic editor"],
  [
    new RegExp(
      `^/spaces/${uuid}/(stories|works|world|characters|notes|timeline|assets)$`,
    ),
    "",
  ],
];
const sectionLabels: Record<string, string> = {
  stories: "Stories",
  works: "Novels & comics",
  world: "World",
  characters: "Characters",
  notes: "Notes",
  timeline: "Timeline",
  assets: "Assets",
};
function recentLabel(path: string) {
  const match = recentLabels.find(([pattern]) => pattern.test(path));
  if (!match) return null;
  return match[1] || sectionLabels[path.split("/").at(-1)!];
}
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
    spaceId: string;
  } | null>(null);
  const spaceMatch = location.pathname.match(
    new RegExp(`^/(?:spaces|worlds)/(${uuid})(?:/stories/(${uuid}))?`),
  );
  const direct =
    spaceMatch?.[1] ?? new URLSearchParams(location.search).get("space");
  const work = location.pathname.match(
    new RegExp(`^/(chapters|comics)/(${uuid})$`),
  );
  const workKey = work
    ? `${work[1] === "chapters" ? "chapter" : "comic"}/${work[2]}`
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
    if (!workKey) return;
    const controller = new AbortController();
    const [kind, id] = workKey.split("/");
    libraryApi
      .context(kind, id, controller.signal)
      .then((result) => setResolved({ key: workKey, spaceId: result.spaceId }))
      .catch(() => {});
    return () => controller.abort();
  }, [workKey]);
  const spaceId =
    direct ?? (resolved?.key === workKey ? resolved.spaceId : null);
  const space = library?.spaces.find((s) => s.id === spaceId) ?? null;
  const story =
    library?.stories.find(
      (s) => s.id === spaceMatch?.[2] && s.spaceId === space?.id,
    ) ?? null;
  const activeSpaceId = space?.id;
  useEffect(() => {
    const label = recentLabel(location.pathname);
    if (!activeSpaceId || !label) return;
    const entry = {
      path: location.pathname + location.search,
      label,
      visitedAt: new Date().toISOString(),
    };
    setRecent((current) => {
      const next = { ...current, [activeSpaceId]: entry };
      writePreference("recent", next);
      return next;
    });
  }, [activeSpaceId, location.pathname, location.search]);
  function upsert(value: StoryCard) {
    setLibrary((current) =>
      current
        ? {
            ...current,
            stories: [
              value,
              ...current.stories.filter((s) => s.id !== value.id),
            ],
          }
        : current,
    );
  }
  function setNav(value: NavigationMode) {
    setNavState(value);
    writePreference("navigation", value);
  }
  return (
    <WorkspaceContext.Provider
      value={{
        library,
        space,
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
