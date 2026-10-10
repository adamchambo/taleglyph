import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { Input, Textarea } from "../../../components/ui/Input";
import type { Arc } from "../../library/types";
import type { OutlineEntry } from "./ManuscriptContents";

type Drag = {
  start: number;
  end: number;
  dest: number;
  pointerId: number;
  startY: number;
  /** boundaries[j] is the top of row j relative to the list; the last entry is the list's bottom. */
  boundaries: number[];
  slots: number[];
};

/** A part drags with its chapters, so a unit is the row range [start, end). */
function sectionEnd(entries: OutlineEntry[], start: number) {
  let end = start + 1;
  if (entries[start].kind === "part") {
    while (end < entries.length && entries[end].kind === "chapter") end++;
  }
  return end;
}

/**
 * Insertion points (row indices; entries.length means the end) a unit may drop
 * at. Chapters may land anywhere, including under a different part; parts only
 * land on part boundaries. start and end are the no-op slots.
 */
function slotsFor(entries: OutlineEntry[], start: number, end: number) {
  const slots: number[] = [];
  const movingPart = entries[start].kind === "part";
  for (let j = 0; j <= entries.length; j++) {
    if (j === start || j === end) slots.push(j);
    else if (j < start || j > end) {
      if (!movingPart || j === entries.length || entries[j].kind === "part")
        slots.push(j);
    }
  }
  return slots;
}

