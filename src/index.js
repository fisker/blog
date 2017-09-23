'use strict'

function randomId() {
  return (Math.random() * Date.now()).toString(16).replace('.','').slice(0, 6)
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
    search.push(
      encodeURIComponent(key) +
      '=' +
      encodeURIComponent(value)
    )
  })

  return search.join('&')
}


function parseHash(hash) {
  var hash = hash.slice(2)
  var pieces = hash.split('/')
  var data = {}
  for (var i = 0; i < pieces.length; i += 2) {
    data[decodeURIComponent(pieces[i])] = decodeURIComponent(pieces[i + 1] || '')
  }

  return data
}

function hashLink(data) {
  var hash = []
  forIn(data, function(value, key) {
    hash.push(
      encodeURIComponent(key) +
      '/' +
      encodeURIComponent(value)
    )
  })

  return '#/' + hash.sort().join('/')
}





  var head = document.head || document.getElementsByTagName('head')[0]
  function request(url, params) {
    var script = document.createElement('script')
    var callbackName = 'jsonp_' + random()
    var params = Object.assign({}, params, {
      callback: callbackName,
      access_token: CONFIG.access_token
    })
    script.src = url + '?' + buildQuery(params)
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

  function getIndex(page) {
    // var url = [
    //   CONFIG.api,
    //   'repos',
    //   CONFIG.owner,
    //   CONFIG.repo,
    //   'issues'
    // ].join('/')

    page = page || 1
    if (page < 1) {
      page = 1
    }

    return getCachedIndex(page)
      .then(function(data) {
        if (!data) {
          var url = [
            CONFIG.api,
            'repositories',
            CONFIG.repoId,
            'issues'
          ].join('/')

          return request(url, {
            page: page,
            per_page: CONFIG.pageSize
          }).then(function(data) {
            storageIndex(data, page)
            return data
          })
        } else {
          return data
        }
      })
  }

  function storageIndex(data, page) {
    localforage.getItem('index').then(function(indexData) {
      if (!indexData || indexData.pageSize !== CONFIG.pageSize) {
        indexData = {
          pages: [],
          pageSize: CONFIG.pageSize
        }
      }

      indexData.pages[page - 1] = {
        meta: {
          Link: data.meta.Link,
          ETag: data.meta.ETag
        },
        time: Date.now(),
        data: []
      }

      indexData.pages[page].data = data.data.map(function(article) {
        storageArticle({
          data: article
        })

        return {
          created_at: article.created_at,
          title: article.title,
          number: article.number
        }
      })

      indexData.time = Date.now()
      localforage.setItem('index', indexData)
    })

    return data
  }

  function getCachedArticle(id) {
    return localforage.getItem('articles')
      .then(function(articles) {
        return articles && articles.filter(function(article) {
          return article.id === id
        })[0]
      })
  }

  function storageArticle(data) {
    localforage.getItem('articles')
      .then(function(articles) {
        articles = articles || []
        articles = articles.filter(function(article) {
          return article.id !== data.id
        })

        articles.push({
          data: data.data,
          id: data.data.number,
          time: Date.now(),
          meta: {
            ETag: data.meta && data.meta.ETag
          }
        })
        articles.sort(function(a, b) {
          return b.id - a.id
        })

        localforage.setItem('articles', articles)
      })
    return data
  }

  function getArticle(id) {
    return getCachedArticle(id)
      .then(function(data) {
        if (!data) {
          var url = [
            CONFIG.api,
            'repositories',
            CONFIG.repoId,
            'issues',
            id
          ].join('/')

          return request(url).then(storageArticle)
        } else {
          return data
        }
      })

    return request(url)
  }


  var container = document.getElementById('js-container')

  var listRender = (function() {
    var templateEl = document.getElementById('js-article-list')
    var templateStr = templateEl.innerHTML

    return _.template(templateStr, {
      imports: {
        formatTime: function(time) {
          return time
          return new Date(time).toLocaleString()
        },
        hashLink: hashLink
      }
    })
  })()

  function getCachedIndex(page) {
    return localforage.getItem('index')
      .then(function(indexData) {
        if (!indexData || indexData.pageSize !== CONFIG.pageSize) {
          return null
        }
        return indexData.pages[page - 1]
      })
  }


  function listArticles(data) {
    container.innerHTML = listRender(data)
  }
  var articleRender = (function() {
    var templateEl = document.getElementById('js-article')
    var templateStr = templateEl.innerHTML

    return _.template(templateStr, {
      imports: {
        formatTime: function(time) {
          return new Date(time).toLocaleString()
        },
        marked: marked,
        hashLink: hashLink
      }
    })
  })()

  function showArticle(data) {
    console.log(data)
    container.innerHTML = articleRender(data)
  }