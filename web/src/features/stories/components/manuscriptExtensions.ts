import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { identify, type Manuscript } from "../manuscript/document";

export const Identity = Extension.create({
  name: "manuscriptIdentity",
  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          id: { default: null, rendered: false },
          summary: { default: "", rendered: false },
          sourceArcId: { default: null, rendered: false },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _old, state) {
          if (!transactions.some((t) => t.docChanged)) return null;
          const normalized = identify(state.doc.toJSON() as Manuscript);
          const tr = state.tr;
          let index = 0;
          state.doc.forEach((node, pos) => {
            const attrs = normalized.content[index++].attrs;
            if (
              node.type.name === "heading" &&
              JSON.stringify(attrs) !== JSON.stringify(node.attrs)
            )
              tr.setNodeMarkup(pos, undefined, attrs);
          });
          return tr.docChanged ? tr : null;
        },
      }),
    ];
  },
});

/**
 * StarterKit v3 already bundles bold/italic/underline/strike, blockquote,
 * bullet/ordered lists + list items, horizontal rule (used as a scene break)
 * and undo/redo. Only code, codeBlock and link are switched off; the server
 * allowlist (ManuscriptValidation) rejects those node/mark types.
 */
export const manuscriptExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2] },
    codeBlock: false,
    link: false,
    code: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
  Identity,
];
