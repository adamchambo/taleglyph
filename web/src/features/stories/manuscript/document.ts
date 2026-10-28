/** Version 1: a flat ProseMirror document. Pages are never stored. */
export type DocNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: DocNode[];
};
export type Manuscript = {
  type: "doc";
  /** Whole-manuscript appearance. Absent means the defaults. */
  attrs?: { font?: string; fontSize?: string };
  content: DocNode[];
};
export const manuscriptFonts = [
  { id: "georgia", label: "Georgia", family: "Georgia, serif" },
  {
    id: "palatino",
    label: "Palatino",
    family: 'Palatino, "Palatino Linotype", "Book Antiqua", serif',
  },
  { id: "times", label: "Times", family: '"Times New Roman", Times, serif' },
  { id: "system", label: "System serif", family: "ui-serif, Georgia, serif" },
] as const;
export const manuscriptSizes = ["11", "12", "13"] as const;
export type ManuscriptFont = (typeof manuscriptFonts)[number]["id"];
export type ManuscriptSize = (typeof manuscriptSizes)[number];
const DEFAULT_FONT: ManuscriptFont = "georgia";
const DEFAULT_SIZE: ManuscriptSize = "12";
export function appearanceOf(doc: Manuscript): {
  font: ManuscriptFont;
  size: ManuscriptSize;
} {
  const font = manuscriptFonts.find((item) => item.id === doc.attrs?.font);
  const size = manuscriptSizes.find((item) => item === doc.attrs?.fontSize);
  return { font: font?.id ?? DEFAULT_FONT, size: size ?? DEFAULT_SIZE };
}
export function fontFamily(font: ManuscriptFont) {
  return (
    manuscriptFonts.find((item) => item.id === font)?.family ??
    manuscriptFonts[0].family
  );
}
/** Stamp a whole-manuscript font and size. Headings stay a multiple of the size. */
export function withAppearance(
  doc: Manuscript,
  font: ManuscriptFont,
  size: ManuscriptSize,
): Manuscript {
  return { ...doc, attrs: { font, fontSize: size } };
}
export type HeadingKind = "part" | "chapter";
export const paragraph = (text = ""): DocNode => ({
  type: "paragraph",
  ...(text ? { content: [{ type: "text", text }] } : {}),
});
export const emptyDocument = (): Manuscript => ({
  type: "doc",
  content: [paragraph()],
});
export function heading(
  kind: HeadingKind,
  title: string,
  id: string = crypto.randomUUID(),
  summary = "",
  sourceArcId: string | null = null,
): DocNode {
  return {
    type: "heading",
    attrs: { level: kind === "part" ? 1 : 2, id, summary, sourceArcId },
    content: title ? [{ type: "text", text: title }] : [],
  };
}
/** Containers whose children are blocks: their text is newline-separated. */
const blockContainers = new Set([
  "doc",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
]);
export function pageText(node: DocNode): string {
  if (node.type === "hardBreak") return "\n";
  return (
    node.text ??
    (node.content ?? [])
      .map(pageText)
      .join(blockContainers.has(node.type) ? "\n" : "")
  );
}
export function outline(doc: Manuscript) {
  return doc.content.flatMap((node, index) =>
    node.type === "heading"
      ? [
          {
            id: String(node.attrs?.id),
            kind: (node.attrs?.level === 1 ? "part" : "chapter") as HeadingKind,
            title: pageText(node),
            summary: String(node.attrs?.summary ?? ""),
            sourceArcId: node.attrs?.sourceArcId as string | null,
            index,
          },
        ]
      : [],
  );
}
/** Preserve the first occurrence of an identity; pasted/split headings get new IDs. */
export function identify(doc: Manuscript): Manuscript {
  const seen = new Set<string>();
  return {
    ...doc,
    content: doc.content.map((node) => {
      if (node.type !== "heading") return node;
      let id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const duplicate = seen.has(id);
      if (!id || duplicate) id = crypto.randomUUID();
      seen.add(id);
      return {
        ...node,
        attrs: {
          ...node.attrs,
          id,
          summary: duplicate ? "" : (node.attrs?.summary ?? ""),
          sourceArcId: duplicate ? null : (node.attrs?.sourceArcId ?? null),
        },
      };
    }),
  };
}
/** Insert at a top-level block boundary; the editor splits the cursor block first. */
export function insertHeading(
  doc: Manuscript,
  index: number,
  node: DocNode,
): Manuscript {
  return identify({
    ...doc,
    content: [
      ...doc.content.slice(0, index),
      node,
      ...doc.content.slice(index),
    ],
  });
}
export function renameHeading(
  doc: Manuscript,
  id: string,
  title: string,
): Manuscript {
  return {
    ...doc,
    content: doc.content.map((n) =>
      n.type === "heading" && n.attrs?.id === id
        ? { ...n, content: title ? [{ type: "text", text: title }] : [] }
        : n,
    ),
  };
}
/** A chapter may cite an arc. Many chapters can cite the same one. */
export function assignArc(
  doc: Manuscript,
  id: string,
  sourceArcId: string | null,
): Manuscript {
  return {
    ...doc,
    content: doc.content.map((node) =>
      node.type === "heading" && node.attrs?.id === id
        ? { ...node, attrs: { ...node.attrs, sourceArcId } }
        : node,
    ),
  };
}
/**
 * Append a blank chapter. When an arc is given, place it after the last
 * chapter that already cites that arc, so the arc's chapters stay together.
 */
