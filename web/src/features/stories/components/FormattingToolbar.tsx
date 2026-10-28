import { Fragment, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Input";
import {
  appearanceOf,
  manuscriptFonts,
  manuscriptSizes,
  withAppearance,
  type Manuscript,
  type ManuscriptFont,
  type ManuscriptSize,
} from "../manuscript/document";

type Style = "body" | "chapter" | "part";
type Align = "left" | "center" | "right" | "justify";

const alignments: Align[] = ["left", "center", "right", "justify"];
// Line lengths per alignment: [x1, x2] for each of four rows.
const alignLines: Record<Align, [number, number][]> = {
  left: [
    [4, 20],
    [4, 14],
    [4, 20],
    [4, 14],
  ],
  center: [
    [4, 20],
    [7, 17],
    [4, 20],
    [7, 17],
  ],
  right: [
    [4, 20],
    [10, 20],
    [4, 20],
    [10, 20],
  ],
  justify: [
    [4, 20],
    [4, 20],
    [4, 20],
    [4, 20],
  ],
};

function MarkIcon({ path }: { path: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function Divider() {
  return (
    <span
      className="format-divider"
      role="separator"
      aria-orientation="vertical"
    />
  );
}

function AlignIcon({ align }: { align: Align }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {alignLines[align].map(([x1, x2], i) => (
        <path key={i} d={`M${x1} ${5 + i * 5}H${x2}`} />
      ))}
    </svg>
  );
}

const emptyState = {
  font: "georgia" as ManuscriptFont,
  size: "12" as ManuscriptSize,
  style: "body" as Style,
  nested: false,
  inHeading: false,
  align: "left" as Align,
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  quote: false,
  bullets: false,
  numbers: false,
  canUndo: false,
  canRedo: false,
};

export function FormattingToolbar({ editor }: { editor: Editor | null }) {
  // useEditorState re-renders on every transaction, but only commits a render
  // when the selected snapshot differs (deep equality), so typing stays cheap.
  const state =
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) return emptyState;
        const { $from } = editor.state.selection;
        const level = editor.isActive("heading")
          ? Number(editor.getAttributes("heading").level)
          : 0;
        const align = String($from.parent.attrs.textAlign ?? "left");
        const look = appearanceOf({
          type: "doc",
          attrs: editor.state.doc.attrs,
          content: [],
        });
        return {
          font: look.font,
          size: look.size,
          style: (level === 1
            ? "part"
            : level === 2
              ? "chapter"
              : "body") as Style,
          // Headings and scene breaks are top-level only (server allowlist).
          nested: $from.depth > 1,
          inHeading: $from.parent.type.name === "heading",
          align: (alignments.includes(align as Align)
            ? align
            : "left") as Align,
          bold: editor.isActive("bold"),
          italic: editor.isActive("italic"),
          underline: editor.isActive("underline"),
          strike: editor.isActive("strike"),
          quote: editor.isActive("blockquote"),
          bullets: editor.isActive("bulletList"),
          numbers: editor.isActive("orderedList"),
          canUndo: editor.can().undo(),
          canRedo: editor.can().redo(),
        };
      },
    }) ?? emptyState;
  const disabled = !editor;

  function applyAppearance(font: ManuscriptFont, size: ManuscriptSize) {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    editor.commands.setContent(
      withAppearance(editor.getJSON() as Manuscript, font, size),
      { emitUpdate: true },
    );
    const max = editor.state.doc.content.size;
    editor.commands.setTextSelection({
      from: Math.min(from, max),
      to: Math.min(to, max),
    });
  }
  function setStyle(style: Style) {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (style === "body") chain.setParagraph().run();
    else chain.setHeading({ level: style === "part" ? 1 : 2 }).run();
  }
  function setAlign(align: Align) {
    if (!editor) return;
    const chain = editor.chain().focus();
    // Left is the default; clear the attribute rather than persisting it.
    if (align === "left") chain.unsetTextAlign().run();
    else chain.setTextAlign(align).run();
  }
  function toggle(
    label: string,
    pressed: boolean,
    onClick: () => void,
    children: ReactNode,
    isDisabled = false,
  ) {
    return (
      <Button
        variant="secondary"
        className="format-button"
        aria-label={label}
        title={label}
        aria-pressed={pressed}
        disabled={disabled || isDisabled}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }

  return (
    <div className="format-toolbar" role="toolbar" aria-label="Text formatting">
      <Select
        className="format-style"
        aria-label="Paragraph style"
        value={state.style}
        disabled={disabled || state.nested}
        onChange={(e) => setStyle(e.target.value as Style)}
      >
        <option value="body">Body</option>
        <option value="chapter">Chapter</option>
        <option value="part">Part</option>
      </Select>
      <Divider />
      {toggle(
        "Bold",
        state.bold,
        () => editor?.chain().focus().toggleBold().run(),
        <strong>B</strong>,
      )}
      {toggle(
        "Italic",
        state.italic,
        () => editor?.chain().focus().toggleItalic().run(),
        <em>I</em>,
      )}
      {toggle(
        "Underline",
        state.underline,
        () => editor?.chain().focus().toggleUnderline().run(),
        <u>U</u>,
      )}
      {toggle(
        "Strikethrough",
        state.strike,
        () => editor?.chain().focus().toggleStrike().run(),
        <s>S</s>,
      )}
      <Divider />
      {toggle(
        "Quote",
        state.quote,
        () => editor?.chain().focus().toggleBlockquote().run(),
        <MarkIcon path="M7 17a4 4 0 0 1-4-4V7h6v6H6c0 1.1.9 2 2 2v2zm10 0a4 4 0 0 1-4-4V7h6v6h-3c0 1.1.9 2 2 2v2z" />,
        state.inHeading,
      )}
      {toggle(
        "Bulleted list",
        state.bullets,
        () => editor?.chain().focus().toggleBulletList().run(),
        <MarkIcon path="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />,
        state.inHeading,
      )}
      {toggle(
        "Numbered list",
        state.numbers,
        () => editor?.chain().focus().toggleOrderedList().run(),
        <MarkIcon path="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 16H4c0-1 2-2 2-3s-1-1.5-2-1" />,
        state.inHeading,
      )}
      <Divider />
      {alignments.map((align) => (
        <Fragment key={align}>
          {toggle(
            `Align ${align}`,
            state.align === align,
            () => setAlign(align),
            <AlignIcon align={align} />,
          )}
        </Fragment>
      ))}
      <Divider />
      <Button
        variant="secondary"
        className="format-button"
        aria-label="Scene break"
        title="Scene break"
        disabled={disabled || state.nested || state.inHeading}
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
      >
        <MarkIcon path="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />
      </Button>
      <Divider />
      <Button
        variant="secondary"
        className="format-button"
        aria-label="Undo"
        title="Undo"
        disabled={disabled || !state.canUndo}
        onClick={() => editor?.chain().focus().undo().run()}
      >
        <MarkIcon path="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H12" />
      </Button>
      <Button
        variant="secondary"
        className="format-button"
        aria-label="Redo"
        title="Redo"
        disabled={disabled || !state.canRedo}
        onClick={() => editor?.chain().focus().redo().run()}
      >
        <MarkIcon path="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H12" />
      </Button>
      <Divider />
      <Select
        className="format-style"
        aria-label="Manuscript font"
        title="Font for the whole manuscript"
        value={state.font}
        disabled={disabled}
        onChange={(e) =>
          applyAppearance(e.target.value as ManuscriptFont, state.size)
        }
      >
        {manuscriptFonts.map((font) => (
          <option key={font.id} value={font.id}>
            {font.label}
          </option>
        ))}
      </Select>
      <Select
        className="format-style format-size"
        aria-label="Manuscript size"
        title="Body size for the whole manuscript"
        value={state.size}
        disabled={disabled}
        onChange={(e) =>
          applyAppearance(state.font, e.target.value as ManuscriptSize)
        }
      >
        {manuscriptSizes.map((size) => (
          <option key={size} value={size}>
            {size} pt
          </option>
        ))}
      </Select>
    </div>
  );
}
