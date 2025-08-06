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
