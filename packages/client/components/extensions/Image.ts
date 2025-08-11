
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
// at top of your Image extension file
import { TextSelection } from "@tiptap/pm/state";

// ✅ Extend Tiptap commands for image
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; width?: string }) => ReturnType;
    };
  }
}

export const Image = Node.create({
  name: "image",

  group: "block",
  inline: false,
  atom: true, // ← Crucial for Yjs/Collaboration
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: "300",
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

addCommands() {
  return {
    setImage:
      (attrs) =>
      ({ tr, state, dispatch }) => {
        const { schema } = state;
        const imageNode = state.schema.nodes[this.name].createAndFill(attrs);
        if (!imageNode) return false;

        // 1) Insert the image at the current selection
        let nextTr = tr.replaceSelectionWith(imageNode, false);

        // 2) Ensure there’s a paragraph after it, and move caret into that paragraph
        const paragraph = schema.nodes.paragraph?.createAndFill();
        const posAfterImage = nextTr.selection.from; // position *after* the inserted image

        if (paragraph) {
          // insert paragraph immediately after image
          nextTr = nextTr.insert(posAfterImage, paragraph);

          // place caret at the start of the new paragraph
          // (posAfterImage + 1 is the first position *inside* that paragraph)
          nextTr = nextTr.setSelection(
            TextSelection.create(nextTr.doc, posAfterImage + 1)
          );
        } else {
          // fallback: put the caret right after the image
          nextTr = nextTr.setSelection(
            TextSelection.create(nextTr.doc, posAfterImage)
          );
        }

        if (dispatch) dispatch(nextTr.scrollIntoView());
        return true;
      },
  };
},

  // ✅ Add keyboard support for deleting images
 addKeyboardShortcuts() {
  const isImage = (node: any) => node && node.type && node.type.name === this.name;

  const deleteImageAt = (state: any, dispatch: any, from: number, to: number) => {
    if (dispatch) dispatch(state.tr.delete(from, to));
    return true;
  };

  return {
    Backspace: ({ editor }) => {
      const { state, dispatch } = editor.view;
      const sel = state.selection;

      // Case A: explicit NodeSelection on the image
      if (sel instanceof NodeSelection) {
        const node = state.doc.nodeAt(sel.from);
        if (!node) return true; // stale selection, swallow
        if (isImage(node)) return deleteImageAt(state, dispatch, sel.from, sel.to);
        return false;
      }

      // Case B: caret (TextSelection) just after an image
      const $from = sel.$from;
      const before = $from.nodeBefore;
      if (before && isImage(before)) {
        const from = $from.pos - (before.nodeSize ?? 0);
        const to = $from.pos;
        if (from != null && to != null && from >= 0 && to >= from) {
          return deleteImageAt(state, dispatch, from, to);
        }
      }

      return false;
    },

    Delete: ({ editor }) => {
      const { state, dispatch } = editor.view;
      const sel = state.selection;

      // Case A: explicit NodeSelection
      if (sel instanceof NodeSelection) {
        const node = state.doc.nodeAt(sel.from);
        if (!node) return true; // stale selection, swallow
        if (isImage(node)) return deleteImageAt(state, dispatch, sel.from, sel.to);
        return false;
      }

      // Case B: caret (TextSelection) just before an image
      const $from = sel.$from;
      const after = $from.nodeAfter;
      if (after && isImage(after)) {
        const from = $from.pos;
        const to = $from.pos + (after.nodeSize ?? 0);
        if (from != null && to != null && to <= state.doc.content.size) {
          return deleteImageAt(state, dispatch, from, to);
        }
      }

      return false;
    },
  };
},
});