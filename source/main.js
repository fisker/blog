import './style.scss'

import * as articleModule from './article-module.js'
import {importStyle} from './dependencies.js'
import * as indexModule from './index-module.js'

const container = document.getElementById('js-app')

function showHtml(html) {
  container.innerHTML = html
}

function showError(error) {
  console.error(error)
  container.innerHTML =
    'error occurred <button onclick="location.reload()">retry</button>'
}

function showLoading() {
  container.innerHTML = 'loading...'
}

async function showPage() {
  const query = new URLSearchParams(globalThis.location.hash.slice(1))

  showLoading()

  const id = query.get('id')
  if (id) {
    try {
      showHtml(await articleModule.get(id))
    } catch (error) {
      showError(error)
    }

    return
  }

  const label = query.get('label')
  if (label) {
    window.alert('暂时不支持标签')
    globalThis.history.go(-1)
    return
  }

  const page = query.get('page')
  try {
    showHtml(await indexModule.get(page ? Number(page) : 1))
  } catch (error) {
    showError(error)
  }
}

importStyle('primer-markdown/build/build.css')
importStyle('highlight.js/styles/default.css')
showPage()
globalThis.addEventListener('hashchange', showPage, false)
