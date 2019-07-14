/* global _: true, config: true, templates: true, github: true */
const article = (function() {
  const ARTICLES_STORAGE_KEY = 'articles'
  const expireTime = ((config.cache && config.cache.article) || 0) * 1000
  const render = templates.article

  function cached(id) {
    if (!expireTime) {
      return
    }

    return _.localforage.getItem(ARTICLES_STORAGE_KEY).then(function(cached) {
      const data = cached && cached[id]
      if (!data || !data.time || _.now() - data.time > expireTime) {
        return
      }
      return data
    })
  }

  function fetch(id) {
    return github.get(`/${id}`).then(function(data) {
      storage(data)
      return data
    })
  }

  function storage(data) {
    if (!expireTime) {
      return data
    }

    return _.localforage
      .getItem(ARTICLES_STORAGE_KEY)
      .then(function(cached) {
        cached = cached || {}

        if (data.data.forEach) {
          data.data.forEach(function(item) {
            cached[item.number] = {
              data: item,
              id: item.number,
              time: _.now(),
              meta: {
                ETag: data.meta && data.meta.ETag,
              },
            }
          })
        } else {
          cached[data.data.number] = {
            data: data.data,
            id: data.data.number,
            time: _.now(),
            meta: {
              ETag: data.meta && data.meta.ETag,
            },
          }
        }

        return cached
      })
      .then(function(cached) {
        return _.localforage.setItem(ARTICLES_STORAGE_KEY, cached)
      })
      .then(function() {
        return data
      })
  }

  function get(id) {
    id = Number(id)

    return Promise.resolve()
      .then(function() {
        return cached(id)
      })
      .then(function(data) {
        return data || fetch(id)
      })
      .then(function(data) {
        return _.markdown(data.data.body).then(function(html) {
          data.data.html = html
          return data
        })
      })
  }

  return {
    get,
    storage,
    render,
  }
})()
