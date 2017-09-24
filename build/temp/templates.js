(function(){
  var undefined;

  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  var root = freeGlobal || freeSelf || Function('return this')();

  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  var _ = root._ || {};

  /*----------------------------------------------------------------------------*/

  var templates = {
    'article': {},
    'index': {}
  };

  templates['article'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
    function print() { __p += __j.call(arguments, '') }
    with (obj) {
    __p += '<article class="article"><h1 class="article__title">' +
    __e( data.title ) +
    '</h1><header class="article__author"><!-- <img class="article__author-avatar" src="' +
    ((__t = ( data.user.avatar_url + '&s=40' )) == null ? '' : __t) +
    '"> --><div>' +
    __e( data.created_at ) +
    '</div></header><hr><div class="markdown-body">' +
    ((__t = ( data.html )) == null ? '' : __t) +
    '</div><footer>';
     data.labels.forEach(function(label) {
    __p += '<a href="' +
    ((__t = ( _.hash.build({label: label.name}) )) == null ? '' : __t) +
    '" style="background:#' +
    ((__t = ( label.color)) == null ? '' : __t) +
    '">' +
    __e( label.name) +
    '</a>';
     });
    __p += '</footer></article>';

    }
    return __p
  };

  templates['index'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
    function print() { __p += __j.call(arguments, '') }
    with (obj) {
    __p += '<h1>' +
    __e( config.name ) +
    '</h1><hr><ul class="list">';
     data.forEach(function(article) {
    __p += '<li class="list__item"><a class="list__title" href="' +
    __e( _.hash.build({id: article.number}) ) +
    '">' +
    __e( article.title ) +
    '</a><div class="list__meta">\n        # ' +
    __e( article.number ) +
    '\n        posted\n        <time class="list__time" datetime="' +
    __e( article.created_at ) +
    '">' +
    __e( article.created_at ) +
    '</time></div></li>';
     }) ;
    __p += '</ul>';
     if (meta.Link) {
    __p += '<hr><nav class="pagination">';

          meta.Link.forEach(function(link) {
          var pageIndex = link[0].match(/[?&]page=(\d+)/)[1]
    __p += '<a href="' +
    __e( _.hash.build({page: pageIndex}) ) +
    '" title="' +
    __e( link[1].rel ) +
    '">' +
    __e( link[1].rel ) +
    '</a>';
     }) ;
    __p += '</nav>';
     }

    }
    return __p
  };
;return templates})()
