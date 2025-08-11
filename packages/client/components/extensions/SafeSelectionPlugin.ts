import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection, NodeSelection } from "@tiptap/pm/state";

export const SafeSelectionPlugin = Extension.create({
  name: "safeSelectionPlugin",

  addProseMirrorPlugins() {
    const key = new PluginKey("safeSelection");

    return [
      new Plugin({
        key,
        // Heal selection after every transaction, including remote Yjs steps.
        appendTransaction(_tr, _oldState, newState) {
          const sel = newState.selection;

          // If a NodeSelection points to nowhere (deleted), reset it to a safe text pos.
          if (sel instanceof NodeSelection) {
            const node = newState.doc.nodeAt(sel.from);
            if (!node) {
              const pos = Math.max(0, Math.min(sel.from, newState.doc.content.size));
              return newState.tr.setSelection(TextSelection.create(newState.doc, pos));
            }
          }

          // If a TextSelection ended up beyond doc size (rare, but can happen on remote shrink)
          if (sel instanceof TextSelection) {
            const max = newState.doc.content.size;
            if (sel.from > max || sel.to > max) {
              const pos = Math.max(0, Math.min(sel.from, max));
              return newState.tr.setSelection(TextSelection.create(newState.doc, pos));
            }
          }

          return null;
        },

        // As an extra guard: if user hits Backspace/Delete on a stale NodeSelection, reset first.
        props: {
          handleKeyDown(view, event) {
            if (event.key !== "Backspace" && event.key !== "Delete") return false;
            const { state } = view;
            const sel = state.selection;

            if (sel instanceof NodeSelection) {
              const stillThere = !!state.doc.nodeAt(sel.from);
              if (!stillThere) {
                const pos = Math.max(0, Math.min(sel.from, state.doc.content.size));
                view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)));
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});