export function insertChapter(
  doc: Manuscript,
  sourceArcId: string | null,
): Manuscript {
  const extra = [
    heading("chapter", "", crypto.randomUUID(), "", sourceArcId),
    paragraph(),
  ];
  let insertAt = doc.content.length;
  if (sourceArcId) {
    doc.content.forEach((node, index) => {
      if (node.type !== "heading" || node.attrs?.sourceArcId !== sourceArcId)
        return;
      const level = Number(node.attrs?.level ?? 2);
      let end = index + 1;
      while (
        end < doc.content.length &&
        !(
          doc.content[end].type === "heading" &&
          Number(doc.content[end].attrs?.level ?? 2) <= level
        )
      )
        end++;
      insertAt = end;
    });
  }
  return identify({
    ...doc,
    content: [
      ...doc.content.slice(0, insertAt),
      ...extra,
      ...doc.content.slice(insertAt),
    ],
  });
}
export function summarizeHeading(
  doc: Manuscript,
  id: string,
  summary: string,
): Manuscript {
  return {
    ...doc,
    content: doc.content.map((n) =>
      n.type === "heading" && n.attrs?.id === id
        ? { ...n, attrs: { ...n.attrs, summary } }
        : n,
    ),
  };
}
/** Move heading and following blocks before target; parts include their chapters. Null means end. */
export function moveSection(
  doc: Manuscript,
  id: string,
  beforeId: string | null,
): Manuscript {
  const start = doc.content.findIndex(
    (n) => n.type === "heading" && n.attrs?.id === id,
  );
  if (start < 0) return doc;
  const level = Number(doc.content[start].attrs?.level);
  let end = start + 1;
  while (
    end < doc.content.length &&
    !(
      doc.content[end].type === "heading" &&
      Number(doc.content[end].attrs?.level) <= level
    )
  )
    end++;
  const target =
    beforeId === null
      ? doc.content.length
      : doc.content.findIndex(
          (n) => n.type === "heading" && n.attrs?.id === beforeId,
        );
  if (target < 0 || (target >= start && target <= end)) return doc;
  const content = [...doc.content];
  const section = content.splice(start, end - start);
  content.splice(
    target > start ? target - section.length : target,
    0,
    ...section,
  );
  return { ...doc, content };
}
export function importLegacy(
  chapters: { id: string; title: string; order: number }[],
  scenes: { chapterId: string; prose: string; order: number }[],
): Manuscript {
  const content = [...chapters]
    .sort((a, b) => a.order - b.order)
    .flatMap((c) => [
      heading("chapter", c.title, c.id),
      ...scenes
        .filter((s) => s.chapterId === c.id)
        .sort((a, b) => a.order - b.order)
        .flatMap((s) => s.prose.split(/\r?\n/).map(paragraph)),
    ]);
  return { type: "doc", content: content.length ? content : [paragraph()] };
}
