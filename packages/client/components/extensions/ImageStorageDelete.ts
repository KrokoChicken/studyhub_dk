// components/extensions/ImageStorageDelete.ts
import { Extension } from "@tiptap/core";
import { keymap } from "@tiptap/pm/keymap";
import { EditorState, Transaction } from "@tiptap/pm/state";

function deleteWithStorage(from: number, to: number, src: string | undefined) {
  if (src) {
    // fire-and-forget; your API is idempotent
    fetch("/api/storage/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: src }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((j) => console.log("[storage] delete result:", j))
      .catch((e) => console.warn("[storage] delete failed:", e));
  }
  return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    if (dispatch) dispatch(state.tr.delete(from, to));
    return true;
  };
}

export const ImageStorageDelete = Extension.create({
  name: "imageStorageDelete",
  // higher priority => earlier in extension order
  priority: 1000,

  addProseMirrorPlugins() {
    const bindings: Record<string, any> = {};
    const isImage = (n: any) => n?.type?.name === "image";

    // Backspace: delete image BEFORE caret
    bindings["Backspace"] = (state: EditorState, dispatch: any) => {
      const $from: any = state.selection.$from;
      const before = $from?.nodeBefore;
      if (before && isImage(before)) {
        const from = $from.pos - (before.nodeSize ?? 0);
        const to = $from.pos;
        const src = before.attrs?.src as string | undefined;
        console.log("[image-delete] Backspace on image →", { from, to, src });
        return deleteWithStorage(from, to, src)(state, dispatch);
      }
      return false;
    };

    // Delete: delete image AFTER caret
    bindings["Delete"] = (state: EditorState, dispatch: any) => {
      const $from: any = state.selection.$from;
      const after = $from?.nodeAfter;
      if (after && isImage(after)) {
        const from = $from.pos;
        const to = $from.pos + (after.nodeSize ?? 0);
        const src = after.attrs?.src as string | undefined;
        console.log("[image-delete] Delete on image →", { from, to, src });
        return deleteWithStorage(from, to, src)(state, dispatch);
      }
      return false;
    };

    return [keymap(bindings)];
  },
});