/** Chapter planning: rename, summarise and reorder sections of the manuscript. */
export function ManuscriptPlan({
  entries,
  arcs,
  onRename,
  onSummarize,
  onMove,
  onOpen,
  onAddArc,
}: {
  entries: OutlineEntry[];
  arcs: Arc[];
  onRename: (id: string, title: string) => void;
  onSummarize: (id: string, summary: string) => void;
  /** beforeId null moves the section to the end of the document. */
  onMove: (id: string, beforeId: string | null) => void;
  onOpen: (id: string) => void;
  onAddArc: (arc: Arc) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const gesture = useRef<Drag | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  function commit(start: number, dest: number) {
    const end = sectionEnd(entries, start);
    if (dest >= start && dest <= end) return;
    onMove(entries[start].id, dest < entries.length ? entries[dest].id : null);
  }

  function cancel() {
    gesture.current = null;
    setDrag(null);
  }

  function begin(event: PointerEvent<HTMLButtonElement>, index: number) {
    const list = listRef.current;
    if (event.button !== 0 || !list || entries.length < 2) return;
    const listTop = list.getBoundingClientRect().top;
    const rects = [...list.querySelectorAll<HTMLLIElement>(":scope > li")].map(
      (row) => row.getBoundingClientRect(),
    );
    const boundaries = rects.map((rect) => rect.top - listTop);
    boundaries.push(rects[rects.length - 1].bottom - listTop);
    const end = sectionEnd(entries, index);
    const next: Drag = {
      start: index,
      end,
      dest: index,
      pointerId: event.pointerId,
      startY: event.clientY,
      boundaries,
      slots: slotsFor(entries, index, end),
    };
    gesture.current = next;
    setDrag(next);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || event.pointerId !== current.pointerId) return;
    const { boundaries, start, end } = current;
    const unitHeight = boundaries[end] - boundaries[start];
    const unitTop = boundaries[start] + (event.clientY - current.startY);
    // Pick the slot whose resulting top edge is closest to where the dragged
    // unit currently sits, so feedback tracks the unit, not the pointer.
    let dest = start;
    let best = Infinity;
    for (const j of current.slots) {
      const top =
        j > end
          ? boundaries[j] - unitHeight
          : j < start
            ? boundaries[j]
            : boundaries[start];
      const distance = Math.abs(top - unitTop);
      if (distance < best) {
        best = distance;
        dest = j;
      }
    }
    if (dest === current.dest) return;
    const next = { ...current, dest };
    gesture.current = next;
    setDrag(next);
  }

  function release(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || event.pointerId !== current.pointerId) return;
    cancel();
    commit(current.start, current.dest);
  }

  function keys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") return cancel();
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const end = sectionEnd(entries, index);
    const slots = slotsFor(entries, index, end);
    const dest =
      event.key === "ArrowUp"
        ? slots.filter((j) => j < index).pop()
        : slots.find((j) => j > end);
    if (dest !== undefined) commit(index, dest);
  }

  function offset(index: number) {
    if (!drag) return 0;
    const { start, end, dest, boundaries } = drag;
    const unitHeight = boundaries[end] - boundaries[start];
    if (index >= start && index < end) {
      if (dest > end) return boundaries[dest] - boundaries[end];
      if (dest < start) return boundaries[dest] - boundaries[start];
      return 0;
    }
    if (dest > end && index >= end && index < dest) return -unitHeight;
    if (dest < start && index >= dest && index < start) return unitHeight;
    return 0;
  }

  const used = new Set(entries.map((entry) => entry.sourceArcId));
  const suggestions = arcs.filter((arc) => !used.has(arc.id));
  let chapterNumber = 0;

  return (
    <section className="manuscript-plan" aria-label="Chapter plan">
      {entries.length ? (
        <ol
          ref={listRef}
          className={drag ? "plan-list is-reordering" : "plan-list"}
        >
          {entries.map((entry, i) => {
            const shift = offset(i);
            const dragging = drag !== null && i >= drag.start && i < drag.end;
            const isPart = entry.kind === "part";
            if (!isPart) chapterNumber++;
            const label = isPart
              ? entry.title || "untitled part"
              : entry.title || `chapter ${chapterNumber}`;
            return (
              <li
                key={entry.id}
                className={[
                  "plan-row",
                  isPart ? "plan-part" : "plan-chapter",
                  dragging ? "is-dragging" : "",
                ]
                  .join(" ")
                  .trim()}
                style={
                  shift ? { transform: `translateY(${shift}px)` } : undefined
                }
              >
                <button
                  type="button"
                  className="arc-grip"
                  aria-label={`Reorder ${label}`}
                  disabled={entries.length < 2 || (drag !== null && !dragging)}
                  onPointerDown={(event) => begin(event, i)}
                  onPointerMove={move}
                  onPointerUp={release}
                  onPointerCancel={cancel}
                  onKeyDown={(event) => keys(event, i)}
                >
                  <Icon name="grip" size={16} />
                </button>
                {isPart ? (
                  <>
                    <span className="plan-kind">Part</span>
                    <Input
                      className="plan-title"
                      aria-label={`Title of ${label}`}
                      placeholder="Part title"
                      value={entry.title}
                      onChange={(e) => onRename(entry.id, e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <span className="arc-number">
                      {String(chapterNumber).padStart(2, "0")}
                    </span>
                    <div className="plan-fields">
                      <Input
                        className="plan-title"
                        aria-label={`Title of ${label}`}
                        placeholder="Chapter title"
                        value={entry.title}
                        onChange={(e) => onRename(entry.id, e.target.value)}
                      />
                      <Textarea
                        className="plan-summary"
                        rows={1}
                        aria-label={`Summary of ${label}`}
                        placeholder="One-line summary"
                        value={entry.summary}
                        onChange={(e) => onSummarize(entry.id, e.target.value)}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      aria-label={`Open ${label}`}
                      onClick={() => onOpen(entry.id)}
                    >
                      Open
                    </Button>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="muted">
          No chapters yet. Add one from Contents, or start from a suggestion
          below.
        </p>
      )}
      {arcs.length ? (
        <details className="plan-suggestions">
          <summary>Suggested from linked arcs</summary>
          {suggestions.length ? (
            <ul>
              {suggestions.map((arc) => (
                <li key={arc.id}>
                  <div>
                    <strong>{arc.title}</strong>
                    {arc.summary ? <p>{arc.summary}</p> : null}
                  </div>
                  <Button variant="secondary" onClick={() => onAddArc(arc)}>
                    Add as chapter
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Every linked arc is already a chapter.</p>
          )}
        </details>
      ) : (
        <p className="field-hint">
          Link stories or arcs in Details to get suggestions.
        </p>
      )}
    </section>
  );
}
