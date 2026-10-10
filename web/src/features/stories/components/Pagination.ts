import { Extension } from "@tiptap/core";
import type { Node as ProseNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import {
  CONTENT_HEIGHT_PX,
  PAGE_MARGIN_PX,
  paginate,
  type Block,
} from "../manuscript/pagination";

export type PaginationInfo = {
  pages: number;
  /** Document positions of the first block on each page. */
  starts: number[];
};

export type PaginationOptions = {
  onPaginate?: (info: PaginationInfo) => void;
};

export type PaginationStorage = {
  pages: number;
  /** Document positions of the first block on each page. */
  starts: number[];
  /** 1-based page containing the document position. */
  pageAt: (this: PaginationStorage, pos: number) => number;
};

// Gap between two sheets; must match .manuscript-page-gap in studio.css.
export const PAGE_GAP_PX = 32;
// Everything a break widget draws besides the spacer: the bottom margin of the
// ending sheet, the gap, and the top margin of the next sheet.
const BREAK_CHROME_PX = 2 * PAGE_MARGIN_PX + PAGE_GAP_PX;
const BREAK_CLASS = "manuscript-page-break";

const paginationKey = new PluginKey<DecorationSet>("pagination");

function forcesBreak(node: ProseNode) {
  if (node.type.name === "pageBreak") return true;
  return node.type.name === "heading" && node.attrs.level <= 2;
}

function createBreak(page: number, height: number) {
  const el = document.createElement("div");
  el.className = BREAK_CLASS;
  el.dataset.page = String(page);
  el.contentEditable = "false";
  el.style.height = `${height}px`;

  const spacer = document.createElement("div");
  spacer.className = "manuscript-page-spacer";
  const foot = document.createElement("div");
  foot.className = "manuscript-page-foot";
  const label = document.createElement("span");
  label.className = "manuscript-page-number";
  label.textContent = `Page ${page}`;
  foot.append(label);
  const gap = document.createElement("div");
  gap.className = "manuscript-page-gap";
  const head = document.createElement("div");
  head.className = "manuscript-page-head";

  el.append(spacer, foot, gap, head);
  return el;
}

function sameNumbers(a: number[], b: number[], tolerance = 0.5) {
  return (
    a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= tolerance)
  );
}

type Measurement = {
  starts: number[];
  /** spacers[n - 1] is the widget height for the break that ends page n. */
  spacers: number[];
};

/**
 * Block extent is taken from layout positions rather than summing margins, so
 * collapsed margins between siblings are counted exactly once. A block's extent
 * runs from its top (plus its own top margin when nothing precedes it that it
 * could collapse into: first block, or a page break widget) to the start of the
 * next block, or to the page break widget that precedes it.
 */
function measure(view: EditorView): Measurement | null {
  // A hidden editor (e.g. Plan view) lays out at zero height; keep the last pages.
  if (!view.dom.getClientRects().length) return null;
  const { doc } = view.state;
  const positions: number[] = [];
  const blocks: Block[] = [];
  const els: HTMLElement[] = [];
  let missing = false;
  doc.forEach((node, offset) => {
    const el = view.nodeDOM(offset);
    if (!(el instanceof HTMLElement)) {
      missing = true;
      return;
    }
    positions.push(offset);
    els.push(el);
    blocks.push({ height: 0, forceBreak: forcesBreak(node) });
  });
  if (missing) return null;

  const isBreak = (el: Element | null): el is HTMLElement =>
    !!el && el.classList.contains(BREAK_CLASS);

  const rects = els.map((el) => el.getBoundingClientRect());
  const styles = els.map((el) => getComputedStyle(el));
  const num = (value: string) => parseFloat(value) || 0;
  els.forEach((el, i) => {
    const before = el.previousElementSibling;
    const start =
      rects[i].top -
      (i === 0 || isBreak(before) ? num(styles[i].marginTop) : 0);
    let end: number;
    if (i === els.length - 1) {
      end = rects[i].bottom + num(styles[i].marginBottom);
    } else {
      const nextBefore = els[i + 1].previousElementSibling;
      end = isBreak(nextBefore)
        ? nextBefore.getBoundingClientRect().top
        : rects[i + 1].top;
    }
    blocks[i].height = Math.max(0, end - start);
  });

  const pageStarts = paginate(blocks);
  const spacers: number[] = [];
  for (let page = 1; page < pageStarts.length; page++) {
    let used = 0;
    for (let i = pageStarts[page - 1]; i < pageStarts[page]; i++) {
      used += blocks[i].height;
    }
    spacers.push(Math.max(0, CONTENT_HEIGHT_PX - used) + BREAK_CHROME_PX);
  }
  return { starts: pageStarts.map((i) => positions[i] ?? 0), spacers };
}

