import config from '../blog-config.js'
import {importPackage} from './dependencies.js'
import * as githubApis from './github-api.js'
import * as markdown from './markdown.js'
import {encodeHtml, encodeSearchParameters} from './utilities.js'

const ARTICLES_STORAGE_KEY = 'articles'
const expireTime = (config.cache.article || 0) * 1000

const loadLocalforage = () => importPackage('localforage')

async function cached(id) {
  if (!expireTime) {
    return
  }

  const {default: localforage} = await loadLocalforage()

  const cached = await localforage.getItem(ARTICLES_STORAGE_KEY)
  const data = cached && cached[id]
  if (!data || !data.time || Date.now() - data.time > expireTime) {
    return
  }
  return data
}

async function fetch(id) {
  const data = await githubApis.get(`/${id}`)

  storage(data)
  return data
}

async function storage(data) {
  if (!expireTime) {
    return data
  }

  const {default: localforage} = await loadLocalforage()

  let cached = await localforage.getItem(ARTICLES_STORAGE_KEY)

  cached ||= {}

  if (data.data.forEach) {
    for (const item of data.data) {
      cached[item.number] = {
        data: item,
        id: item.number,
        time: Date.now(),
        meta: {
          ETag: data.meta && data.meta.ETag,
        },
      }
    }
  } else {
    cached[data.data.number] = {
      data: data.data,
      id: data.data.number,
      time: Date.now(),
      meta: {
        ETag: data.meta && data.meta.ETag,
      },
    }
  }

  await localforage.setItem(ARTICLES_STORAGE_KEY, cached)

  return data
}

async function get(id) {
  const data = (await cached(id)) || (await fetch(id))

  document.title = data.data.title

  return renderArticle(data.data)
}

async function renderArticle(article) {
  let html = /* HTML */ `
    <h1 class="article__title">${encodeHtml(article.title)}</h1>
    <header class="article__author">
      <!-- <img class="article__author-avatar" src="{{ article.user.avatar_url + '&s=40' }}"> -->
      <div>${encodeHtml(article.created_at)}</div>
    </header>
    <hr />
    <div class="markdown-body">${await markdown.toHtml(article.body)}</div>
  `

  if (article.labels.length !== 0) {
    html += /* HTML */ `
      <footer>
        ${article.labels
          .map(
            (label) => /* HTML */ `
              <a
                href="#${encodeSearchParameters({label: label.name})}"
                style="background:${label.color}"
              >
                ${encodeHtml(label.name)}
              </a>
            `,
          )
          .join('')}
      </footer>
    `
  }

  return `<article class="article">${html}</article>`
}

export {get, storage}
