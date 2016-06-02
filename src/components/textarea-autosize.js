require('./textarea-autosize.css')

import React, {createElement as el} from 'react'
import {sans} from './rebass-theme'

const containerStyle =
  { fontFamily: sans
  , fontSize: 12
  }

const labelStyle = {}

const labelStyleError =
  { color: 'red'
  }

const areaStyle =
  { fontFamily: sans
  , minHeight: '1.5rem'
  , display: 'block'
  , width: '100%'
  , padding: 0
  , resize: 'none'
  , color: 'inherit'
  , border: 0
  , borderBottom: '1px dotted rgba(0, 136, 238, .2)'
  , borderRadius: 0
  , outline: 'none'
  , overflow: 'hidden'
  , marginBottom: '0.75rem'
  }

function resize () {
  const { textarea } = this.refs
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}


class TextareaAutosize extends React.Component {
  constructor (props) {
    super(props)
    this.resize = resize.bind(this)
    this.state =
      { value: props.defaultValue
      , valid: true
      }
  }
  componentDidMount () {
    this.resize()
    if (this.props.defaultFocus === true) {
      this.refs.textarea.focus()
    }
  }
  componentDidUpdate () {
    this.resize()
  }
  render () {
    const {label, placeholder} = this.props
    const {value, valid} = this.state

    return el('div'
    , { className: `TextareaAutosize ${this.props.className}`
      , style: containerStyle
      }
    , el('label'
      , { style: (valid ? labelStyle : labelStyleError)
        }
      , label
      , this.renderLink()
      , el('textarea'
        , { ref: 'textarea'
          , style: areaStyle
          , value: value || ''
          , placeholder
          , onChange: this.onChange.bind(this)
          , rows: 1
          , onFocus: this.resize
          , onKeyDown: this.onKeyDown.bind(this)
          }
        )
      )
    )
  }
  renderLink () {
    const {label} = this.props
    if (label !== 'Link') return
    const {value, valid} = this.state
    if (!valid) {
      return el('span', {}, ' - must be a valid url starting with "http"')
    }
    return el('a'
    , { href: value
      , target: '_blank'
      , rel: 'noreferrer noopener'
      , style:
        { marginLeft: '0.5rem'
        , textDecoration: 'none'
        }
      }
    , 'open'
    )
  }
  onKeyDown (event) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event)
    }
    if (!this.props.multiline && event.key === 'Enter') {
      event.preventDefault()
    }
  }
  onChange (event) {
    const {validator, onChange} = this.props
    let valid = true
    let {value} = event.target
    if (!this.props.multiline) {
      value = value
        .replace(/\r\n/g, ' ')
        .replace(/[\r\n]/g, ' ')
    }
    if (validator) {
      valid = validator(value)
    }
    this.setState({value, valid})
    if (valid && onChange) {
      onChange(event)
    }
    this.resize()
  }
}
TextareaAutosize.propTypes =
  { defaultValue: React.PropTypes.string
  , defaultFocus: React.PropTypes.bool
  , label: React.PropTypes.string
  , placeholder: React.PropTypes.string
  , onChange: React.PropTypes.func
  , multiline: React.PropTypes.bool
  , validator: React.PropTypes.func
  }
TextareaAutosize.defaultProps =
  { multiline: false
  }
export default React.createFactory(TextareaAutosize)
