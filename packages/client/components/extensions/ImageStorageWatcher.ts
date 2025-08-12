import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { ySyncPluginKey } from "y-prosemirror";

/** Collect all image srcs in a doc (with counts) */
function collectImageSrcCounts(doc: any) {
  const counts = new Map<string, number>();
  doc.descendants((node: any) => {
    if (node?.type?.name === "image" && typeof node.attrs?.src === "string") {
      const src = node.attrs.src as string;
      counts.set(src, (counts.get(src) ?? 0) + 1);
    }
  });
  return counts;
}

async function callDeleteApi(url: string) {
  try {
    const res = await fetch("/api/storage/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const j = await res.json().catch(() => ({}));
    // Optional: log so you can see it happen
    // console.log("[storage] delete result:", j);
  } catch (e) {
    console.warn("[storage] delete failed:", e);
  }
}

/**
 * Watches transactions. When an image src disappears entirely from the doc
 * (count goes to zero), we call the storage delete API.
 * Skips remote/Yjs-originated transactions so only the user who deletes calls the API.
 */
export const ImageStorageWatcher = Extension.create({
  name: "imageStorageWatcher",
  priority: 1000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(trs, oldState, newState) {
          // If nothing changed, bail
          if (!trs.some(tr => tr.docChanged)) return null;

          // If this batch came from Yjs/remote, skip (let the actor's client do the delete)
          const yState = ySyncPluginKey.getState(newState);
          if (yState?.isChangeOrigin) return null;

          // Diff image src counts
          const before = collectImageSrcCounts(oldState.doc);
          const after = collectImageSrcCounts(newState.doc);

          // For every src in "before" that is now gone or reduced to zero → delete
          for (const [src, countBefore] of before.entries()) {
            const countAfter = after.get(src) ?? 0;
            if (countBefore > 0 && countAfter === 0) {
              // Fire-and-forget; API is idempotent
              void callDeleteApi(src);
            }
          }

          return null;
        },
      }),
    ];
  },
});