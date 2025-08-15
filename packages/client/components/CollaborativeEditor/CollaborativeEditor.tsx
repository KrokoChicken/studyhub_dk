/*

// components/CollaborativeEditor/CollaborativeEditor.tsx

"use client"; // Enables client-side rendering in Next.js for this component

// React and TipTap imports
import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

// Core TipTap extensions for basic editing
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

// Real-time collaboration extensions
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

// Custom extensions
import { Image } from "../extensions/Image"; // Custom image extension
import { SafeSelectionPlugin } from "../extensions/SafeSelectionPlugin"; // Prevents selection-related crashes
import { uploadToSupabase } from "@/lib/uploadtoSupabase"; // Utility to upload images to Supabase
import * as Y from "yjs"; // Yjs CRDT library for real-time syncing
import { HocuspocusProvider } from "@hocuspocus/provider"; // WebSocket provider for Yjs
import { ImageStorageWatcher } from "../extensions/ImageStorageWatcher"; // Custom plugin to watch for image state
import { TextSelection } from "@tiptap/pm/state"; // TipTap/ProseMirror selection helper
import styles from "./CollaborativeEditor.module.css"; // CSS module for styling

// Increment this when the schema or editor behavior changes, to avoid reusing incompatible Yjs states
const SCHEMA_VERSION = "v2";

// Props: roomId (for collaboration session), userName (for awareness)
export default function Editor({
  roomId,
  userName,
}: {
  roomId: string;
  userName: string;
}) {
  // Create a Yjs document, only once (on mount)
  const [ydoc] = useState(() => new Y.Doc());

  // Generate a random color for the user, memoized so it doesn’t change
  const color = useMemo(
    () =>
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0"),
    []
  );

  // Initialize HocuspocusProvider for syncing the Yjs document over WebSocket
  const provider = useMemo(() => {
    const instance = new HocuspocusProvider({
      url: "ws://localhost:1234", // WebSocket server URL
      name: roomId,
      document: ydoc, // The shared Yjs document
    });

    // Set local user info for collaborative cursors (awareness)
    instance.awareness!.setLocalStateField("user", { name: userName, color });

    return instance;
  }, [roomId, userName, color, ydoc]);

  const uploadAndInsertImage = async (file: File) => {
    try {
      const url = await uploadToSupabase(file);
      if (url && editor) {
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: file.name, width: "400" })
          .run();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // Initialize TipTap editor instance
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Image, // Custom image extension (non-selectable)
      ImageStorageWatcher, // Watches image insert/delete events
      Collaboration.configure({ document: ydoc, field: "prosemirror" }), // Enable real-time sync
      CollaborationCursor.configure({
        provider, // Real-time awareness provider
        user: { name: userName, color }, // Cursor appearance
      }),
      SafeSelectionPlugin, // Prevents crashing on bad selection states
    ],
    editorProps: {
      // Handle pasting images
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const file = items.find((i) => i.type.includes("image"))?.getAsFile();
        if (!file) return false;

        event.preventDefault(); // Prevent default paste
        uploadAndInsertImage(file);
        return true;
      },

      // Handle drag-and-drop images
      handleDrop(view, event) {
        const file = Array.from(event.dataTransfer?.files || []).find((f) =>
          f.type.includes("image")
        );
        if (!file) return false;

        event.preventDefault(); // Prevent default drop

        uploadAndInsertImage(file);
        return true;
      },

      // Handle delete image cleanup before deletion occurs
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

          // If deleting backward, check if there's an image before the cursor
          if (e.inputType === "deleteContentBackward") {
            const before = $from?.nodeBefore;
            if (before && isImage(before)) {
              const src: string | undefined = before.attrs?.src;
              if (src) {
                // Request to delete image from storage
                fetch("/api/storage/delete-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: src }),
                }).catch(() => {});
              }
            }
          }

          // If deleting forward, check if there's an image after the cursor
          else if (e.inputType === "deleteContentForward") {
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

          return false; // Allow the delete to proceed
        },
      },
    },
    immediatelyRender: false, // Disable rendering until content is ready
  });

  // After initial sync, fix potential crashing NodeSelections (like image selection)
  useEffect(() => {
    const onSynced = () => {
      const view = editor?.view;
      if (!view) return;

      const sel: any = view.state.selection;
      if (sel?.constructor?.name === "NodeSelection") {
        // Replace node selection with a safe text selection
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

  useEffect(() => {
    return () => {
      provider.destroy();
      editor?.destroy();
    };
  }, []); // ✅ only runs once on unmount

  // For debugging: expose the editor instance in browser console
  if (typeof window !== "undefined" && editor) {
    (window as any).editor = editor;
  }

  return (
    <div className={styles.editorWrapper}>
      {}
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
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { ImageStorageWatcher } from "../extensions/ImageStorageWatcher";
import { TextSelection } from "@tiptap/pm/state";
import styles from "./CollaborativeEditor.module.css";
import { useSession } from "next-auth/react";

export default function CollaborativeEditor({ roomId }: { roomId: string }) {
  const { data: session } = useSession();

  const [ydoc] = useState(() => new Y.Doc());

  const color = useMemo(
    () =>
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0"),
    []
  );

  const provider = useMemo(() => {
    return new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
      document: ydoc,
    });
  }, [roomId, ydoc]);

  // Set awareness when session is loaded
  useEffect(() => {
    const name =
      session?.user?.name ?? `Guest${Math.floor(Math.random() * 10000)}`;

    if (provider.awareness) {
      provider.awareness.setLocalStateField("user", { name, color });
    }
  }, [session, color, provider]);

  const uploadAndInsertImage = async (file: File) => {
    try {
      const url = await uploadToSupabase(file);
      if (url && editor) {
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: file.name, width: "400" })
          .run();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Image,
      ImageStorageWatcher,
      Collaboration.configure({ document: ydoc, field: "prosemirror" }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: session?.user?.name ?? "Guest",
          color,
        },
      }),
      SafeSelectionPlugin,
    ],
    editorProps: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const file = items.find((i) => i.type.includes("image"))?.getAsFile();
        if (!file) return false;

        event.preventDefault();
        uploadAndInsertImage(file);
        return true;
      },
      handleDrop(view, event) {
        const file = Array.from(event.dataTransfer?.files || []).find((f) =>
          f.type.includes("image")
        );
        if (!file) return false;

        event.preventDefault();
        uploadAndInsertImage(file);
        return true;
      },
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

          const targetNode =
            e.inputType === "deleteContentBackward"
              ? $from?.nodeBefore
              : $from?.nodeAfter;

          const src: string | undefined = targetNode?.attrs?.src;
          if (targetNode && isImage(targetNode) && src) {
            fetch("/api/storage/delete-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: src }),
            }).catch(() => {});
          }

          return false;
        },
      },
    },
    immediatelyRender: false,
  });

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

  useEffect(() => {
    return () => {
      provider.destroy();
      editor?.destroy();
    };
  }, []);

  if (typeof window !== "undefined" && editor) {
    (window as any).editor = editor;
  }

  return (
    <div className={styles.editorWrapper}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
