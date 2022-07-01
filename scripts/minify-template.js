const fs = require('fs')

const source = './src/template/'
const target = '.cache/'

try {
  fs.mkdirSync(target)
} catch {}

const files = ['index.jst', 'article.jst']

for (const file of files) {
  console.log(`minify jst file: ${source}${file}`)
  let string = fs.readFileSync(source + file, 'utf8')
  string = string
    .replace(/>\s*</g, '><')
    .replace(/>\s+/g, '> ')
    .replace(/\s+</g, ' <')
    .trim()
  fs.writeFileSync(target + file, string, 'utf8')
}
