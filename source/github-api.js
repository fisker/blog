import config from '../blog-config.js'
import {importPackage} from './dependencies.js'
import {encodeSearchParameters} from './utilities.js'

const GITHUB_ISSUES_API_BASE = (function () {
  let url = [config.api]
  if (config.repoId) {
    url = [...url, 'repositories', config.repoId]
  } else {
    url = [...url, 'repos', config.owner, config.repo]
  }
  url.push('issues')

  return url.join('/')
})()

async function request(path, parameters) {
  const url = `${GITHUB_ISSUES_API_BASE + path}?${encodeSearchParameters({
    ...parameters,
  })}`

  const {default: requestJsonp} = await importPackage('json-with-padding')
  const response = await requestJsonp(url)
  return response
}

async function get(path, parameters) {
  return request(path, parameters)
}

export {get}
