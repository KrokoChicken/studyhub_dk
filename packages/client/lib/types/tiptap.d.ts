// types/tiptap.d.ts
import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bold: {
      toggleBold: () => ReturnType;
    };
    italic: {
      toggleItalic: () => ReturnType;
    };
    strike: {
      toggleStrike: () => ReturnType;
    };
  }
}