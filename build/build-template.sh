node ./build/minify-template.js

lodash \
  exports=none \
  iife="(function(){%output%;return templates})()" \
  template="./build/temp/*.jst" \
  -o "./build/temp/templates.js"
