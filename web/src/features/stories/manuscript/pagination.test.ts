import { describe, expect, it } from "vitest";
import {
  CONTENT_HEIGHT_PX,
  CONTENT_WIDTH_PX,
  PAGE_HEIGHT_PX,
  PAGE_WIDTH_PX,
  paginate,
  pageOfBlock,
  type Block,
} from "./pagination";

const p = (height: number): Block => ({ height, forceBreak: false });
const h = (height: number): Block => ({ height, forceBreak: true });

describe("pagination", () => {
  it("derives the content box from the A4 sheet", () => {
    expect(PAGE_WIDTH_PX).toBe(794);
    expect(PAGE_HEIGHT_PX).toBe(1123);
    expect(CONTENT_WIDTH_PX).toBe(602);
    expect(CONTENT_HEIGHT_PX).toBe(931);
  });

  it("keeps blocks that exactly fill a page on one page", () => {
    expect(paginate([p(300), p(300), p(100)], 700)).toEqual([0]);
    expect(paginate([p(350), p(350)], 700)).toEqual([0]);
  });

  it("overflows to the next page when a block does not fit", () => {
    expect(paginate([p(400), p(400), p(200)], 700)).toEqual([0, 1]);
    expect(paginate([p(400), p(400), p(400), p(400)], 700)).toEqual([
      0, 1, 2, 3,
    ]);
    expect(paginate([p(300), p(300), p(300), p(300)], 700)).toEqual([0, 2]);
  });

  it("uses the A4 content height by default", () => {
    expect(paginate([p(CONTENT_HEIGHT_PX), p(1)])).toEqual([0, 1]);
    expect(paginate([p(CONTENT_HEIGHT_PX - 1), p(1)])).toEqual([0]);
  });

  it("starts a new page at every forced break", () => {
    expect(paginate([p(10), h(10), p(10), h(10)], 700)).toEqual([0, 1, 3]);
  });

  it("does not create an empty leading page for a first-block heading", () => {
    expect(paginate([h(50), p(100)], 700)).toEqual([0]);
    expect(paginate([h(50), h(50)], 700)).toEqual([0, 1]);
  });

  it("gives an oversized block its own page", () => {
    expect(paginate([p(100), p(900), p(100)], 700)).toEqual([0, 1, 2]);
    expect(paginate([p(900), p(100)], 700)).toEqual([0, 1]);
    expect(paginate([p(900)], 700)).toEqual([0]);
  });

  it("returns a single page start for an empty document", () => {
    expect(paginate([])).toEqual([0]);
  });

  it("maps blocks to 0-based pages", () => {
    const starts = [0, 3, 5];
    expect(pageOfBlock(starts, 0)).toBe(0);
    expect(pageOfBlock(starts, 2)).toBe(0);
    expect(pageOfBlock(starts, 3)).toBe(1);
    expect(pageOfBlock(starts, 4)).toBe(1);
    expect(pageOfBlock(starts, 5)).toBe(2);
    expect(pageOfBlock(starts, 99)).toBe(2);
    expect(pageOfBlock([0], 7)).toBe(0);
  });
});
