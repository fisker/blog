const fs = require('fs')
const source = "./src/template/"
const target = "./build/temp/"

try {
  fs.mkdirSync(target)
} catch (_) {}

const files = [
  'index.jst',
  'article.jst'
]


files.forEach(function(file) {
  console.log('minify jst file: ' + source + file)
  let str = fs.readFileSync(source + file, 'utf-8')
  str = str.replace(/>\s*</g, '><').replace(/>\s+/g, '>').trim()
  fs.writeFileSync(target + file, str, 'utf-8')
})
