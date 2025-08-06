
// components/extensions/CustomTextStyles.ts
import { Mark, mergeAttributes, CommandProps } from '@tiptap/core'

export interface CustomTextStyleOptions {
  HTMLAttributes: Record<string, any>
}

export interface CustomTextStyleAttrs {
  fontSize?: string
  fontFamily?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customTextStyle: {
      setCustomTextStyle: (attrs: CustomTextStyleAttrs) => ReturnType
      unsetCustomTextStyle: () => ReturnType
    }
  }
}

export const CustomTextStyle = Mark.create<CustomTextStyleOptions>({
  name: 'customTextStyle',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {}
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          }
        },
      },
      fontFamily: {
        default: null,
        parseHTML: element => element.style.fontFamily || null,
        renderHTML: attributes => {
          if (!attributes.fontFamily) {
            return {}
          }
          return {
            style: `font-family: ${attributes.fontFamily}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[style]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCustomTextStyle:
        attrs =>
        ({ commands }) => {
          return commands.setMark(this.name, attrs)
        },
      unsetCustomTextStyle:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

