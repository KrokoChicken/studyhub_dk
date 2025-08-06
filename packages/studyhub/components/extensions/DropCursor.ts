import { Extension } from '@tiptap/core'
import { dropCursor } from 'prosemirror-dropcursor'

const DropCursor = Extension.create({
  name: 'dropCursor',

  addProseMirrorPlugins() {
    return [dropCursor({ class: 'dropCursor' })]
  },
})

export default DropCursor