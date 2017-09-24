
;(function() {
  const global = Function('return this')()
  const config = <%= JSON.stringify(config)%>
  const require = global.require

  require.config({
    paths: {
      'localforage': config.paths['localforage'].slice(0, -3),
      'es6-promise': config.paths['es6-promise'].slice(0, -3),
      'highlight-js': config.paths['highlight-js'].slice(0, -3),
      'marked': config.paths['marked'].slice(0, -3),
    }
  })

  let Promise = global.Promise
  ;(function(callback) {
    <%= files['./src/scripts/polyfill-promise.js'] %>
  })
  (function(require) {
    const document = global.document

    <%= files['./src/scripts/utils.js'] %>
    // avoid use with in strict mode
    <%
    var templatesCode = files['./build/temp/templates.js']
    var banner = ''
    var code = templatesCode.trim()

    if (templatesCode.slice(0, 2) == '/*') {
      var arr = templatesCode.split('*/')
      banner = arr[0]
      if (banner) {
        banner = banner + '*/'
      }

      code = templatesCode.slice(banner.length).trim()
    }

    code = 'return ' + code
    code = code.replace(/^return\s*;/, 'return ')
    %>
    <%= banner %>
    const templates = Function('config', <%= JSON.stringify(code) %>)(config)

    <%= files['./src/scripts/github-api.js'] %>
    <%= files['./src/scripts/index.js'] %>
    <%= files['./src/scripts/article.js'] %>
    <%= files['./src/scripts/main.js'] %>

    app.run()
  })
})()
