`npm start`

# ed

[![Build Status](https://travis-ci.org/the-grid/ed.svg?branch=master)](https://travis-ci.org/the-grid/ed)

Using [ProseMirror](http://prosemirror.net/) with data from [the Grid API](http://developer.thegrid.io/)

Demo: [the-grid.github.io/ed/](https://the-grid.github.io/ed/), [with fixture](https://the-grid.github.io/ed/#fixture)

The demo shows translating from ProseMirror to the the Grid API JSON and back.

## purpose

ProseMirror provides a high-level schema-based interface for interacting with `contenteditable`, taking care of that pain. Ed is focused on:

* Schema to translate between the Grid API data and ProseMirror doc type
* Coordinating widgets (block editors specialized by type) ([example](https://github.com/the-grid/ced))

# use

## Using as a React ⚛ component

Ed exposes [a React component](./src/components/app.js) by default.

``` jsx
import Ed from '@the-grid/ed'

export default class PostEditor extends React.Component {
  render() {
    return (
      <Ed key='item-uuid' initialContent={...} onChange={...} ... />
    )
  }
}
```

## Using as a stand-alone library in iframe or similar

Including `dist/build.js` in your page exposes `window.TheGridEd`

``` html
<script src='dist/build.js'></script>
```

There are `{mountApp, unmountApp}` helper methods
available to use like this:

``` js
  var container = document.querySelector('#ed')
  window.TheGridEd.mountApp(container, {
    // REQUIRED -- Content array from post
    initialContent: [],
    // OPTIONAL (default true) enable or disable the default menu
    menuBar: true,
    // REQUIRED -- Hit on every change
    onChange: function () {
      /* App can show "unsaved changes" in UI */
    },
    // REQUIRED
    onShareFile: function (index) {
      /* App triggers native file picker */
      /* App calls ed.insertPlaceholders(index, count) and gets array of ids back */
      /* App uploads files and sets status on placeholder blocks with ed.updateProgress */
      /* On upload / measurement finishing, app replaces placeholder blocks with ed.setContent */
    },
    // REQUIRED
    onRequestCoverUpload: function (id) {
      /* Similar to onShareFile, but hit with block id instead of index */
      /* App uploads files and sets status on blocks with ed.updateProgress */
      /* Once upload is complete, app hits ed.setCoverSrc */
    },
    // REQUIRED
    onShareUrl: function ({block, url}) {
      /* Ed made the placeholder with block id */
      /* App shares url with given block id */
      /* App updates status on placeholder blocks with ed.updateProgress */
      /* On share / measurement finishing, app replaces placeholder blocks with ed.setContent */
    },
    // REQUIRED
    onPlaceholderCancel: function (id) {
      /* Ed removed the placeholder if you call ed.getContent() now */
      /* App should cancel the share or upload */
    },
    // OPTIONAL
    onRequestLink: function (value) {
      /*
        If defined, Ed will _not_ show prompt for link
        If selection is url-like, value will be the selected string
        App can then call `ed.execCommand('link:toggle', {href, title})`
          Note: If that is called while command 'link:toggle' is 'active', it will remove the link, not replace it
      */
    },
    // OPTIONAL
    onDropFiles: function (index, files) {
      /* App calls ed.insertPlaceholders(index, files.length) and gets array of ids back */
      /* App uploads files and sets status on placeholder blocks with ed.updateProgress */
      /* On upload / measurement finishing, app replaces placeholder blocks with ed.setContent */
    },
    // OPTIONAL
    onDropFileOnBlock: function (id, file) {
      /* App uploads files and sets status on block with ed.updateProgress */
      /* Once upload is complete, app hits ed.setCoverSrc */
    },
    // OPTIONAL
    onMount: function (mounted) {
      /* Called once PM and widgets are mounted */
      window.ed = mounted
    },
    // OPTIONAL
    onCommandsChanged: function (commands) {
      /* Object with commandName keys and one of inactive, active, disabled */
    },
    // OPTIONAL -- imgflo image proxy config
    imgfloConfig: {
      server: 'https://imgflo.herokuapp.com/',
      key: 'key',
      secret: 'secret'
    },
    // OPTIONAL -- where iframe widgets live relative to app (or absolute)
    widgetPath: './node_modules/',
    // OPTIONAL -- site-wide settings to allow cover filter, crop, overlay; default true
    coverPrefs: {
      filter: false,
      crop: true,
      overlay: true
    },
    // OPTIONAL -- site or user flags to reduce functionality
    featureFlags: {
      edCta: false,
      edEmbed: false
    }
  })
  
  // Returns array of inserted placeholder ids
  ed.insertPlaceholders(index, count)
  
  // Update placeholder metadata
  // {status (string), progress (number 0-100), failed (boolean)}
  // metadata argument with {progress: null} will remove the progress bar
  ed.updateProgress(id, metadata)
  
  // Once block cover upload completes
  // `cover` is object with {src, width, height}
  ed.setCover(id, cover)

  // For placeholder or media block with uploading cover
  // `src` should be blob: or data: url of a
  // sized preview of the local image
  ed.setCoverPreview(id, src)

  // Returns content array
  // Expensive, so best to debounce and not call this on every change
  // Above the fold block is index 0, and starred
  ed.getContent()
  
  // Only inserts/updates placeholder blocks and converts placeholder blocks to media
  ed.setContent(contentArray)
  
  // Returns true if command applies successfully with current selection
  ed.execCommand(commandName)
```

Demo: [./demo/demo.js](./demo/demo.js)

## commands

With `onCommandsChanged` prop, app will get an object containing these commandName keys.
Values will be one of these strings: `inactive`, `active`, `disabled`, `flagged`.

Apps can apply formatting / editing commands with `ed.execCommand(commandName)`

Special case: `ed.execCommand('link:toggle', {href, title})` (title optional) to set link of current selection.

Supported `commandName` keys:

```
strong:toggle
em:toggle
link:toggle
paragraph:make
heading:make1
heading:make2
heading:make3
bullet_list:wrap
ordered_list:wrap
horizontal_rule:insert
lift
undo
redo
ed_upload_image
ed_add_code
ed_add_location
ed_add_userhtml
ed_add_cta
ed_add_quote
```

# dev

## server

`npm start` and open [http://localhost:8080/](http://localhost:8080/)

In development mode, webpack builds and serves the targets in memory from /webpack/

Changes will trigger a browser refresh.

## plugins

[Plugins](./src/plugins) are ES2015 classes with 2 required methods:

* `constructor (ed) {}` gets a reference to the main `ed`, where you can
  * listen to PM events: `ed.pm.on('draw', ...)`
  * and set up UI: `ed.pluginContainer.appendChild(...)`
* `teardown () {}` where all listeners and UI should be removed

## widgets

Widgets are mini-editors built to edit specific media types

### iframe

Run in iframe and communicate via postMessage 

Example: [ced - widget for code editing](https://github.com/the-grid/ced)

### native

Example: WIP

## styling

1. Primary: [Rebass](http://jxnblk.com/rebass/) defaults and [rebass-theme](./src/components/rebass-theme.js) for global overrides
2. Secondary: inlined JS `style` objects ([example](./src/components/textarea-autosize.js))
3. Deprecating: `require('./component-name.css')` style includes, but needed for some responsive hacks and ProseMirror overrides

## code style

Feross [standard](https://github.com/feross/standard#rules) checked by ESLint with `npm test` or `npm run lint`

* no unneeded semicolons
* no trailing spaces
* single quotes

To automatically fix easy stuff like trailing whitespace: `npm run lintfix`

## test

`npm test`

[Karma is set up](./karma.conf.js) to run tests in local Chrome and Firefox.

Tests will also run in mobile platforms via [BrowserStack](https://www.browserstack.com/), if you have these environment variables set up:

```
BROWSERSTACK_USERNAME
BROWSERSTACK_ACCESSKEY
```

## build

`npm run build`

Outputs minified dist/ed.js and copies widgets defined in [package.json](./package.json).

## deploying

`npm version patch` - style tweaks, hot bug fixes

`npm version minor` - adding features, backwards-compatible changes

`npm version major` - removing features, non-backwards-compatible changes

These shortcuts will run tests, tag, change package version, and push changes and tags to GH.

Travis will then publish new tags to [npm](https://www.npmjs.com/package/@the-grid/ed)
and build the demo to publish to [gh-pages](https://the-grid.github.io/ed/).