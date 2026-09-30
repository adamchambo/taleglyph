import { useState } from "react";
import { Link } from "react-router-dom";
import type { Source } from "../types";
import { Button } from "../../../components/ui/Button";
export function SourcePanel({
  source,
  onReview,
  onRefresh,
  busy,
}: {
  source: Source | null;
  onReview: () => void;
  onRefresh: () => void;
  busy: boolean;
}) {
  const [original, setOriginal] = useState(false);
  if (!source)
    return (
      <aside className="source-pane">
        <h2>Source</h2>
        <p>This page has no linked scene.</p>
      </aside>
    );
  return (
    <aside className="source-pane">
      <p className="eyebrow">Linked manuscript</p>
      <h2>{source.chapterTitle}</h2>
      <Link to={`/chapters/${source.chapterId}`}>Open chapter ↗</Link>
      {source.needsReview ? (
        <div className="notice">
          <strong>Source changed</strong>
          <p>
            The novel has a newer revision. Your comic has been kept as you left
            it.
          </p>
          <Button disabled={busy} onClick={onReview}>
            Mark source reviewed
          </Button>
        </div>
      ) : (
        <p className="source-status">
          ✓ Source reviewed through revision {source.currentRevision}
        </p>
      )}
      <div className="segmented" aria-label="Source version">
        <button aria-pressed={!original} onClick={() => setOriginal(false)}>
          Current
        </button>
        <button aria-pressed={original} onClick={() => setOriginal(true)}>
          As adapted
        </button>
      </div>
      <h3>{original ? source.originalTitle : source.currentTitle}</h3>
      <small>
        Revision {original ? source.sourceRevision : source.currentRevision}
      </small>
      <div className="source-prose">
        {(original ? source.originalProse : source.currentProse) ||
          "This scene has no prose yet."}
      </div>
      <button className="text-button" onClick={onRefresh} disabled={busy}>
        Check for source changes
      </button>
    </aside>
  );
}
