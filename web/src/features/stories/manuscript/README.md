# Manuscript contract

A novel stores one `ManuscriptJson` string containing structured JSON:

```json
{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Opening prose"}]},{"type":"heading","attrs":{"level":2,"id":"stable-uuid","summary":"Private planning summary","sourceArcId":null},"content":[{"type":"text","text":"Chapter one"}]}]}
```

The flat document accepts paragraphs and headings with inline text, bold/italic/strike/underline marks and hard breaks. Level 1 identifies parts; level 2 identifies chapters. `attrs.id` is the public chapter/part identity, independent of React or the editor. `attrs.summary` is planning metadata and is never rendered as prose. `sourceArcId` records optional arc insertion provenance. There are no page nodes: CSS columns fragment this single document into horizontal sheets.

`document.ts` has no editor or React imports. `outline(doc)` returns headings in document order. `heading(kind, title, id?, summary?, sourceArcId?)` creates a part/chapter node, assigning a UUID when no identity is supplied. `insertHeading(doc, index, node)` inserts at a block boundary; the editor handles splitting a paragraph at the text cursor. `renameHeading(doc, id, title)` and `summarizeHeading(doc, id, summary)` retain identity. `moveSection(doc, id, beforeId)` moves that heading and all following blocks until the next heading of equal or higher level; `null` places it at the end. Moving a part includes its chapters. `identify(doc)` repairs missing/duplicate IDs after editing, without changing existing unique IDs.

`importLegacy(chapters, scenes)` sorts both inputs by their order fields, keeps legacy chapter IDs as heading IDs, and imports each scene's prose as paragraphs under its chapter. Import happens only when the novel's manuscript column is null and is persisted with Save manuscript. Original rows are neither edited nor deleted. An empty saved document never reimports legacy prose.

Saving supplies the original document string as an optimistic concurrency token. A conflicting save returns 409 and preserves the current editor draft. The old chapter route redirects to the novel with `?heading=<legacy-chapter-id>`.

Adaptation still references original scene IDs. This change does not synchronize manuscript edits back into scenes or change adaptation behavior.
