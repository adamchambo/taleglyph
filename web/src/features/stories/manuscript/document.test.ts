import { describe, expect, it } from "vitest";
import {
  emptyDocument,
  heading,
  identify,
  importLegacy,
  insertHeading,
  moveSection,
  outline,
  pageText,
  paragraph,
  renameHeading,
  summarizeHeading,
  type DocNode,
  type Manuscript,
} from "./document";
const sample = (): Manuscript => ({
  type: "doc",
  content: [
    paragraph("Prologue"),
    heading("part", "Part one", "p"),
    heading("chapter", "First", "a"),
    paragraph("First prose"),
    heading("chapter", "Second", "b"),
    paragraph("Second prose"),
    heading("part", "Part two", "q"),
    heading("chapter", "Third", "c"),
  ],
});
describe("manuscript document", () => {
  it("extracts headings in document order", () => {
    expect(outline(sample()).map((h) => h.id)).toEqual([
      "p",
      "a",
      "b",
      "q",
      "c",
    ]);
  });
  it("permits prose before headings and inserts at a block boundary", () => {
    const doc = insertHeading(
      emptyDocument(),
      1,
      heading("chapter", "New", "new"),
    );
    expect(doc.content[0].type).toBe("paragraph");
    expect(outline(doc)[0].id).toBe("new");
  });
  it("renames without changing identity or prose", () => {
    const doc = renameHeading(sample(), "a", "Changed");
    expect(outline(doc)[1]).toMatchObject({ id: "a", title: "Changed" });
    expect(pageText(doc)).toContain("First prose");
  });
  it("moves a chapter with all its prose, preserving the preamble", () => {
    const doc = moveSection(sample(), "b", "a");
    expect(outline(doc).map((h) => h.id)).toEqual(["p", "b", "a", "q", "c"]);
    expect(doc.content.slice(0, 4).map(pageText)).toEqual([
      "Prologue",
      "Part one",
      "Second",
      "Second prose",
    ]);
  });
  it("moves a part including its chapters to the end", () => {
    expect(outline(moveSection(sample(), "p", null)).map((h) => h.id)).toEqual([
      "q",
      "c",
      "p",
      "a",
      "b",
    ]);
  });
  it("does not move a part into itself", () => {
    const doc = sample();
    expect(moveSection(doc, "p", "b")).toBe(doc);
  });
  it("keeps summaries out of rendered page text", () => {
    const doc = summarizeHeading(sample(), "a", "Secret plan");
    expect(outline(doc)[1].summary).toBe("Secret plan");
    expect(pageText(doc)).not.toContain("Secret plan");
  });
  it("imports legacy chapter/scene prose in order without modifying sources", () => {
    const chapters = [
      { id: "b", title: "Second", order: 2 },
      { id: "a", title: "First", order: 1 },
    ];
    const scenes = [
      { chapterId: "a", prose: "Later", order: 2 },
      { chapterId: "a", prose: "Earlier\nNext paragraph", order: 1 },
    ];
    const original = JSON.stringify({ chapters, scenes });
    const doc = importLegacy(chapters, scenes);
    expect(pageText(doc)).toBe("First\nEarlier\nNext paragraph\nLater\nSecond");
    expect(outline(doc).map((h) => h.id)).toEqual(["a", "b"]);
    expect(JSON.stringify({ chapters, scenes })).toBe(original);
  });
  it("repairs duplicate or missing identities while preserving existing IDs", () => {
    const doc = identify({
      type: "doc",
      content: [
        heading("chapter", "One", "a"),
        heading("chapter", "Copy", "a"),
        { type: "heading", attrs: { level: 2 } },
      ],
    });
    const ids = outline(doc).map((h) => h.id);
    expect(ids[0]).toBe("a");
    expect(new Set(ids).size).toBe(3);
    expect(identify(doc)).toEqual(doc);
  });
  it("moves a section containing lists, quotes and scene breaks as one unit", () => {
    const li = (text: string): DocNode => ({
      type: "listItem",
      content: [paragraph(text)],
    });
    const doc: Manuscript = {
      type: "doc",
      content: [
        heading("chapter", "First", "a"),
        paragraph("Opening"),
        { type: "horizontalRule" },
        { type: "bulletList", content: [li("one"), li("two")] },
        { type: "blockquote", content: [paragraph("Quoted")] },
        {
          type: "orderedList",
          content: [li("first"), li("second")],
        },
        heading("chapter", "Second", "b"),
        paragraph("Second prose"),
      ],
    };
    const moved = moveSection(doc, "a", null);
    expect(outline(moved).map((h) => h.id)).toEqual(["b", "a"]);
    expect(moved.content.map((n) => n.type)).toEqual([
      "heading",
      "paragraph",
      "heading",
      "paragraph",
      "horizontalRule",
      "bulletList",
      "blockquote",
      "orderedList",
    ]);
    expect(identify(moved)).toEqual(moved);
  });
  it("extracts text from nested lists and quotes with block separation", () => {
    const li = (text: string): DocNode => ({
      type: "listItem",
      content: [paragraph(text)],
    });
    const doc: Manuscript = {
      type: "doc",
      content: [
        { type: "bulletList", content: [li("one"), li("two")] },
        { type: "horizontalRule" },
        { type: "blockquote", content: [paragraph("Quoted")] },
      ],
    };
    expect(pageText(doc)).toBe("one\ntwo\n\nQuoted");
  });
});
