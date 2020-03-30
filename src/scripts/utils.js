const _ = (function () {
  const _ = global._ || (global._ = {})

  _.now =
    Date.now ||
    function () {
      return Number(new Date())
    }

  _.require = require
  _.Promise = Promise

  const _toString = Object.prototype.toString
  _.type = function (object) {
    return _toString.call(object).slice(7, -1)
  }

  const _slice = Array.prototype.slice
  _.toArray =
    Array.from ||
    function (object) {
      return _slice.call(object)
    }

  _.isArray =
    Array.isArray ||
    function (object) {
      return _.type(object) === 'Array'
    }

  _.isArrayLike = function (object) {
    return (
      _.isArray(object) ||
      (object &&
        _.type(object.length) === 'Number' &&
        Number.parseInt(object.length, 10) === object.length)
    )
  }

  const _forEach =
    Array.prototype.forEach ||
    function (fn) {
      for (let i = 0; i < this.length; i += 1) {
        fn.call(this, this[i], i, this)
      }
    }

  const hasOwnProperty = function (value, key) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      Object.prototype.hasOwnProperty.call(value, key)
    )
  }

  const _forInEach = function (object, fn) {
    for (const key in object) {
      if (hasOwnProperty(object, key)) {
        fn.call(object, object[key], key, object)
      }
    }
  }

  _.forIn = _forInEach

  _.forEach = function (object, fn) {
    ;(_.isArrayLike(object) ? _forEach : _forInEach).call(object, fn)
  }

  const _map =
    Array.prototype.map ||
    function (fn) {
      const array = []
      for (let i = 0; i < this.length; i += 1) {
        array[i] = fn.call(this, this[i], i, this)
      }

      return array
    }

  _.map = function (object, fn) {
    return _map.call(object, fn)
  }

  const _filter =
    Array.prototype.filter ||
    function (fn) {
      const filted = []
      for (let i = 0; i < this.length; i += 1) {
        const result = fn.call(this, this[i], i, this)
        if (result) {
          filted.push(this[i])
        }
      }
      return filted
    }

  _.filter = function (object, fn) {
    return _filter.call(object, fn)
  }

  _.assign =
    Object.assign ||
    function (target) {
      // eslint-disable-next-line prefer-rest-params
      _.forEach(_slice.call(arguments, 1), function (source) {
        _.forEach(source, function (value, key) {
          target[key] = value
        })
      })

      return target
    }

  _.hash = (function () {
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
      _forInEach(data, function (value, key) {
        hash.push(`${encodeURIComponent(key)}/${encodeURIComponent(value)}`)
      })

      return `#/${hash.sort().join('/')}`
    }

    return {
      parse: parseHash,
      build: hashLink,
    }
  })()

  _.search = (function () {
    function buildQuery(data) {
      const search = []
      _forInEach(data, function (value, key) {
        search.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      })

      return search.join('&')
    }

    return {
      build: buildQuery,
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

  _.localforage = (function () {
    function setItem(key, value) {
      return require('localforage').then(function (localforage) {
        return localforage.setItem(key, value)
      })
    }

    function getItem(key) {
      return require('localforage').then(function (localforage) {
        return localforage.getItem(key)
      })
    }

    return {
      setItem,
      getItem,
    }
  })()

  _.markdown = function (code, options) {
    // eslint-disable-next-line import/no-unresolved
    return Promise.all([require('marked'), require('highlight-js')]).then(
      function (mods) {
        const marked = mods[0]
        const highlight = mods[1]
        marked.setOptions({
          highlight(code, lang) {
            if (lang && highlight.getLanguage(lang)) {
              return highlight.highlight(lang, code).value
            }
            return highlight.highlightAuto(code).value
          },
        })

        return marked(code, options)
      }
    )
  }

  const escapeHtmlChar = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
  }
  const reUnescapedHtml = /["&'<>`]/g
  _.escape = function (s) {
    return `${s}`.replace(reUnescapedHtml, function (c) {
      return escapeHtmlChar[c]
    })
  }

  return _
})()
