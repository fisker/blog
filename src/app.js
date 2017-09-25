
;(function() {
  const global = Function('return this')()
  const config = <%= JSON.stringify(config.$js, null, 2)%>
  const require = global.require

  require.config(config.require)

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
