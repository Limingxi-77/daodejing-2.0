const test = require('node:test')
const assert = require('node:assert/strict')
const { validateEnv } = require('../lib/env-validator')

function createBaseEnv() {
  return {
    MYSQL_HOST: 'localhost',
    MYSQL_PORT: '3306',
    MYSQL_USER: 'user',
    MYSQL_PASSWORD: 'strong-password',
    MYSQL_DATABASE: 'db',
    JWT_SECRET: 'very-strong-user-secret',
    ADMIN_JWT_SECRET: 'very-strong-admin-secret',
    HADMIN_INTERNAL_TOKEN: 'very-strong-hadmin-token'
  }
}

test('validateEnv returns no problems for valid development env', () => {
  assert.deepEqual(validateEnv(createBaseEnv()), [])
})

test('validateEnv accepts VITE_ fallback values', () => {
  const env = {
    VITE_MYSQL_HOST: 'localhost',
    VITE_MYSQL_PORT: '3306',
    VITE_MYSQL_USER: 'user',
    VITE_MYSQL_PASSWORD: 'strong-password',
    VITE_MYSQL_DATABASE: 'db',
    JWT_SECRET: 'very-strong-user-secret',
    ADMIN_JWT_SECRET: 'very-strong-admin-secret',
    HADMIN_INTERNAL_TOKEN: 'very-strong-hadmin-token'
  }
  assert.deepEqual(validateEnv(env), [])
})

test('validateEnv reports missing required keys', () => {
  const problems = validateEnv({})
  assert.ok(problems.some(problem => problem.includes('MYSQL_HOST')))
  assert.ok(problems.some(problem => problem.includes('HADMIN_INTERNAL_TOKEN')))
})

test('validateEnv reports production weak values and missing cors', () => {
  const problems = validateEnv({
    ...createBaseEnv(),
    NODE_ENV: 'production',
    JWT_SECRET: 'change-me-user-jwt-secret',
    ADMIN_JWT_SECRET: 'change-me-admin-jwt-secret',
    HADMIN_INTERNAL_TOKEN: 'change-me-hadmin-internal-token'
  })
  assert.ok(problems.some(problem => problem.includes('JWT_SECRET')))
  assert.ok(problems.some(problem => problem.includes('ADMIN_JWT_SECRET')))
  assert.ok(problems.some(problem => problem.includes('HADMIN_INTERNAL_TOKEN')))
  assert.ok(problems.includes('生产环境必须配置 CORS_ORIGIN'))
})
