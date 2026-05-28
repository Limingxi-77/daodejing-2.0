const path = require('path')
const mysql = require('mysql2/promise')
const { ensureTableColumns } = require('../lib/schema-utils')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const AVATAR_USER_COLUMNS = [
  { name: 'avatar_url', definition: 'VARCHAR(500)' },
  { name: 'pending_avatar_url', definition: 'VARCHAR(500) DEFAULT NULL', after: 'avatar_url' },
  { name: 'avatar_status', definition: "VARCHAR(30) DEFAULT 'none'", after: 'pending_avatar_url' },
  { name: 'avatar_submitted_at', definition: 'DATETIME NULL', after: 'avatar_status' },
  { name: 'avatar_reviewed_at', definition: 'DATETIME NULL', after: 'avatar_submitted_at' },
  { name: 'avatar_reject_reason', definition: 'VARCHAR(500) DEFAULT NULL', after: 'avatar_reviewed_at' }
]

function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || process.env.VITE_MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || process.env.VITE_MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.VITE_MYSQL_USER || 'daodejing',
    password: process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || process.env.VITE_MYSQL_DATABASE || 'daodejing_platform'
  }
}

async function main() {
  const pool = mysql.createPool(getDbConfig())
  try {
    await ensureTableColumns(pool, 'users', AVATAR_USER_COLUMNS)
    const [rows] = await pool.execute('SHOW COLUMNS FROM `users`')
    const existing = new Set(rows.map(row => row.Field))
    const missing = AVATAR_USER_COLUMNS.filter(column => !existing.has(column.name)).map(column => column.name)

    if (missing.length > 0) {
      throw new Error(`头像字段仍缺失: ${missing.join(', ')}`)
    }

    console.log(`头像字段已就绪: ${AVATAR_USER_COLUMNS.map(column => column.name).join(', ')}`)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('头像字段迁移失败:', error.message || error)
    if (error.code) console.error(`错误代码: ${error.code}`)
    process.exit(1)
  })
}

module.exports = {
  AVATAR_USER_COLUMNS
}
