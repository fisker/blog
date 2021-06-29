/*!
 * config file for `eslint`
 *
 * update: wget -O .eslintrc.js https://git.io/fjVjK
 * document: https://eslint.org/docs/user-guide/configuring
 */

/* @fisker/eslint-config https://git.io/fjOeH */

module.exports = {
  root: true,
  env: {},
  parserOptions: {},
  extends: ['@fisker'],
  settings: {},
  rules: {},
  plugins: [],
  globals: {},
  overrides: [
    {
      files: ['src/**/*'],
      rules: {
        'unicorn/no-array-method-this-argument': 'off',
        'unicorn/no-array-for-each': 'off',
        'unicorn/prefer-spread': 'off',
        'unicorn/prefer-number-properties': 'off',
        'no-global-assign': 'off',
        'unicorn/prefer-date-now': 'off',
        'prefer-rest-params': 'off',
      },
    },
  ],
}
