/*
"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Image } from "../extensions/Image";
import { SafeSelectionPlugin } from "../extensions/SafeSelectionPlugin";
import { uploadToSupabase } from "@/lib/uploadtoSupabase";

import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

import { TextSelection } from "@tiptap/pm/state";
import styles from "./CollaborativeEditor.module.css";

// Bump this whenever you change schema/behavior (e.g. when you made images non-selectable)
const SCHEMA_VERSION = "v2";

export default function Editor({
  roomId,
  userName,
}: {
  roomId: string;
  userName: string;
}) {
  const [ydoc] = useState(() => new Y.Doc());

  const color = useMemo(
    () =>
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0"),
    []
  );

  // Version the room name to avoid stale Yjs state after behavior changes
  const provider = useMemo(() => {
    const instance = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: `${roomId}-${SCHEMA_VERSION}`,
      document: ydoc,
    });
    instance.awareness!.setLocalStateField("user", { name: userName, color });
    return instance;
  }, [roomId, userName, color, ydoc]);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Image, // still non-selectable to prevent NodeSelection crash
      Collaboration.configure({ document: ydoc, field: "prosemirror" }),
      CollaborationCursor.configure({
        provider,
        user: { name: userName, color },
      }),
      SafeSelectionPlugin,
    ],
    editorProps: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const file = items.find((i) => i.type.includes("image"))?.getAsFile();
        if (!file) return false;

        event.preventDefault();
        uploadToSupabase(file).then((url) => {
          if (url && editor) {
            editor
              .chain()
              .focus()
              .setImage({ src: url, alt: file.name, width: "400" })
              .run();
          }
        });
        return true;
      },

      handleDrop(view, event) {
        const file = Array.from(event.dataTransfer?.files || []).find((f) =>
          f.type.includes("image")
        );
        if (!file) return false;

        event.preventDefault();
        uploadToSupabase(file)
          .then((url) => {
            if (url && editor) {
              editor
                .chain()
                .focus()
                .setImage({ src: url, alt: file.name, width: "400" })
                .run();
            }
          })
          .catch((err) => console.error("Upload failed:", err));
        return true;
      },

      // ❌ Removed handleClickOn so clicks no longer delete images
    },
    immediatelyRender: false,
  });

  // Heal any lingering NodeSelection immediately after initial sync
  useEffect(() => {
    const onSynced = () => {
      const view = editor?.view;
      if (!view) return;
      const sel: any = view.state.selection;
      if (sel?.constructor?.name === "NodeSelection") {
        const pos = Math.min(sel.from ?? 0, view.state.doc.content.size);
        view.dispatch(
          view.state.tr.setSelection(TextSelection.create(view.state.doc, pos))
        );
      }
    };
    provider.on("synced", onSynced);
    return () => {
      provider.off("synced", onSynced);
    };
  }, [editor, provider]);

  // Clean up provider & editor on unmount
  useEffect(() => {
    return () => {
      try {
        provider.destroy();
      } catch {}
      try {
        editor?.destroy();
      } catch {}
    };
  }, [editor, provider]);

  // Optional: expose editor for quick manual inspection in console
  if (typeof window !== "undefined" && editor) {
    (window as any).editor = editor;
  }

  return (
    <div className={styles.editorWrapper}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
*/

"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Image } from "../extensions/Image";
import { SafeSelectionPlugin } from "../extensions/SafeSelectionPlugin";
import { uploadToSupabase } from "@/lib/uploadtoSupabase";
import { ImageStorageDelete } from "../extensions/ImageStorageDelete";

import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { ImageStorageWatcher } from "../extensions/ImageStorageWatcher";
import { TextSelection } from "@tiptap/pm/state";
import styles from "./CollaborativeEditor.module.css";

// Bump this whenever you change schema/behavior (e.g. when you made images non-selectable)
const SCHEMA_VERSION = "v2";

