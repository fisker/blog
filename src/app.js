const window = Function('return this')()
const now = Date.now || function() {
  return + new Date()
}
const config = require('../blog-config.js')
const localforage = require('localforage')
const template = require('lodash.template')
const Promise = window.Promise || require('es6-promise').Promise
const assign = Object.assign || require('object.assign')
const highlight = require('highlight.js')

// markdown-it 711kb
// const markdownIt = require('markdown-it')({
//   highlight: function(code, lang) {
//     if (lang && highlight.getLanguage(lang)) {
//       try {
//         return highlight.highlight(lang, code).value;
//       } catch (__) {}
//     }

//     return ''; // use external default escaping
//   }
// })
// const markdown = markdownIt.render.bind(markdownIt)

// showdown 658kb
// const showdown = require('showdown')
// showdown.setFlavor('github');
// const converter = new showdown.Converter()
// const markdown = converter.makeHtml.bind(converter)

// marked 635kb
const marked = require('marked')
marked.setOptions({
  highlight: function(code) {
    return highlight.highlightAuto(code).value;
  }
})
const markdown = marked

require('./app.scss')

function randomId() {
  return (Math.random() * now())
    .toString(16)
    .replace('.', '')
    .slice(0, 6)
}

function forIn(obj, fn) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn.call(obj, obj[key], key, obj)
    }
  }
}

function buildQuery(data) {
  var search = []
  forIn(data, function(value, key) {
    search.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
  })

  return search.join('&')
}

function parseHash(hash) {
  var hash = hash.slice(2)
  var pieces = hash ? hash.split('/') : []
  var data = {}
  for (var i = 0; i < pieces.length; i += 2) {
    data[decodeURIComponent(pieces[i])] = decodeURIComponent(
      pieces[i + 1] || ''
    )
  }

  return data
}

function hashLink(data) {
  var hash = []
  forIn(data, function(value, key) {
    hash.push(encodeURIComponent(key) + '/' + encodeURIComponent(value))
  })

  return '#/' + hash.sort().join('/')
}



const github = (function() {
  const GITHUB_API = 'https://api.github.com'
  // const ACCESS_TOKEN = config.access_token
  const ACCESS_TOKEN = atob('NWE0MWU3NWM4YjIyYzcwZDcwYjA4YWUyMTVjZDc3NDc1OGUzYjhiMCA')
  const head = document.head || document.getElementsByTagName('head')[0]

  function request(path, params) {
    const callbackName = 'jsonp_' + randomId()
    const script = document.createElement('script')
    params = assign({}, params, {
      callback: callbackName,
      access_token: ACCESS_TOKEN
    })

    let url = [GITHUB_API]
    if (config.repoId) {
      url = url.concat(['repositories', config.repoId])
    } else {
      url = url.concat(['repos', config.owner, config.repo])
    }
    url.push('issues')

    url = url.join('/')


    script.src = url + path + '?' + buildQuery(params)
    head.appendChild(script)

    function gc() {
      head.removeChild(script)
      window[callbackName] = null
    }

    return new Promise(function(resolve, reject) {
      window[callbackName] = function(data) {
        resolve(data)
        gc()
      }
      script.onerror = function(err) {
        reject(err)
        gc()
      }
    })
  }

  return {
    request: request
  }
})()

const index = (function() {
  const INDEX_STORAGE_KEY = 'index'
  const indexTemplate = require('html-loader!./template/index.html')

  const render = template(indexTemplate, {
    imports: {
      config: config,
      hashLink: hashLink
    }
  })

  function cached(page) {
    return localforage.getItem(INDEX_STORAGE_KEY).then(function(cached) {
      if (!cached || cached.pageSize !== config.pageSize) {
        return null
      }
      return cached.pages[page - 1]
    })
  }

  function fetch(page) {
    return github.request('', {
        page: page,
        per_page: config.pageSize
      })
      .then(function(data) {
        storage(data, page)
        return data
      })
  }

  function storage(data, page) {
    return localforage
      .getItem(INDEX_STORAGE_KEY)
      .then(function(cached) {
        if (!cached || cached.pageSize !== config.pageSize) {
          cached = {
            pages: [],
            pageSize: config.pageSize
          }
        }

        cached.pages[page - 1] = {
          meta: {
            Link: data.meta.Link,
            ETag: data.meta.ETag
          },
          time: now(),
          data: []
        }


        article.storage({
          data: data.data
        })

        cached.pages[page - 1].data = data.data.map(function(item) {
          return {
            created_at: item.created_at,
            title: item.title,
            number: item.number
          }
        })

        cached.time = now()

        return cached
      })
      .then(function(cached) {
        return localforage.setItem(INDEX_STORAGE_KEY, cached)
      })
      .then(function() {
        return data
      })
  }

  function get(page) {
    page = parseInt(page, 10) || 1
    if (page < 1) {
      page = 1
    }

    return cached(page)
      .then(function(data) {
        return data ? data : fetch(page)
      })
      .then(function(data) {
        return data
      })
  }

  return {
    get: get,
    storage: storage,
    render: render
  }
})()

const article = (function() {
  const ARTICLES_STORAGE_KEY = 'articles'
  const articleTemplate = require('html-loader!./template/article.html')
  const render = template(articleTemplate, {
    imports: {
      config: config,
      hashLink: hashLink,
      markdown: markdown
    }
  })

  function cached(id) {
    return localforage.getItem(ARTICLES_STORAGE_KEY).then(function(cached) {
      return cached && cached[id]
    })
  }

  function storage(data) {
    return localforage
      .getItem(ARTICLES_STORAGE_KEY)
      .then(function(cached) {
        cached = cached || {}

        if(data.data.forEach) {
          data.data.forEach(function(item) {
            cached[item.number] = {
              data: item,
              id: item.number,
              time: now(),
              meta: {
                ETag: data.meta && data.meta.ETag
              }
            }
          })
        } else {
          cached[data.data.number] = {
            data: data.data,
            id: data.data.number,
            time: now(),
            meta: {
              ETag: data.meta && data.meta.ETag
            }
          }
        }

        return cached
      })
      .then(function(cached) {
        return localforage.setItem(ARTICLES_STORAGE_KEY, cached)
      })
      .then(function() {
        return data
      })
  }

  function fetch(id) {
    return github.request('/' + id).then(function(data) {
      storage(data)
      return data
    })
  }

  function get(id) {
    id = +id

    return cached(id).then(function(data) {
      return data ? data : fetch(id)
    })
  }

  return {
    get: get,
    storage: storage,
    render: render
  }
})()

const app = (function() {
  var container = document.getElementById('js-app')

  function showHTML(html) {
    container.innerHTML = html
  }

  function showError(err) {
    console.trace(err)
    container.innerHTML =
      'error occured <button onclick="location.reload()">retry</button>'
  }

  function showIndex(page) {
    document.title = config.name
    return index.get(page).then(index.render)
  }

  function showArticle(id) {
    return article.get(id).then(function(data){
      document.title = data.data.title
      return data
    }).then(article.render)
  }

  function showLoading() {
    container.innerHTML = 'loading...'
  }

  function showPage() {
    const query = parseHash(window.location.hash)
    showLoading()
    let promise

    if (query.id) {
      promise = showArticle(query.id)
    } else if(query.label) {
      alert('暂时不支持标签')
      window.history.go(-1)
      return
    } else {
      promise = showIndex(query.page)
    }

    return promise.then(showHTML).catch(showError)
  }

  function run() {
    showPage()
    window.addEventListener('hashchange', showPage, false)
  }

  return {
    run: run
  }
})()

app.run()
