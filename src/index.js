import {ProseMirror} from 'prosemirror/src/edit/main'
import {Pos, Node} from 'prosemirror/src/model'

import 'prosemirror/src/inputrules/autoinput'
import 'prosemirror/src/menu/tooltipmenu'
import 'prosemirror/src/collab'

import GridSchema from './schema'
import GridToDoc from './convert/grid-to-doc'
import DocToGrid from './convert/doc-to-grid'


export default class Ed {
  constructor (options) {
    if (!options.container) options.container = document.body
    this.container = options.container

    this.pm = new ProseMirror({
      place: this.container,
      autoInput: true,
      tooltipMenu: {emptyBlockMenu: true},
      menuBar: {float: true},
      schema: GridSchema
    })

    if (options.onChange) {
      this.pm.on('change', options.onChange)
    }

    if (options.content) {
      this.content = options.content
    }
  }
  teardown () {
    this.pm.off('change')
    this.container.innerHTML = ''
  }
  set content (content) {
    // Cache the content object that we originally get from the API.
    // We'll need the content and block metadata later, in `get content`.
    this._content = content
    let doc = GridToDoc(content)
    // Cache selection to restore after DOM update
    let selection = this.pm.selection
    // Populate ProseMirror
    this.pm.setDoc(doc, selection)
  }
  get content () {
    let dom = this.pm.content.children
    let doc = this.pm.getContent()
    return DocToGrid(dom, doc, this._content)
  }
}
