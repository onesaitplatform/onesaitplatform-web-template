const files = require.context('./locale', false, /\.js$/)
const messages = {}

files
  .keys()
  .forEach(
    (key) => (messages[key.replace(/(\.\/|\.js)/g, '')] = files(key).default)
  )

const i18n = {
  locale: 'es',
  fallbackLocale: 'es',
  messages
}

export default i18n
