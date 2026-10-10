import { Button } from "../../../components/ui/Button";
import type { HeadingKind } from "../manuscript/document";

export type OutlineEntry = {
  id: string;
  kind: HeadingKind;
  title: string;
  summary: string;
  sourceArcId: string | null;
  /** Words from this heading to the next heading of equal or higher level. */
  words: number;
};

/** Table of contents built from headings only; shown beside both views. */
export function ManuscriptContents({
  entries,
  currentId,
  onOpen,
  onAdd,
}: {
  entries: OutlineEntry[];
  currentId: string | null;
  onOpen: (id: string) => void;
  onAdd: (kind: HeadingKind) => void;
}) {
  return (
    <nav className="manuscript-contents" aria-label="Contents">
      <h2 className="manuscript-contents-title">Contents</h2>
      {entries.length ? (
        <ul className="manuscript-contents-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              {entry.kind === "part" ? (
                <button
                  type="button"
                  className="contents-part"
                  aria-current={currentId === entry.id ? "true" : undefined}
                  onClick={() => onOpen(entry.id)}
                >
                  {entry.title || "Untitled part"}
                </button>
              ) : (
                <button
                  type="button"
                  className="contents-chapter"
                  aria-current={currentId === entry.id ? "true" : undefined}
                  onClick={() => onOpen(entry.id)}
                >
                  <span className="contents-title">
                    {entry.title || "Untitled chapter"}
                  </span>
                  <span className="contents-words">
                    {entry.words.toLocaleString()}
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted contents-empty">No chapters yet.</p>
      )}
      <div className="contents-add">
        <Button variant="secondary" onClick={() => onAdd("chapter")}>
          + Chapter
        </Button>
        <Button variant="secondary" onClick={() => onAdd("part")}>
          + Part
        </Button>
      </div>
    </nav>
  );
}
