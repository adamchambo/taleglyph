import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../../../lib/apiClient";
import { manuscriptApi } from "../api/manuscriptApi";
import type { Manuscript } from "../manuscript/document";

export const AUTOSAVE_DELAY_MS = 1500;
export const CONFLICT_MESSAGE =
  "Someone else changed this manuscript. Reload to continue.";

export type AutosaveStatus =
  | { kind: "saved" }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "error"; message: string }
  | { kind: "conflict"; message: string };

/**
 * Debounced, single-flight autosave for a novel manuscript.
 *
 * - `serverJson` is what the server currently stores (null for a never-saved
 *   novel). It is the optimistic-concurrency token sent with every save.
 * - `initialJson` is what the editor starts with. When `serverJson` is null
 *   the editor shows a legacy-imported document that is not persisted, so the
 *   dirty baseline is `initialJson`, not an empty document.
 *
 * All mutable control state lives in refs so `flush` is stable and the save
 * loop never reads stale closures; React state only mirrors what the UI shows.
 */
export function useManuscriptAutosave({
  novelId,
  serverJson,
  initialJson,
}: {
  novelId: string;
  serverJson: string | null;
  initialJson: string;
}) {
  const [baselineInitial] = useState(initialJson);
  const [saved, setSaved] = useState(serverJson);
  const [draft, setDraft] = useState(initialJson);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);

  const savedRef = useRef(serverJson);
  const draftRef = useRef(initialJson);
  const initialRef = useRef(initialJson);
  const inFlight = useRef(false);
  const queued = useRef(false);
  const conflicted = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const isDirty = useCallback(
    () => draftRef.current !== (savedRef.current ?? initialRef.current),
    [],
  );

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    if (conflicted.current) return;
    if (inFlight.current) {
      // Never two saves at once: remember that another is wanted and let the
      // running save pick it up when it resolves.
      queued.current = true;
      return;
    }
    inFlight.current = true;
    try {
      do {
        queued.current = false;
        if (!isDirty()) break;
        const json = draftRef.current;
        setSaving(true);
        setError(null);
        try {
          await manuscriptApi.saveDocument(novelId, json, savedRef.current);
          savedRef.current = json;
          setSaved(json);
        } catch (e) {
          queued.current = false;
          if (e instanceof ApiError && e.status === 409) {
            conflicted.current = true;
            setConflict(true);
          } else {
            setError(
              e instanceof Error ? e.message : "Unable to save manuscript.",
            );
          }
          break;
        } finally {
          setSaving(false);
        }
      } while (queued.current);
    } finally {
      inFlight.current = false;
    }
  }, [novelId, isDirty]);

  const setDocument = useCallback(
    (doc: Manuscript) => {
      const json = JSON.stringify(doc);
      draftRef.current = json;
      setDraft(json);
      window.clearTimeout(timer.current);
      if (conflicted.current || !isDirty()) return;
      timer.current = window.setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
    },
    [flush, isDirty],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void flush();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer.current);
    };
  }, [flush]);

  const dirty = draft !== (saved ?? baselineInitial);
  const status: AutosaveStatus = conflict
    ? { kind: "conflict", message: CONFLICT_MESSAGE }
    : error
      ? { kind: "error", message: error }
      : saving
        ? { kind: "saving" }
        : dirty
          ? { kind: "dirty" }
          : { kind: "saved" };

  return { setDocument, status, dirty, retry: flush };
}