export default function Editor({
  roomId,
  userName,
}: {
  roomId: string;
  userName: string;
}) {
  const [ydoc] = useState(() => new Y.Doc());

  const color = useMemo(
    () =>
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0"),
    []
  );

  // Version the room name to avoid stale Yjs state after behavior changes
  const provider = useMemo(() => {
    const instance = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: `${roomId}-${SCHEMA_VERSION}`,
      document: ydoc,
    });
    instance.awareness!.setLocalStateField("user", { name: userName, color });
    return instance;
  }, [roomId, userName, color, ydoc]);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Image, // still non-selectable to prevent NodeSelection crash
      ImageStorageWatcher, // 👈 add THIS
      Collaboration.configure({ document: ydoc, field: "prosemirror" }),
      CollaborationCursor.configure({
        provider,
        user: { name: userName, color },
      }),
      SafeSelectionPlugin,
    ],
    editorProps: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const file = items.find((i) => i.type.includes("image"))?.getAsFile();
        if (!file) return false;

        event.preventDefault();
        uploadToSupabase(file).then((url) => {
          if (url && editor) {
            editor
              .chain()
              .focus()
              .setImage({ src: url, alt: file.name, width: "400" })
              .run();
          }
        });
        return true;
      },

      handleDrop(view, event) {
        const file = Array.from(event.dataTransfer?.files || []).find((f) =>
          f.type.includes("image")
        );
        if (!file) return false;

        event.preventDefault();
        uploadToSupabase(file)
          .then((url) => {
            if (url && editor) {
              editor
                .chain()
                .focus()
                .setImage({ src: url, alt: file.name, width: "400" })
                .run();
            }
          })
          .catch((err) => console.error("Upload failed:", err));
        return true;
      },

      // 👇 This reliably fires before PM deletes content (Backspace/Delete)
      handleDOMEvents: {
        beforeinput(view, evt) {
          const e = evt as InputEvent;
          if (!e || typeof e.inputType !== "string") return false;

          const isDelete =
            e.inputType === "deleteContentBackward" ||
            e.inputType === "deleteContentForward";
          if (!isDelete) return false;

          const { state } = view;
          const { $from } = state.selection as any;
          const isImage = (n: any) => n?.type?.name === "image";

          if (e.inputType === "deleteContentBackward") {
            const before = $from?.nodeBefore;
            if (before && isImage(before)) {
              const src: string | undefined = before.attrs?.src;
              if (src) {
                fetch("/api/storage/delete-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: src }),
                }).catch(() => {});
              }
            }
          } else if (e.inputType === "deleteContentForward") {
            const after = $from?.nodeAfter;
            if (after && isImage(after)) {
              const src: string | undefined = after.attrs?.src;
              if (src) {
                fetch("/api/storage/delete-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: src }),
                }).catch(() => {});
              }
            }
          }

          // Don’t block the actual deletion—let PM handle it.
          return false;
        },
      },
    },
    immediatelyRender: false,
  });

  // Heal any lingering NodeSelection immediately after initial sync
  useEffect(() => {
    const onSynced = () => {
      const view = editor?.view;
      if (!view) return;
      const sel: any = view.state.selection;
      if (sel?.constructor?.name === "NodeSelection") {
        const pos = Math.min(sel.from ?? 0, view.state.doc.content.size);
        view.dispatch(
          view.state.tr.setSelection(TextSelection.create(view.state.doc, pos))
        );
      }
    };
    provider.on("synced", onSynced);
    return () => {
      provider.off("synced", onSynced);
    };
  }, [editor, provider]);

  // Clean up provider & editor on unmount
  useEffect(() => {
    return () => {
      try {
        provider.destroy();
      } catch {}
      try {
        editor?.destroy();
      } catch {}
    };
  }, [editor, provider]);

  // Optional: expose editor for quick manual inspection in console
  if (typeof window !== "undefined" && editor) {
    (window as any).editor = editor;
  }

  return (
    <div className={styles.editorWrapper}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
