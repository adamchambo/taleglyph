/** Version 1: a flat ProseMirror document. Pages are never stored. */
export type DocNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: DocNode[];
};
export type Manuscript = { type: "doc"; content: DocNode[] };
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
