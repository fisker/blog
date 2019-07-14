/* global config: true, _: true, article: true, index: true */
const app = (function() {
  const container = document.getElementById('js-app')

  function showHTML(html) {
    container.innerHTML = html
  }

  function showError(error) {
    console.trace(error)
    container.innerHTML =
      'error occured <button onclick="location.reload()">retry</button>'
  }

  function showIndex(page) {
    document.title = config.name
    return index.get(page).then(index.render)
  }

  function showArticle(id) {
    return article
      .get(id)
      .then(function(data) {
        document.title = data.data.title
        return data
      })
      .then(article.render)
  }

  function showLoading() {
    container.innerHTML = 'loading...'
  }

  function showPage() {
    const query = _.hash.parse(window.location.hash)
    showLoading()
    let promise

    if (query.id) {
      promise = showArticle(query.id)
    } else if (query.label) {
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
    run,
  }
})()
