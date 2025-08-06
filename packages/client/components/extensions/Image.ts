
import { Node, mergeAttributes } from "@tiptap/core"

// ✅ Add Tiptap command typings
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; width?: string }) => ReturnType
    }
  }
}

export const Image = Node.create({
  name: "image",

  group: "block",
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      width: {
        default: "300",
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: "img[src]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})