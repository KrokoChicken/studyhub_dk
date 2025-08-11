/*
"use client";

import { useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

import styles from "./CollaborativeEditor.module.css";

export default function Editor({
  roomId,
  userName,
}: {
  roomId: string;
  userName: string;
}) {
  const [ydoc] = useState(() => new Y.Doc());

  const color = useMemo(() => {
    return (
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")
    );
  }, []);

  const provider = useMemo(() => {
    const instance = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
      document: ydoc,
    });

    instance.awareness!.setLocalStateField("user", {
      name: userName,
      color,
    });

    return instance;
  }, [roomId, userName, color, ydoc]);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: ydoc,
        field: "prosemirror",
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: userName,
          color,
        },
      }),
    ],
    immediatelyRender: false, // ✅ Prevent SSR hydration mismatch
  });

  return (
    <div className={styles.editorWrapper}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
*/

"use client";

import { useMemo, useState } from "react";
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

import { NodeSelection } from "@tiptap/pm/state";
import styles from "./CollaborativeEditor.module.css";

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

  const provider = useMemo(() => {
    const instance = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
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
      Image,

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
    },
    onTransaction({ editor }) {
      const sel = editor.state.selection;
      if (sel instanceof NodeSelection) {
        const node = editor.state.doc.nodeAt(sel.from);
        console.log("[collab] NodeSelection @", sel.from, "exists?", !!node);
      }
    },
    // 👇 add this to avoid SSR hydration mismatch in Next.js
    immediatelyRender: false,
  });

  if (typeof window !== "undefined" && editor) {
    (window as any).editor = editor;
  }

  return (
    <div className={styles.editorWrapper}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
