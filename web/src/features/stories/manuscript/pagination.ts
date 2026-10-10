// A4 at 96 dpi: 210mm x 297mm, with ~25mm margins.
export const PAGE_WIDTH_PX = 794;
export const PAGE_HEIGHT_PX = 1123;
export const PAGE_MARGIN_PX = 96;
export const CONTENT_WIDTH_PX = PAGE_WIDTH_PX - 2 * PAGE_MARGIN_PX;
export const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - 2 * PAGE_MARGIN_PX;

export type Block = { height: number; forceBreak: boolean };

/**
 * Greedy page layout. Returns the index of the block that starts each page.
 * Blocks are never split: one taller than a page gets a page to itself and
 * simply overflows it. A forced break on the very first block is ignored so
 * the document never opens with an empty page.
 */
export function paginate(
  blocks: Block[],
  contentHeight = CONTENT_HEIGHT_PX,
): number[] {
  if (blocks.length === 0) return [0];
  const starts = [0];
  let used = blocks[0].height;
  for (let i = 1; i < blocks.length; i++) {
    const { height, forceBreak } = blocks[i];
    if (forceBreak || used + height > contentHeight) {
      starts.push(i);
      used = height;
    } else {
      used += height;
    }
  }
  return starts;
}

/** 0-based page containing the block at `blockIndex`. */
export function pageOfBlock(starts: number[], blockIndex: number): number {
  let page = 0;
  for (let i = 0; i < starts.length && starts[i] <= blockIndex; i++) page = i;
  return page;
}
