"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "../extensions/Image";
import { CustomTextStyle } from "../extensions/CustomTextStyles";
import DropCursor from "../extensions/DropCursor";
import { uploadToSupabase } from "@/lib/uploadtoSupabase";
import { useEffect, useState } from "react";
import type { AnyExtension } from "@tiptap/core";
import styles from "./TiptapEditor.module.css";

// Extend chaining type for custom + built-in commands
type ExtendedChainedCommands = ReturnType<Editor["chain"]> & {
  toggleBold: () => ExtendedChainedCommands;
  toggleItalic: () => ExtendedChainedCommands;
  toggleStrike: () => ExtendedChainedCommands;
  setCustomTextStyle: (attrs: {
    fontSize?: string;
    fontFamily?: string;
  }) => ExtendedChainedCommands;
  unsetCustomTextStyle: () => ExtendedChainedCommands;
};

const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
];
const FONT_FAMILIES = [
  "Arial",
  "Georgia",
  "Tahoma",
  "Times New Roman",
  "Verdana",
  "monospace",
];

type Props = {
  content: string;
  onChange: (html: string) => void;
};

export default function TiptapEditor({ content, onChange }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const editor = useEditor({
    content,
    extensions: [
      StarterKit,
      Image,
      CustomTextStyle,
      DropCursor,
    ] as AnyExtension[],
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose focus:outline-none max-w-full min-h-[400px] ${
          theme === "dark" ? styles.dark : styles.light
        }`,
      },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const file =
          items.find((item) => item.type.includes("image"))?.getAsFile() ??
          undefined;
        if (file) {
          uploadToSupabase(file).then((url) => {
            if (url && editor) {
              (editor.chain() as ExtendedChainedCommands)
                .focus()
                .setImage({ src: url, alt: file.name, width: "400" })
                .run();
            }
          });
          return true;
        }
        return false;
      },
      handleDrop(view, event) {
        const file =
          Array.from(event.dataTransfer?.files || []).find((f) =>
            f.type.includes("image")
          ) ?? undefined;
        if (file) {
          uploadToSupabase(file).then((url) => {
            if (url && editor) {
              (editor.chain() as ExtendedChainedCommands)
                .focus()
                .setImage({ src: url, alt: file.name, width: "400" })
                .run();
            }
          });
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const chain = editor.chain() as ExtendedChainedCommands;

  return (
    <>
      {/* Theme toggle */}
      <div style={{ marginBottom: "1rem", textAlign: "right" }}>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          style={{
            cursor: "pointer",
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid #2563eb",
            backgroundColor: theme === "light" ? "white" : "#2563eb",
            color: theme === "light" ? "#2563eb" : "white",
            fontWeight: "600",
          }}
          title="Toggle light/dark theme"
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      {/* Toolbar */}
      <div
        className={`${styles.toolbar} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div className={styles.group}>
          <button
            onClick={() => chain.focus().toggleBold().run()}
            className={editor.isActive("bold") ? styles.active : ""}
            title="Bold (Ctrl+B)"
          >
            <b>B</b>
          </button>
          <button
            onClick={() => chain.focus().toggleItalic().run()}
            className={editor.isActive("italic") ? styles.active : ""}
            title="Italic (Ctrl+I)"
          >
            <i>I</i>
          </button>
          <button
            onClick={() => chain.focus().toggleStrike().run()}
            className={editor.isActive("strike") ? styles.active : ""}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <select
          className={styles.select}
          value={editor.getAttributes("customTextStyle").fontSize || ""}
          onChange={(e) => {
            const fontSize = e.target.value || null;
            if (fontSize) {
              chain.focus().setCustomTextStyle({ fontSize }).run();
            } else {
              chain.focus().unsetCustomTextStyle().run();
            }
          }}
          title="Font Size"
        >
          <option value="">Font Size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={editor.getAttributes("customTextStyle").fontFamily || ""}
          onChange={(e) => {
            const fontFamily = e.target.value || null;
            if (fontFamily) {
              chain.focus().setCustomTextStyle({ fontFamily }).run();
            } else {
              chain.focus().unsetCustomTextStyle().run();
            }
          }}
          title="Font Family"
        >
          <option value="">Font Family</option>
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <button
          onClick={() => chain.focus().unsetCustomTextStyle().run()}
          title="Clear Formatting"
        >
          ✖
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={`${styles.editor} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      />
    </>
  );
}
