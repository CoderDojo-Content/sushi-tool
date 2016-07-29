i18n = require 'i18n'
i18n.configure
  locales: ['en', 'es']
  directory: __dirname + '/../../i18n'
  register: global
  objectNotation: true

# Parse LANG env variable, that can be like en_EN.UTF-8
locale_match = /([a-z]*)/.exec(process.env.LANG)

if locale_match.length > 1
  locale = locale_match[1]
  i18n.setLocale(locale)
