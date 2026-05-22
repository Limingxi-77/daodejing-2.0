const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const migrationFiles = [
  path.join(__dirname, '..', 'hadmin-dual-backend-migration.sql')
]

function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || process.env.VITE_MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || process.env.VITE_MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.VITE_MYSQL_USER || 'daodejing',
    password: process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || process.env.VITE_MYSQL_DATABASE || 'daodejing_platform',
    multipleStatements: true
  }
}

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8')
  const connection = await mysql.createConnection(getDbConfig())
  try {
    await connection.query(sql)
    console.log(`迁移完成: ${path.basename(filePath)}`)
  } finally {
    await connection.end()
  }
}

async function main() {
  for (const filePath of migrationFiles) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`迁移文件不存在: ${filePath}`)
    }
    await runMigration(filePath)
  }
  console.log('全部迁移执行完成')
}

main().catch(error => {
  console.error('迁移执行失败:', error.message || error)
  if (error.code) console.error(`错误代码: ${error.code}`)
  process.exit(1)
})

