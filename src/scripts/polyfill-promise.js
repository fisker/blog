if (!Promise) {
  require(['es6-promise'], function(mod) {
    Promise = mod.Promise
    afterPromised()
  })
} else {
  afterPromised()
}

function afterPromised() {
  callback(function(mod) {
    return new Promise(function(resolve, reject) {
      require([mod], function(mod) {
        resolve(mod)
      })
    })
  })
}
