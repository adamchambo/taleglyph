import { createContext, useContext } from "react";
import type { LibrarySnapshot, StoryCard } from "../features/library/types";
export type RecentWork = { path: string; label: string; visitedAt: string };
export type NavigationMode = "expanded" | "rail" | "focus";
export const WorkspaceContext = createContext<{
  library: LibrarySnapshot | null;
  story: StoryCard | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  upsert: (story: StoryCard) => void;
  nav: NavigationMode;
  setNav: (value: NavigationMode) => void;
  recent: Record<string, RecentWork>;
} | null>(null);
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace provider required");
  return value;
}
