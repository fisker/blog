const _ = (function() {
  const _ = global._ || (global._ = {})

  _.now = Date.now || function() {
    return + new Date()
  }

  _.require = require
  _.Promise = Promise

  const _toString = Object.prototype.toString
  _.type = function(obj) {
    return _toString.call(obj).slice(7, -1)
  }

  const _slice = Array.prototype.slice
  _.toArray = Array.from || function(obj) {
    return _slice.call(obj)
  }

  _.isArray = Array.isArray || function(obj) {
    return _.type(obj) === 'Array'
  }

  _.isArrayLike = function(obj) {
    return _.isArray(obj) ||
      (obj && _.type(obj.length) === 'Number' && parseInt(obj.length, 10) === obj.length)
  }

  const _forEach = Array.prototype.forEach || function(fn) {
    for (let i = 0; i < this.length; i++) {
      fn.call(this, this[i], i, this)
    }
  }

  const _forInEach = function(obj, fn) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn.call(obj, obj[key], key, obj)
      }
    }
  }

  _.forIn = _forInEach

  _.forEach = function(obj, fn) {
    (_.isArrayLike(obj) ? _forEach : _forInEach).call(obj, fn)
  }

  const _map = Array.prototype.map || function(fn) {
    const arr = []
    for (let i = 0; i < this.length; i++) {
      arr[i] = fn.call(this, this[i], i, this)
    }

    return arr
  }

  _.map = function(obj, fn) {
    return _map.call(obj, fn)
  }

  const _filter = Array.prototype.filter || function(fn) {
    const filted = []
    for (let i = 0; i < this.length; i++) {
      let result = fn.call(this, this[i], i, this)
      if (result) {
        filted.push(this[i])
      }
    }
    return filted
  }

  _.filter = function(obj, fn) {
    return _filter.call(obj, fn)
  }

  _.assign = Object.assign || function(target) {
    _.forEach(_slice.call(arguments, 1), function(source) {
      _.forEach(source, function(value, key) {
        target[key] = value
      })
    })

    return target
  }

  _.hash = (function() {
    function parseHash(hash) {
      hash = hash.slice(2)
      const pieces = hash ? hash.split('/') : []
      const data = {}

      for (let i = 0; i < pieces.length; i += 2) {
        data[decodeURIComponent(pieces[i])] = decodeURIComponent(
          pieces[i + 1] || ''
        )
      }

      return data
    }

    function hashLink(data) {
      const hash = []
      _forInEach(data, function(value, key) {
        hash.push(encodeURIComponent(key) + '/' + encodeURIComponent(value))
      })

      return '#/' + hash.sort().join('/')
    }

    return {
      parse: parseHash,
      build: hashLink
    }
  })()

  _.search = (function() {
    function buildQuery(data) {
      const search = []
      _forInEach(data, function(value, key) {
        search.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
      })

      return search.join('&')
    }

    return {
      build: buildQuery
    }
  })()

  // const templateCompiled = {}
  // const templateOptions = {
  //   _: _,
  //   config: config
  // }

  // _.template = (function(template) {
  //   if (templateCompiled[template]) {
  //     return templateCompiled[template]
  //   }
  //   return require('lodash.template')
  //     .then(function(engine) {
  //       return templateCompiled[template] = engine(template, templateOptions)
  //     })
  // })

  // _.render = function(template) {
  //   return function(data) {
  //     return Promise.resolve(_.template(template)).then(function(compiled) {
  //       return compiled(data)
  //     })
  //   }
  // }

  _.localforage = (function() {
    function setItem(key, value) {
      return require('localforage').then(function(localforage) {
        return localforage.setItem.call(localforage, key, value)
      })
    }

    function getItem(key) {
      return require('localforage').then(function(localforage) {
        return localforage.getItem.call(localforage, key)
      })
    }

    return {
      setItem: setItem,
      getItem: getItem
    }
  })()

  _.markdown = function(code, options) {
    return Promise.all([require('marked'), require('highlight-js')]).then(function(mods) {
      const marked = mods[0]
      const highlight = mods[1]
      marked.setOptions({
        highlight: function(code, lang) {
          if (lang && highlight.getLanguage(lang)) {
            return highlight.highlight(lang, code).value
          } else {
            return highlight.highlightAuto(code).value
          }
        }
      })

      return marked(code, options)
    })
  }

  const escapeHtmlChar = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }
  const reUnescapedHtml = /[&<>"'`]/g
  _.escape = function(s) {
    return (s + '').replace(reUnescapedHtml, function(c) {
      return escapeHtmlChar[c]
    })
  }

  return _
})()
