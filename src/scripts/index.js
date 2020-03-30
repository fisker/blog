/* global config: true, _: true, templates: true, github: true, article: true */
const index = (function () {
  const INDEX_STORAGE_KEY = 'index'
  const expireTime = ((config.cache && config.cache.index) || 0) * 1000
  const render = templates.index

  function cached(page) {
    if (!expireTime) {
      return
    }
    return _.localforage.getItem(INDEX_STORAGE_KEY).then(function (cached) {
      if (!cached || cached.pageSize !== config.pageSize) {
        return
      }
      const data = cached.pages[page - 1]
      if (!data || !data.time || _.now() - data.time > expireTime) {
        return
      }
      return data
    })
  }

  function fetch(page) {
    return github
      .get('', {
        page,
        per_page: config.pageSize,
        state: 'open',
        creator: config.owner,
      })
      .then(function (data) {
        storage(data, page)
        return data
      })
  }

  function storage(data, page) {
    article.storage({
      data: data.data,
    })

    if (!expireTime) {
      return data
    }
    return _.localforage
      .getItem(INDEX_STORAGE_KEY)
      .then(function (cached) {
        if (!cached || cached.pageSize !== config.pageSize) {
          cached = {
            pages: [],
            pageSize: config.pageSize,
          }
        }

        cached.pages[page - 1] = {
          meta: {
            Link: data.meta.Link,
            ETag: data.meta.ETag,
          },
          time: _.now(),
          data: [],
        }

        cached.pages[page - 1].data = data.data.map(function (item) {
          return {
            created_at: item.created_at,
            title: item.title,
            number: item.number,
          }
        })

        cached.time = _.now()

        return cached
      })
      .then(function (cached) {
        return _.localforage.setItem(INDEX_STORAGE_KEY, cached)
      })
      .then(function () {
        return data
      })
  }

  function get(page) {
    page = Number.parseInt(page, 10) || 1
    if (page < 1) {
      page = 1
    }

    return Promise.resolve()
      .then(function () {
        return cached(page)
      })
      .then(function (data) {
        return data || fetch(page)
      })
  }

  return {
    get,
    storage,
    render,
  }
})()
