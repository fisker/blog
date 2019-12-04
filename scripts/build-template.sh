node ./scripts/minify-template.js

lodash \
  exports=none \
  iife="(function(){%output%;return templates})()" \
  template=".cache/*.jst" \
  -o ".cache/templates.js"
