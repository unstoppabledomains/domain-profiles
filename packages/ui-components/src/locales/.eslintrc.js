const path = require('path');

module.exports = {
  extends: ['plugin:i18n-json/recommended'],
  rules: {
    'no-irregular-whitespace': 0,
    'i18n-json/valid-message-syntax': 0,
    'i18n-json/sorted-keys': [
      2,
      {
        sortFunctionPath: path.resolve(
          __dirname,
          '..',
          'scripts',
          'i18nSort.js',
        ),
      },
    ],
  },
};
