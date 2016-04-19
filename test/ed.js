import {expect} from 'chai'

import Ed from '../src/ed'


describe('Ed', function () {
  let mount, ed

  describe('Required mounting options', function () {
    beforeEach(function () {
      mount = document.createElement('div')
      document.body.appendChild(mount)
    })
    afterEach(function () {
      mount.parentNode.removeChild(mount)
    })

    it('throws without options', function () {
      function no_options () {
        ed = new Ed()
      }
      expect(no_options).to.throw('Missing options')
    })
    it('throws without options.initialContent', function () {
      function no_initialContent () {
        ed = new Ed(
          { container: mount
          , initialContent: null
          , onChange: function () {}
          , onShareUrl: function () {}
          , onShareFile: function () {}
          }
        )
      }
      expect(no_initialContent).to.throw('Missing options.initialContent')
    })
    it('throws without options.onChange', function () {
      function no_onChange () {
        ed = new Ed(
          { container: mount
          , initialContent: []
          , onChange: null
          , onShareUrl: function () {}
          , onShareFile: function () {}
          }
        )
      }
      expect(no_onChange).to.throw('Missing options.onChange')
    })
    it('throws without options.onShareUrl', function () {
      function no_onShareUrl () {
        ed = new Ed(
          { container: mount
          , initialContent: []
          , onChange: function () {}
          , onShareUrl: null
          , onShareFile: function () {}
          }
        )
      }
      expect(no_onShareUrl).to.throw('Missing options.onShareUrl')
    })
    it('throws without options.onShareFile', function () {
      function no_onShareFile () {
        ed = new Ed(
          { container: mount
          , initialContent: []
          , onChange: function () {}
          , onShareUrl: function () {}
          , onShareFile: null
          }
        )
      }
      expect(no_onShareFile).to.throw('Missing options.onShareFile')
    })
    it('throws without options.container', function () {
      function no_container () {
        ed = new Ed(
          { container: null
          , initialContent: []
          , onChange: function () {}
          , onShareUrl: function () {}
          , onShareFile: function () {}
          }
        )
      }
      expect(no_container).to.throw('Missing options.container')
    })
    it('calls options.onMount', function (done) {
      ed = new Ed(
        { container: mount
        , initialContent: []
        , onChange: function () {}
        , onShareUrl: function () {}
        , onShareFile: function () {}
        , onMount: function () { done() }
        }
      )
    })
  })

  describe('Content mounting and merging', function () {
    const fixture =
      [ {type: 'h1', html: '<h1>Title</h1>'}
      , {type: 'text', html: '<p>Text 1</p>'}
      , {type: 'text', html: '<p>Text 2</p>'}
      ]

    beforeEach(function (done) {
      mount = document.createElement('div')
      document.body.appendChild(mount)
      ed = new Ed(
        { container: mount
        , initialContent: fixture
        , onChange: function () {}
        , onShareUrl: function () {}
        , onShareFile: function () {}
        }
      )
      done()
    })
    afterEach(function () {
      ed.teardown()
      mount.parentNode.removeChild(mount)
    })

    it('on mount it has expected editable html structure', function () {
      const children = ed.editableView.pm.content.children
      expect(children.length).to.equal(3)
      expect(children[0].textContent).to.equal('Title')
      expect(children[0].nodeName).to.equal('H1')
      expect(children[1].textContent).to.equal('Text 1')
      expect(children[1].nodeName).to.equal('P')
      expect(children[2].textContent).to.equal('Text 2')
      expect(children[2].nodeName).to.equal('P')
    })

    it('it has expected pm document', function () {
      const content = ed.editableView.pm.doc.content.content
      expect(content.length).to.equal(3)
      expect(content[0].textContent).to.equal('Title')
      expect(content[0].type.name).to.equal('heading')
      expect(content[1].textContent).to.equal('Text 1')
      expect(content[1].type.name).to.equal('paragraph')
      expect(content[2].textContent).to.equal('Text 2')
      expect(content[2].type.name).to.equal('paragraph')
    })

    it('inject placeholder blocks via setContent', function () {
      ed.setContent(
        [ {type: 'h1', html: '<h1>Title</h1>'}
        , {id: '0000', type: 'placeholder'}
        , {id: '0001', type: 'placeholder'}
        , {type: 'text', html: '<p>Text 1</p>'}
        , {type: 'text', html: '<p>Text 2</p>'}
        ]
      )
      expect(ed._foldMedia).to.equal('0000')
      const content = ed.editableView.pm.doc.content.content
      expect(content.length).to.equal(4)
      expect(content[0].textContent).to.equal('Title')
      expect(content[0].type.name).to.equal('heading')
      expect(content[1].textContent).to.equal('')
      expect(content[1].type.name).to.equal('media')
      expect(content[1].attrs.id).to.equal('0001')
      expect(content[1].attrs.type).to.equal('placeholder')
      expect(content[2].textContent).to.equal('Text 1')
      expect(content[2].type.name).to.equal('paragraph')
      expect(content[3].textContent).to.equal('Text 2')
      expect(content[3].type.name).to.equal('paragraph')
    })

    it('inject placeholder blocks via insertPlaceholders', function () {
      const ids = ed.insertPlaceholders(1, 2)
      expect(ids.length).to.equal(2)

      expect(ed._foldMedia).to.equal(ids[0])
      const content = ed.editableView.pm.doc.content.content
      expect(content.length).to.equal(4)
      expect(content[0].textContent).to.equal('Title')
      expect(content[0].type.name).to.equal('heading')
      expect(content[1].textContent).to.equal('')
      expect(content[1].type.name).to.equal('media')
      expect(content[1].attrs.id).to.equal(ids[1])
      expect(content[1].attrs.type).to.equal('placeholder')
      expect(content[2].textContent).to.equal('Text 1')
      expect(content[2].type.name).to.equal('paragraph')
      expect(content[3].textContent).to.equal('Text 2')
      expect(content[3].type.name).to.equal('paragraph')
    })

    it('replace text with placeholder block', function () {
      ed._replaceBlock(1, {id: '0000', type: 'placeholder'})

      expect(ed._foldMedia).to.equal('0000')
      const content = ed.editableView.pm.doc.content.content
      expect(content.length).to.equal(2)
      expect(content[0].textContent).to.equal('Title')
      expect(content[0].type.name).to.equal('heading')
      expect(content[1].textContent).to.equal('Text 2')
      expect(content[1].type.name).to.equal('paragraph')
    })

    it('replace placeholder with image block, should correctly merge', function () {
      ed._replaceBlock(1, {id: '0000', type: 'placeholder'})
      ed.setContent([{id: '0000', type: 'image', cover: {src: '...'}}])

      expect(ed._foldMedia).to.equal('0000')
      const content = ed.editableView.pm.doc.content.content
      expect(content.length).to.equal(2)
      expect(content[0].textContent).to.equal('Title')
      expect(content[0].type.name).to.equal('heading')
      expect(content[1].textContent).to.equal('Text 2')
      expect(content[1].type.name).to.equal('paragraph')
    })

    it('replace multiple placeholders, should correctly merge', function () {
      const ids = ed.insertPlaceholders(1, 2)
      ed.setContent(
        [ {id: ids[0], type: 'image', cover: {src: '...a'}}
        , {id: ids[1], type: 'image', cover: {src: '...b'}}
        ]
      )

      expect(ed._foldMedia).to.equal(ids[0])
      const content = ed.editableView.pm.doc.content.content
      expect(content.length).to.equal(4)
      expect(content[0].textContent).to.equal('Title')
      expect(content[0].type.name).to.equal('heading')
      expect(content[1].textContent).to.equal('')
      expect(content[1].type.name).to.equal('media')
      expect(content[1].attrs.type).to.equal('image')
      expect(content[1].attrs.id).to.equal(ids[1])
      expect(content[2].textContent).to.equal('Text 1')
      expect(content[2].type.name).to.equal('paragraph')
      expect(content[3].textContent).to.equal('Text 2')
      expect(content[3].type.name).to.equal('paragraph')
    })

    it('cancels placeholder', function () {
      const ids = ed.insertPlaceholders(1, 1)
      ed._placeholderCancel(ids[0])

      expect(ed._foldMedia).to.be.null
      const content = ed.editableView.pm.doc.content.content
      expect(content.length).to.equal(3)
      expect(content[0].textContent).to.equal('Title')
      expect(content[0].type.name).to.equal('heading')
      expect(content[1].textContent).to.equal('Text 1')
      expect(content[1].type.name).to.equal('paragraph')
      expect(content[2].textContent).to.equal('Text 2')
      expect(content[2].type.name).to.equal('paragraph')
    })

    describe('Getting content', function () {
      it('outputs content with placeholders', function () {
        const ids = ed.insertPlaceholders(1, 2)
        const content = ed.getContent()
        const expected =
          [ { id: ids[0]
            , type: 'placeholder'
            , metadata: {starred: true}
            }
          , { type: 'h1', html: '<h1>Title</h1>' }
          , { id: ids[1]
            , type: 'placeholder'
            , metadata: {}
            }
          , { type: 'text', html: '<p>Text 1</p>' }
          , { type: 'text', html: '<p>Text 2</p>' }
          ]
        expect(content).to.deep.equal(expected)
      })

      it('outputs content with replaced placeholders', function () {
        const ids = ed.insertPlaceholders(1, 2)
        ed.setContent(
          [ { id: ids[0]
            , type: 'image'
            , cover: {src: '...a.jpg'}
            }
          , { id: ids[1]
            , type: 'image'
            , cover: {src: '...b.jpg'}
            }
          ]
        )
        const content = ed.getContent()
        const expected =
          [ { id: ids[0]
            , type: 'image'
            , cover: {src: '...a.jpg'}
            , metadata: {starred: true}
            , html: '<img src="...a.jpg">'
            }
          , { type: 'h1', html: '<h1>Title</h1>' }
          , { id: ids[1]
            , type: 'image'
            , cover: {src: '...b.jpg'}
            , html: '<img src="...b.jpg">'
            }
          , { type: 'text', html: '<p>Text 1</p>' }
          , { type: 'text', html: '<p>Text 2</p>' }
          ]
        expect(content).to.deep.equal(expected)
      })

      it('does not have cancelled placeholder', function () {
        const ids = ed.insertPlaceholders(1, 1)
        ed._placeholderCancel(ids[0])
        const content = ed.getContent()
        const expected =
          [ { type: 'h1', html: '<h1>Title</h1>' }
          , { type: 'text', html: '<p>Text 1</p>' }
          , { type: 'text', html: '<p>Text 2</p>' }
          ]
        expect(content).to.deep.equal(expected)
      })

      it('does not have removed block', function () {
        const ids = ed.insertPlaceholders(1, 1)
        ed._removeMediaBlock(ids[0])
        const content = ed.getContent()
        const expected =
          [ { type: 'h1', html: '<h1>Title</h1>' }
          , { type: 'text', html: '<p>Text 1</p>' }
          , { type: 'text', html: '<p>Text 2</p>' }
          ]
        expect(content).to.deep.equal(expected)
      })
    })
  })

  describe('The Fold', function () {
    const fixture =
      [ {id: '0000', type: 'image', cover: {src: '..j.jpg'}}
      , {type: 'text', html: '<p>Text 1</p>'}
      ]

    beforeEach(function (done) {
      mount = document.createElement('div')
      document.body.appendChild(mount)
      ed = new Ed(
        { container: mount
        , initialContent: fixture
        , onChange: function () {}
        , onShareUrl: function () {}
        , onShareFile: function () {}
        }
      )
      done()
    })
    afterEach(function () {
      ed.teardown()
      mount.parentNode.removeChild(mount)
    })

    describe('Mounting', function () {
      it('splits content correctly', function () {
        const {initialMedia, initialContent} = ed.app.props
        expect(initialMedia).to.deep.equal(fixture[0])
        expect(initialContent).to.deep.equal([fixture[1]])
      })
    })

    describe('Getting content', function () {
      it('outputs expected content', function () {
        const content = ed.getContent()
        const expected =
          [ { id: '0000'
            , type: 'image'
            , cover: {src: '..j.jpg'}
            , metadata: {starred: true}
            , html: '<img src="..j.jpg">'
            }
          , {type: 'text', html: '<p>Text 1</p>'}
          ]
        expect(content).to.deep.equal(expected)
      })
    })
  })

  describe('Command interface', function () {
    let mount, ed
    const fixture =
      [ {type: 'h1', html: '<h1>Title</h1>'}
      , {type: 'text', html: '<p><a href="moo">link</a></p>'}
      ]

    afterEach(function () {
      ed.teardown()
      mount.parentNode.removeChild(mount)
    })

    it('returns commands on mount', function (done) {
      mount = document.createElement('div')
      document.body.appendChild(mount)

      function onCommandsChanged (commands) {
        expect(commands['heading:make1']).to.equal('disabled')
        expect(commands['paragraph:make']).to.equal('inactive')
        done()
      }

      ed = new Ed(
        { container: mount
        , initialContent: fixture
        , onChange: function () {}
        , onShareUrl: function () {}
        , onShareFile: function () {}
        , onCommandsChanged
        }
      )
    })

    it('correctly executes command', function (done) {
      mount = document.createElement('div')
      document.body.appendChild(mount)

      function onMount () {
        ed.execCommand('paragraph:make')
        const content = ed.getContent()
        expect(content[0].type).to.equal('text')
        done()
      }

      ed = new Ed(
        { container: mount
        , initialContent: fixture
        , onChange: function () {}
        , onShareUrl: function () {}
        , onShareFile: function () {}
        , onMount
        }
      )
    })

    it('correctly triggers onShareFile', function (done) {
      mount = document.createElement('div')
      document.body.appendChild(mount)

      function onMount () {
        ed.execCommand('ed_upload_image')
      }

      function onShareFile (index) {
        expect(index).to.equal(0)
        done()
      }

      ed = new Ed(
        { container: mount
        , initialContent: fixture
        , onChange: function () {}
        , onShareUrl: function () {}
        , onShareFile
        , onMount
        }
      )
    })
  })
})
