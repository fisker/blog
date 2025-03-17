// Default index cache time in seconds
const DEFAULT_INDEX_CACHE_TIME = 5000

// Default article cache time in seconds
const DEFAULT_ARTICLE_CACHE_TIME = 1 * 60 * 1000

export default {
  // github api base
  api: '//api.github.com',
  cache: {
    // Index page cache time, set false to disable cache
    index: DEFAULT_INDEX_CACHE_TIME,
    // Article cache time, set false to disable cache
    article: DEFAULT_ARTICLE_CACHE_TIME,
  },
  name: "fisker's blog",
  owner: 'fisker',
  repo: 'blog',
  // repoId: '',
  pageSize: 30,
}
