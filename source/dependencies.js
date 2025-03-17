import packageJson from '../package.json' with {type: 'json'}

const {dependencies} = packageJson

const getUrl = (source) => {
  const [name, ...rest] = source.split('/')
  const version = dependencies[name]

  if (!version) {
    throw new Error(`'${name}' not installed.`)
  }

  const path = rest.length === 0 ? '' : `/${rest.join('/')}`

  return `https://esm.sh/${name}@${version}${path}`
}

const loaded = new Map()
const importPackage = (source) => {
  const url = getUrl(source)

  if (!loaded.has(source)) {
    loaded.set(source, import(/* @vite-ignore */ `${url}?bundle=true`))
  }

  return loaded.get(source)
}

const importStyle = async (source) => {
  const url = getUrl(source)

  document.head.appendChild(
    Object.assign(document.createElement('link'), {
      href: url,
      rel: 'stylesheet',
    }),
  )
}

export {importPackage, importStyle}
