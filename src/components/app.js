require('./app.css')

import React, {createElement as el} from 'react'

import AddCover from './add-cover'
import AddFold from './add-fold'
import Editable from './editable'
import rebassTheme from './rebass-theme'
import WidgetEdit from './widget-edit'
import Modal from './modal'

import EdStore from '../store/ed-store'
import {edCommands} from '../menu/ed-menu'

import {version as PACKAGE_VERSION} from '../../package.json'


export default class App extends React.Component {
  constructor (props) {
    super(props)

    if (!props.initialContent) {
      throw new Error('Missing props.initialContent')
    }
    if (!props.onChange) {
      throw new Error('Missing props.onChange')
    }
    if (!props.onShareUrl) {
      throw new Error('Missing props.onShareUrl')
    }
    if (!props.onShareFile) {
      throw new Error('Missing props.onShareFile')
    }
    if (!props.onRequestCoverUpload) {
      throw new Error('Missing props.onRequestCoverUpload')
    }

    const {
      initialContent,
      onChange,
      onShareFile,
      onShareUrl,
      onRequestCoverUpload,
      onRequestLink,
      onDropFiles,
      onDropFileOnBlock,
      onCommandsChanged,
    } = props

    this._store = new EdStore(
      { initialContent,
        onChange,
        onShareFile,
        onShareUrl,
        onRequestCoverUpload,
        onRequestLink,
        onDropFiles,
        onDropFileOnBlock,
        onCommandsChanged,
      }
    )

    this.routeChange = this._store.routeChange.bind(this._store)

    this._store.on('media.block.edit.open', (blockID) => {
      // TODO expose prop for native editors?
      this.setState({blockToEdit: blockID})
      this.blur()
    })
    this.closeMediaBlockModal = () => {
      this.setState({blockToEdit: null})
    }
    this._store.on('media.block.edit.close', () => {
      this.closeMediaBlockModal()
    })

    this.state = {
      blockToEdit: null,
    }
  }
  componentDidMount () {
    this.boundOnDragOver = this.onDragOver.bind(this)
    window.addEventListener('dragover', this.boundOnDragOver)
    this.boundOnDrop = this.onDrop.bind(this)
    window.addEventListener('drop', this.boundOnDrop)
    if (this.props.onMount) {
      this.props.onMount(this)
    }
  }
  componentWillUnmount () {
    window.removeEventListener('dragover', this.boundOnDragOver)
    window.removeEventListener('drop', this.boundOnDrop)
  }
  getChildContext () {
    const {imgfloConfig, featureFlags} = this.props
    return ({
      imgfloConfig,
      featureFlags,
      rebass: rebassTheme,
      store: this._store,
    })
  }
  render () {
    return el('div',
      {className: 'Ed'},
      this.renderContent(),
      // this.renderHints(),
      this.renderModal()
    )
  }
  renderContent () {
    const { initialContent
      , menuBar
      , onShareFile
      , onShareUrl
      , onCommandsChanged
      , onDropFiles
      , widgetPath
      , coverPrefs } = this.props

    return el('div'
    , { className: 'Ed-Content',
      style:
      { zIndex: 1,
      },
    }
    , el(Editable
      , { initialContent,
        menuBar,
        onChange: this.routeChange,
        onShareFile,
        onShareUrl,
        onCommandsChanged,
        onDropFiles,
        widgetPath,
        coverPrefs,
      }
      )
    )
  }
  renderHints () {
    return el('div'
    , { className: 'Ed-Hints',
    }
    , el(AddCover, {})
    , el(AddFold, {})
    )
  }
  renderModal () {
    const {blockToEdit} = this.state
    if (!blockToEdit) return
    const initialBlock = this._store.getBlock(blockToEdit)
    if (!initialBlock) return
    const {coverPrefs} = this.props

    return el(Modal,
      {
        onClose: this.closeMediaBlockModal,
        child: el(WidgetEdit, {
          initialBlock,
          coverPrefs,
        }),
      }
    )
  }
  onDragOver (event) {
    // Listening to window
    event.preventDefault()
  }
  onDrop (event) {
    // Listening to window, for drops not caught by content
    event.preventDefault()
  }
  // Exposed methods
  getContent () {
    return this._store.getContent()
  }
  setContent (content) {
    this._store.setContent(content)
  }
  execCommand (commandName, attrs) {
    const item = edCommands[commandName]
    if (!item) {
      throw new Error('commandName not found')
    }
    const view = this.pm.editor
    item.spec.run(view.state, view.dispatch, view, attrs)
  }
  insertPlaceholders (index, count) {
    return this._store.insertPlaceholders(index, count)
  }
  updatePlaceholder () {
    throw new Error('updatePlaceholder is deprecated: use updateProgress')
  }
  updateProgress (id, metadata) {
    this._store.updateProgress(id, metadata)
  }
  setCoverPreview (id, src) {
    this._store.setCoverPreview(id, src)
  }
  setCover (id, cover) {
    this._store.setCover(id, cover)
  }
  indexOfFold () {
    return this._store.indexOfFold()
  }
  blur () {
    this.pm.editor.content.blur()
    window.getSelection().removeAllRanges()
  }
  get pm () {
    return this._store.pm
  }
  get version () {
    return PACKAGE_VERSION
  }
}
App.childContextTypes = {
  imgfloConfig: React.PropTypes.object,
  store: React.PropTypes.object,
  rebass: React.PropTypes.object,
  featureFlags: React.PropTypes.object,
}
App.propTypes = {
  initialContent: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired,
  onShareFile: React.PropTypes.func.isRequired,
  onShareUrl: React.PropTypes.func.isRequired,
  onDropFiles: React.PropTypes.func,
  onCommandsChanged: React.PropTypes.func,
  onRequestCoverUpload: React.PropTypes.func.isRequired,
  onRequestLink: React.PropTypes.func,
  imgfloConfig: React.PropTypes.object,
  widgetPath: React.PropTypes.string,
  coverPrefs: React.PropTypes.object,
  menuBar: React.PropTypes.bool,
  onMount: React.PropTypes.func,
  onDropFileOnBlock: React.PropTypes.func,
  featureFlags: React.PropTypes.object,
}
App.defaultProps = {
  widgetPath: './node_modules/',
  menuBar: true,
  coverPrefs: {},
  featureFlags: {},
}
