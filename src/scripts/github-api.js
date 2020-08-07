/* global config: true, _: true */
const github = (function () {
  const head = document.head || document.getElementsByTagName('head')[0]
  const ANONYMOUS_TOKEN_LIMIT = 60
  const ASSUME_TOKEN_LIMIT = 5000
  const timeDiff = 0
  const anonymousToken = newToken('')
  const tokens = _.map(config.accessTokens, function (token) {
    if (_.isArray(token)) {
      token = token.join('')
    }

    return newToken(token)
  })

  const GITHUB_ISSUES_API_BASE = (function () {
    let url = [config.api]
    if (config.repoId) {
      url = url.concat(['repositories', config.repoId])
    } else {
      url = url.concat(['repos', config.owner, config.repo])
    }
    url.push('issues')

    return url.join('/')
  })()

  function newToken(token) {
    return {
      token,
      remaining: token ? ASSUME_TOKEN_LIMIT : ANONYMOUS_TOKEN_LIMIT,
      reset: 0,
    }
  }

  function randomId() {
    return (Math.random() * _.now()).toString(16).replace('.', '').slice(0, 6)
  }

  function request(path, parameters, token) {
    token = token || {}
    const callbackName = `jsonp_${randomId()}`
    const script = document.createElement('script')
    parameters = _.assign({}, parameters, {
      callback: callbackName,
    })

    if (token.token) {
      parameters.access_token = token.token
    }

    script.src = `${GITHUB_ISSUES_API_BASE + path}?${_.search.build(
      parameters
    )}`
    head.appendChild(script)

    function gc() {
      head.removeChild(script)
      window[callbackName] = null
    }

    return new Promise(function (resolve, reject) {
      window[callbackName] = function (response) {
        resolve(response)
        gc()
      }
      script.onerror = function (error) {
        reject(error)
        gc()
      }
    }).then(function (data) {
      return handleResponse(data, token)
    })
  }

  function handleResponse(response, token) {
    if (!response || !response.data) {
      return Promise.reject(new Error('no data found.'))
    }

    if (response.data.message) {
      return Promise.reject(response.data.message)
    }

    const {meta} = response
    if (meta) {
      const remaining = meta['X-RateLimit-Remaining']
      const reset = meta['X-RateLimit-Reset']

      if (remaining) {
        token.remaining = parseInt(remaining, 10)
      }

      if (reset) {
        token.reset = parseInt(remaining, 10) * 1000
      }
    }

    return response
  }

  function resetTokenRemaining(token) {
    if (!token.remaining) {
      if (_.now() - anonymousToken.rest > 2 * 1000 * 1000) {
        token.remaining = ASSUME_TOKEN_LIMIT
      }
    }

    return token
  }

  function getToken() {
    _.forEach(tokens, resetTokenRemaining)
    return _.find(tokens, function (token) {
      return token.remaining
    })
  }

  function requestWithToken(path, parameters) {
    const token = getToken()

    return token
      ? request(path, parameters, token)
      : Promise.reject(new Error('no token'))
  }

  function get(path, parameters) {
    resetTokenRemaining(anonymousToken)

    if (anonymousToken.remaining) {
      return request(path, parameters, anonymousToken).catch(function () {
        return requestWithToken(path, parameters)
      })
    }
    return requestWithToken(path, parameters)
  }

  return {
    get,
  }
})()
