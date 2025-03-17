import fiskerEslintConfig from '@fisker/eslint-config'

export default [
  ...fiskerEslintConfig,
  {
    rules: {
      'unicorn/prefer-global-this': 'off',
      'no-alert': 'off',
      camelcase: 'off',
      'sonarjs/pseudo-random': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'sonarjs/no-invariant-returns': 'off',
      'no-unused-vars': 'warn',
    },
  },
  {ignores: ['dist', 'docs']},
]
