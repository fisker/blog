/* global callback: true */
if (!Promise) {
  require(['es6-promise'], function (module_) {
    Promise = module_.Promise
    afterPromised()
  })
} else {
  afterPromised()
}

function afterPromised() {
  callback(function (module_) {
    return new Promise(function (resolve, reject) {
      require([module_], function (module_) {
        resolve(module_)
      })
    })
  })
}
