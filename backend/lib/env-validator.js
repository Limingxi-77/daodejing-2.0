const required = [
  'MYSQL_HOST',
  'MYSQL_PORT',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE',
  'JWT_SECRET',
  'ADMIN_JWT_SECRET',
  'HADMIN_INTERNAL_TOKEN'
]

const weakValues = new Set([
  '',
  'password',
  'change-me',
  'change-me-user-jwt-secret',
  'change-me-admin-jwt-secret',
  'change-me-hadmin-internal-token',
  'please-change-this-secret',
  'please-change-this-admin-secret',
  'please-change-this-hadmin-token',
  'daodejing-jwt-secret-dev'
])

function validateEnv(env) {
  const isProduction = env.NODE_ENV === 'production'
  const problems = []

  for (const key of required) {
    const value = env[key] || env[`VITE_${key}`]
    if (!value) {
      problems.push(`缺少环境变量: ${key}`)
      continue
    }
    if (isProduction && weakValues.has(value)) {
      problems.push(`生产环境不能使用弱配置: ${key}`)
    }
  }

  if (isProduction && !env.CORS_ORIGIN) {
    problems.push('生产环境必须配置 CORS_ORIGIN')
  }

  return problems
}

module.exports = {
  required,
  validateEnv,
  weakValues
}
