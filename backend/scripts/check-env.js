require('dotenv').config()
const { validateEnv } = require('../lib/env-validator')

const problems = validateEnv(process.env)

if (problems.length > 0) {
  console.error('环境变量校验失败:')
  problems.forEach(problem => console.error(`- ${problem}`))
  process.exit(1)
}

console.log('环境变量校验通过')