export const Pagination = Extension.create<
  PaginationOptions,
  PaginationStorage
>({
  name: "pagination",

  addOptions() {
    return { onPaginate: undefined };
  },

  addStorage() {
    return {
      pages: 1,
      starts: [0],
      pageAt(pos) {
        let page = 1;
        for (let i = 0; i < this.starts.length; i++) {
          if (this.starts[i] <= pos) page = i + 1;
        }
        return page;
      },
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    const options = this.options;
    // Latest spacer heights. Widgets are keyed by page number so ProseMirror
    // reuses their DOM; height changes are therefore written to the DOM
    // directly instead of going through a decoration update.
    let spacers: number[] = [];
    let reported = false;

    const build = (doc: ProseNode, starts: number[]) =>
      DecorationSet.create(
        doc,
        starts.slice(1).map((pos, i) => {
          const page = i + 1;
          return Decoration.widget(
            pos,
            () => createBreak(page, spacers[i] ?? BREAK_CHROME_PX),
            { side: -1, key: `page-${page}`, ignoreSelection: true },
          );
        }),
      );

    return [
      new Plugin<DecorationSet>({
        key: paginationKey,
        state: {
          init: (_, { doc }) => build(doc, [0]),
          apply(tr, set) {
            const starts = tr.getMeta(paginationKey) as number[] | undefined;
            if (starts) return build(tr.doc, starts);
            return tr.docChanged ? set.map(tr.mapping, tr.doc) : set;
          },
        },
        props: {
          decorations: (state) => paginationKey.getState(state),
        },
        view(view) {
          let frame = 0;
          let destroyed = false;

          const run = () => {
            frame = 0;
            if (destroyed || view.isDestroyed) return;
            const result = measure(view);
            if (!result) return;
            spacers = result.spacers;

            // Only dispatch when the break positions actually moved; this is
            // what stops our own meta transaction from re-triggering itself.
            const set = paginationKey.getState(view.state);
            const applied = (set?.find() ?? []).map((d) => d.from);
            const moved = !sameNumbers(applied, result.starts.slice(1), 0);
            if (moved) {
              view.dispatch(
                view.state.tr
                  .setMeta(paginationKey, result.starts)
                  .setMeta("addToHistory", false),
              );
            }
            view.dom
              .querySelectorAll<HTMLElement>(`.${BREAK_CLASS}[data-page]`)
              .forEach((el) => {
                const height = spacers[Number(el.dataset.page) - 1];
                if (height !== undefined) el.style.height = `${height}px`;
              });

            const changed =
              !reported ||
              storage.pages !== result.starts.length ||
              !sameNumbers(storage.starts, result.starts, 0);
            storage.pages = result.starts.length;
            storage.starts = result.starts;
            if (changed) {
              reported = true;
              options.onPaginate?.({
                pages: storage.pages,
                starts: storage.starts,
              });
            }
          };

          const schedule = () => {
            if (!frame && !destroyed) frame = requestAnimationFrame(run);
          };

          // Web fonts change glyph metrics after first paint.
          document.fonts?.ready.then(schedule);
          schedule();

          return {
            update: schedule,
            destroy() {
              destroyed = true;
              if (frame) cancelAnimationFrame(frame);
            },
          };
        },
      }),
    ];
  },
});
