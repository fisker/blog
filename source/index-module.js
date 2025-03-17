import config from '../blog-config.js'
import * as articleModule from './article-module.js'
import {importPackage} from './dependencies.js'
import * as githubApis from './github-api.js'
import {encodeHtml, encodeSearchParameters} from './utilities.js'

const INDEX_STORAGE_KEY = 'index'
const expireTime = (config.cache.index || 0) * 1000
const loadLocalforage = () => importPackage('localforage')

async function cached(page) {
  const {default: localforage} = await loadLocalforage()
  const cached = await localforage.getItem(INDEX_STORAGE_KEY)

  if (!cached || cached.pageSize !== config.pageSize) {
    return
  }
  const data = cached.pages[page - 1]
  if (!data || !data.time || Date.now() - data.time > expireTime) {
    return
  }
  return data
}

async function fetch(page) {
  const data = await githubApis.get('', {
    page,
    per_page: config.pageSize,
    state: 'open',
    creator: config.owner,
  })

  storage(data, page)

  return data
}

async function storage(data, page) {
  articleModule.storage({
    data: data.data,
  })

  if (!expireTime) {
    return data
  }

  const {default: localforage} = await loadLocalforage()

  let cached = await localforage.getItem(INDEX_STORAGE_KEY)
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
    time: Date.now(),
    data: [],
  }

  cached.pages[page - 1].data = data.data.map((item) => ({
    created_at: item.created_at,
    title: item.title,
    number: item.number,
  }))

  cached.time = Date.now()

  await localforage.setItem(INDEX_STORAGE_KEY, cached)

  return data
}

async function get(page) {
  const data = (await cached(page)) || (await fetch(page))

  document.title = config.name

  return renderIndex(data)
}

function renderIndex({data, meta}) {
  const html = [
    `<h1>${encodeHtml(config.name)}</h1>`,
    '<hr>',
    /* Indent */ `
      <ul class="list">
        ${data
          .map(
            (article) => /* Indent */ `
              <li class="list__item">
                <a class="list__title" href="#${encodeSearchParameters({id: article.number})}">
                  ${encodeHtml(article.title)}
                </a>
                <div class="list__meta">
                  #${encodeHtml(article.number)}
                  posted at
                  <time class="list__time" datetime="${encodeHtml(article.created_at)}">
                  ${encodeHtml(article.created_at)}
                  </time>
                </div>
              </li>
            `,
          )
          .join('')}
      </ul>
    `,
  ]

  if (meta.link) {
    html.push(
      '<hr>',
      /* HTML */ `
        <nav class="pagination">
          ${meta.Link.map((link) => {
            const pageIndex = link[0].match(/[?&]page=(\d+)/)[1]
            return /* HTML */ `
              <a
                href="#${encodeSearchParameters({page: pageIndex})})"
                title="
                ${encodeHtml(link[1].rel)}"
              >
                ${encodeHtml(link[1].rel)}
              </a>
            `
          }).join('')}
        </nav>
      `,
    )
  }

  return html.join('')
}

export {get, storage}
