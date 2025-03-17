let div
function encodeHtml(html) {
  div ??= document.createElement('div')
  div.textContent = html
  return div.textContent
}

function encodeSearchParameters(parameters) {
  return new URLSearchParams(
    Object.entries(parameters || {}).filter(([, value]) => value !== undefined),
  ).toString()
}

export {encodeHtml, encodeSearchParameters}
