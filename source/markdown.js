import {importPackage} from './dependencies.js'

let marked

async function toHtml(markdown) {
  if (!marked) {
    const [{Marked}, {markedHighlight}, {HighlightJS}] = await Promise.all(
      ['marked', 'marked-highlight', 'highlight.js'].map((name) =>
        importPackage(name),
      ),
    )

    marked = new Marked(
      markedHighlight({
        async: true,
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        async highlight(code, lang, info) {
          const language = HighlightJS.getLanguage(lang) ? lang : 'plaintext'
          return HighlightJS.highlight(code, {language}).value
        },
      }),
    )
  }

  return marked.parse(markdown)
}

export {toHtml}
