const {readFileSync, statSync} = require('fs')
const {safeLoad} = require('js-yaml')
const reloadRequire = require('require-reload')(require)

const tryCatch = (tryFn, catchFn = () => {}) => {
  try { return tryFn() }
  catch(err) { return catchFn() }
}

// try to find a config file
// priority: .js, .yaml, .json
const loadConfig = (pathWithoutExt) => {
  const ext = ['.js', '.yaml', '.json'].find(ext => {
    const path = pathWithoutExt + ext
    return tryCatch(() => statSync(path))
  })

  if (!ext) { return {} }

  const path = pathWithoutExt + ext
  if (ext === '.js' || ext === '.json') {
    return reloadRequire(path)
  } else {
    const doc = readFileSync('/nginx/data.yaml', 'utf8')
    return safeLoad(doc)
  }
}

module.exports = loadConfig
