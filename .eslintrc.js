module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'xwalk/max-cells': [ // DOC: https://github.com/adobe-rnd/eslint-plugin-xwalk/blob/main/docs/rules/max-cells.md
      'error',
      {
        '*': 4,
        'curated-card': 7,
        hero: 5,
        'explore-card': 7,
        section: 7,
        'mini-card': 8,
        'research-publications-card': 7,
        'page-metadata': 11,
      },
    ],
  },
};
