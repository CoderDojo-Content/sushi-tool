(function() {
  var i18n, locale, locale_match;

  i18n = require('i18n');

  i18n.configure({
    locales: ['en', 'es'],
    directory: __dirname + '/../../i18n',
    register: global,
    objectNotation: true
  });

  locale_match = /([a-z]*)/.exec(process.env.LANG);

  if (locale_match.length > 1) {
    locale = locale_match[1];
    i18n.setLocale(locale);
  }

}).call(this);
