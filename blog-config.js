// defalt index cache time in seconds
const DEFAULT_INDEX_CACHE_TIME = 5000

// defalt article cache time in seconds
const DEFAULT_ARTICLE_CACHE_TIME = 1 * 60 * 1000

const config = {
  // github api base
  api: 'https://api.github.com',
  // you should split access_token in to pieces
  // otherwise access_token will expired after you commit to github
  accessTokens: [
    ['5', 'a41e75c8b2', '2c70d70b08ae21', '5cd774758e3b8b0']
  ],
  // cache
  // set false to disable cache
  cache: {
    index: DEFAULT_INDEX_CACHE_TIME,
    // article cache time
    article: DEFAULT_ARTICLE_CACHE_TIME
  },

  name: 'fisker\'s blog',
  owner: 'fisker',
  repo: 'fisker.github.io',
  // repoId: '',
  pageSize: 30,
  paths: {
    'require-js': 'https://cdn.bootcss.com/require.js/2.3.5/require.min.js',
    localforage: 'https://cdn.bootcss.com/localforage/1.5.0/localforage.min.js',
    'es6-promise': 'https://cdn.bootcss.com/es6-promise/4.1.1/es6-promise.min.js',
    'highlight-js': 'https://cdn.bootcss.com/highlight.js/9.12.0/highlight.min.js',
    marked: 'https://cdn.bootcss.com/marked/0.3.6/marked.min.js',
    'primer-markdown': 'https://unpkg.com/primer-markdown@3.6.0/build/build.css',
    'highlight-js-css': 'https://unpkg.com/highlight.js@9.12.0/styles/darkula.css',
  }
}

module.exports = config
