import { useEffect, useMemo, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import type { Node as ProseNode } from "@tiptap/pm/model";
import { Selection } from "@tiptap/pm/state";
import {
  appearanceOf,
  assignArc,
  fontFamily,
  heading,
  insertChapter,
  moveSection,
  paragraph,
  renameHeading,
  summarizeHeading,
  type HeadingKind,
  type Manuscript,
  type ManuscriptFont,
} from "../manuscript/document";
import type { Arc } from "../../library/types";
import { FormattingToolbar } from "./FormattingToolbar";
import { ManuscriptContents, type OutlineEntry } from "./ManuscriptContents";
import { ManuscriptPlan } from "./ManuscriptPlan";
import { manuscriptExtensions } from "./manuscriptExtensions";
import {
  Pagination,
  type PaginationInfo,
  type PaginationStorage,
} from "./Pagination";

export type ManuscriptChrome = {
  page: number;
  pages: number;
  words: number;
  chapterWords: number | null;
};

export type PageControls = {
  goToPage: (page: number) => void;
};

type Summary = {
  entries: OutlineEntry[];
  /** Last heading at or before the cursor. */
  currentId: string | null;
  /** Words in the chapter holding the cursor; null under a bare part heading. */
  chapterWords: number | null;
  totalWords: number;
  font: string;
  fontSize: string;
};

const emptySummary: Summary = {
  entries: [],
  currentId: null,
  chapterWords: null,
  totalWords: 0,
  font: "georgia",
  fontSize: "12",
};

function countWords(node: ProseNode) {
  const text = node.textBetween(0, node.content.size, " ", " ");
  return text.match(/\S+/g)?.length ?? 0;
}

/**
 * Everything the Contents list and page bar need, derived from the live
 * ProseMirror state. useEditorState deep-compares the result, so typing only
 * re-renders this component when a count, title or cursor section changes.
 */
function summarise(editor: Editor): Summary {
  const { doc, selection } = editor.state;
  const entries: OutlineEntry[] = [];
  // Sections still accumulating words: a heading closes every open section of
  // equal or deeper level, so a chapter's words also count toward its part.
  const open: { index: number; level: number }[] = [];
  let current = -1;
  let totalWords = 0;
  doc.forEach((node, pos) => {
    const words = countWords(node);
    totalWords += words;
    if (node.type.name === "heading") {
      const level = Number(node.attrs.level);
      while (open.length && open[open.length - 1].level >= level) open.pop();
      entries.push({
        id: String(node.attrs.id),
        kind: level === 1 ? "part" : "chapter",
        title: node.textContent,
        summary: String(node.attrs.summary ?? ""),
        sourceArcId: (node.attrs.sourceArcId as string | null) ?? null,
        words: 0,
      });
      open.push({ index: entries.length - 1, level });
      if (pos <= selection.from) current = entries.length - 1;
    }
    for (const section of open) entries[section.index].words += words;
  });
  const active = current >= 0 ? entries[current] : null;
  const look = appearanceOf({
    type: "doc",
    attrs: editor.state.doc.attrs,
    content: [],
  });
  return {
    entries,
    currentId: active?.id ?? null,
    chapterWords: active?.kind === "chapter" ? active.words : null,
    totalWords,
    font: look.font,
    fontSize: look.size,
  };
}

function paginationOf(editor: Editor) {
  return (editor.storage as unknown as { pagination: PaginationStorage })
    .pagination;
}

/** How long after a jump to keep re-aligning while pagination settles. */
const SETTLE_MS = 1000;

type Latest = {
  onChange: (doc: Manuscript) => void;
  onPaginate: (info: PaginationInfo) => void;
  stepPage: (delta: number) => void;
  openHeading: (id: string) => void;
};

export function ManuscriptEditor({
  initial,
  onChange,
  arcs,
  targetId,
  view,
  onViewChange,
  onChrome,
  controlsRef,
}: {
  initial: Manuscript;
  onChange: (doc: Manuscript) => void;
  arcs: Arc[];
  targetId: string;
  view: "write" | "plan";
  onViewChange: (v: "write" | "plan") => void;
  onChrome?: (chrome: ManuscriptChrome) => void;
  controlsRef?: { current: PageControls | null };
}) {
  // The editor's callbacks are created once; they reach current props and
  // state through this ref, which is refreshed after every render.
  const latest = useRef<Latest | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  // After a jump, pagination may still shift the layout; re-align until then.
  const settle = useRef<{ id: string; until: number } | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const extensions = useMemo(
    () => [
      ...manuscriptExtensions,
      Pagination.configure({
        onPaginate: (info) => latest.current?.onPaginate(info),
      }),
    ],
    [],
  );

  // A fresh object every render makes TipTap call setOptions, which rebinds
  // the editor DOM and cancels a held key after one character.
  const editorProps = useMemo(
    () => ({
      attributes: {
        "aria-label": "Novel manuscript",
        role: "textbox",
        "aria-multiline": "true",
      },
      handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
        if (event.key !== "PageUp" && event.key !== "PageDown") return false;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
          return false;
        latest.current?.stepPage(event.key === "PageDown" ? 1 : -1);
        return true;
      },
    }),
    [],
  );

  const editor = useEditor({
    extensions,
    content: initial,
    editorProps,
    onUpdate: ({ editor }) =>
      latest.current?.onChange(editor.getJSON() as Manuscript),
    onFocus: () => {
      touched.current = true;
    },
  });

  const summary =
    useEditorState({
      editor,
      selector: ({ editor }) => (editor ? summarise(editor) : emptySummary),
    }) ?? emptySummary;

  function findHeading(id: string) {
    let found = -1;
    editor?.state.doc.forEach((node, pos) => {
      if (found < 0 && node.type.name === "heading" && node.attrs.id === id)
        found = pos;
    });
    return found;
  }

  function placeCursor(pos: number) {
    editor
      ?.chain()
      .focus(null, { scrollIntoView: false })
      .command(({ tr }) => {
        tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
        return true;
      })
      .run();
  }

  function scrollBlockToTop(pos: number) {
    requestAnimationFrame(() => {
      if (!editor || editor.isDestroyed) return;
      const dom = editor.view.nodeDOM(pos);
      if (dom instanceof HTMLElement) dom.scrollIntoView({ block: "start" });
    });
  }

  function openHeading(id: string) {
    const pos = findHeading(id);
    if (!editor || pos < 0) return;
    if (view !== "write") onViewChange("write");
    settle.current = { id, until: Date.now() + SETTLE_MS };
    placeCursor(pos);
    scrollBlockToTop(pos);
  }

  function goToPage(n: number) {
    if (!editor) return;
    if (view !== "write") onViewChange("write");
    const { starts } = paginationOf(editor);
    const target = Math.min(Math.max(1, Math.round(n)), starts.length);
    const pos = starts[target - 1] ?? 0;
    settle.current = null;
    placeCursor(pos);
    scrollBlockToTop(pos);
    setPage(target);
  }

  function addHeading(kind: HeadingKind) {
    if (!editor) return;
    const { doc, selection } = editor.state;
    // Insert after the top-level block holding the cursor; before the editor
    // has ever had focus there is no meaningful cursor, so append instead.
    let pos = doc.content.size;
    if (touched.current) {
      let found = false;
      doc.forEach((node, offset) => {
        const end = offset + node.nodeSize;
        if (!found && selection.to <= end) {
          found = true;
          pos = end;
        }
      });
    }
    const id = crypto.randomUUID();
    if (view !== "write") onViewChange("write");
    settle.current = { id, until: Date.now() + SETTLE_MS };
    editor
      .chain()
      .insertContentAt(pos, [heading(kind, "", id), paragraph()])
      .setTextSelection(pos + 1)
      .focus(null, { scrollIntoView: false })
      .run();
    scrollBlockToTop(pos);
  }

  function replace(next: Manuscript) {
    editor?.commands.setContent(next);
  }
  const currentDoc = () => editor?.getJSON() as Manuscript;

  const shownPage = Math.min(page, pages);

  useEffect(() => {
    onChrome?.({
      page: shownPage,
      pages,
      words: summary.totalWords,
      chapterWords: summary.chapterWords,
    });
  }, [onChrome, shownPage, pages, summary.totalWords, summary.chapterWords]);

  useEffect(() => {
    if (controlsRef) controlsRef.current = { goToPage };
  });

  useEffect(() => {
    latest.current = {
      onChange,
      onPaginate: (info) => {
        setPages(info.pages);
        if (editor)
          setPage(paginationOf(editor).pageAt(editor.state.selection.from));
        const pending = settle.current;
        if (pending && Date.now() < pending.until) {
          const pos = findHeading(pending.id);
          if (pos >= 0) scrollBlockToTop(pos);
        }
      },
      stepPage: (delta) => goToPage(shownPage + delta),
      openHeading,
    };
  });

  // Follow the cursor between pages.
  useEffect(() => {
    if (!editor) return;
    const sync = () =>
      setPage(paginationOf(editor).pageAt(editor.state.selection.from));
    editor.on("selectionUpdate", sync);
    return () => {
      editor.off("selectionUpdate", sync);
    };
  }, [editor]);

  // Follow the scroll position between pages.
  useEffect(() => {
    if (view !== "write") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const breaks = paperRef.current?.querySelectorAll<HTMLElement>(
        ".manuscript-page-break[data-page]",
      );
      if (!breaks) return;
      const middle = window.innerHeight / 2;
      let current = 1;
      breaks.forEach((el) => {
        if (el.getBoundingClientRect().top < middle)
          current = Number(el.dataset.page) + 1;
      });
      setPage(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Scroll events do not bubble; capturing on window also catches whichever
    // ancestor is the scroll container.
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      if (frame) cancelAnimationFrame(frame);
    };
  }, [view]);

  // A hidden editor measures as zero-height, which collapses the pagination.
  // A no-op transaction when the editor reappears makes it measure again.
  useEffect(() => {
    if (!editor?.isInitialized || view !== "write") return;
    editor.view.dispatch(editor.state.tr.setMeta("addToHistory", false));
  }, [editor, view]);

  useEffect(() => {
    if (editor && targetId) latest.current?.openHeading(targetId);
  }, [editor, targetId]);

  return (
    <div className="manuscript-layout">
      <ManuscriptContents
        entries={summary.entries}
        currentId={summary.currentId}
        onOpen={openHeading}
        onAdd={addHeading}
      />
      <div className="manuscript-view">
        <div className="manuscript-write" hidden={view !== "write"}>
          <FormattingToolbar editor={editor} />
          <div className="manuscript-canvas">
            <div
              className="manuscript-paper"
              ref={paperRef}
              style={{
                fontFamily: fontFamily(summary.font as ManuscriptFont),
                fontSize: `${summary.fontSize}pt`,
              }}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
        {view === "plan" && (
          <ManuscriptPlan
            entries={summary.entries}
            arcs={arcs}
            onRename={(id, title) =>
              replace(renameHeading(currentDoc(), id, title))
            }
            onSummarize={(id, text) =>
              replace(summarizeHeading(currentDoc(), id, text))
            }
            onMove={(id, beforeId) =>
              replace(moveSection(currentDoc(), id, beforeId))
            }
            onOpen={openHeading}
            onAssign={(id, arcId) =>
              replace(assignArc(currentDoc(), id, arcId))
            }
            onAddChapter={(arcId) =>
              replace(insertChapter(currentDoc(), arcId))
            }
          />
        )}
      </div>
    </div>
  );
}
