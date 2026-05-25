/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  ignorePatterns: [
    'dist/',
    'dev-dist/',
    'node_modules/',
    'playwright-report/',
    'test-results/',
    'public/',
    '*.d.ts',
    'tests/e2e/**',
    'src/**/*.vue',
    'src/**/*.ts',
    'src/**/*.tsx'
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-empty': 'off',
    'no-undef': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off'
  }
}
