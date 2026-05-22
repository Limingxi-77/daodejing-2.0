const path = require('path')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || process.env.VITE_MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || process.env.VITE_MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.VITE_MYSQL_USER || 'daodejing',
    password: process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || process.env.VITE_MYSQL_DATABASE || 'daodejing_platform'
  }
}

const smokeUserEmail = process.env.SMOKE_USER_EMAIL || 'smoke-user@example.com'
const smokeUserUsername = process.env.SMOKE_USER_USERNAME || 'smoke_user'
const smokeUserPassword = process.env.SMOKE_USER_PASSWORD || 'SmokePass123!'
const smokeAdminUsername = process.env.SMOKE_ADMIN_USERNAME || process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin'
const smokeAdminPassword = process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD || 'change-me-admin-password'
const smokeResourceKeyword = process.env.SMOKE_RESOURCE_KEYWORD || '集成验收资源'
const smokeResourceTitle = process.env.SMOKE_RESOURCE_TITLE || '集成验收资源 - 道德经'
const smokeResourceCategorySlug = process.env.SMOKE_RESOURCE_CATEGORY_SLUG || 'learning'

async function ensureSmokeUser(connection) {
  const passwordHash = await bcrypt.hash(smokeUserPassword, 10)
  const [rows] = await connection.execute(
    'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
    [smokeUserEmail, smokeUserUsername]
  )

  if (rows.length > 0) {
    await connection.execute(
      'UPDATE users SET username = ?, email = ?, password_hash = ?, display_name = ? WHERE id = ?',
      [smokeUserUsername, smokeUserEmail, passwordHash, smokeUserUsername, rows[0].id]
    )
    console.log(`已更新 smoke 用户: ${smokeUserEmail}`)
    return rows[0].id
  }

  const id = randomUUID()
  await connection.execute(
    'INSERT INTO users (id, username, email, password_hash, display_name) VALUES (?, ?, ?, ?, ?)',
    [id, smokeUserUsername, smokeUserEmail, passwordHash, smokeUserUsername]
  )
  console.log(`已创建 smoke 用户: ${smokeUserEmail}`)
  return id
}

async function ensureSmokeAdmin(connection) {
  const passwordHash = await bcrypt.hash(smokeAdminPassword, 10)
  const [rows] = await connection.execute(
    'SELECT id FROM admin_users WHERE username = ? LIMIT 1',
    [smokeAdminUsername]
  )

  let adminId = rows[0]?.id
  if (adminId) {
    await connection.execute(
      'UPDATE admin_users SET password_hash = ?, display_name = ?, role_code = ?, is_active = TRUE WHERE id = ?',
      [passwordHash, '系统管理员', 'super_admin', adminId]
    )
    console.log(`已更新 smoke 管理员: ${smokeAdminUsername}`)
  } else {
    adminId = randomUUID()
    await connection.execute(
      'INSERT INTO admin_users (id, username, password_hash, display_name, role_code) VALUES (?, ?, ?, ?, ?)',
      [adminId, smokeAdminUsername, passwordHash, '系统管理员', 'super_admin']
    )
    console.log(`已创建 smoke 管理员: ${smokeAdminUsername}`)
  }

  const [roleRows] = await connection.execute(
    'SELECT id FROM roles WHERE code = ? LIMIT 1',
    ['super_admin']
  )
  if (roleRows.length > 0) {
    await connection.execute(
      'INSERT IGNORE INTO admin_user_roles (admin_user_id, role_id) VALUES (?, ?)',
      [adminId, roleRows[0].id]
    )
  }

  return adminId
}

async function ensureSmokeCategory(connection) {
  const [rows] = await connection.execute(
    'SELECT id FROM resource_categories WHERE slug = ? LIMIT 1',
    [smokeResourceCategorySlug]
  )

  if (rows.length > 0) {
    await connection.execute(
      'UPDATE resource_categories SET name = ?, description = ?, enabled = TRUE WHERE id = ?',
      ['学习资料', '集成验收使用的后台可管理资源分类', rows[0].id]
    )
    console.log(`已确认 smoke 资源分类: ${smokeResourceCategorySlug}`)
    return rows[0].id
  }

  const id = randomUUID()
  await connection.execute(
    'INSERT INTO resource_categories (id, slug, name, description, sort_order, enabled) VALUES (?, ?, ?, ?, ?, ?)',
    [id, smokeResourceCategorySlug, '学习资料', '集成验收使用的后台可管理资源分类', 999, true]
  )
  console.log(`已创建 smoke 资源分类: ${smokeResourceCategorySlug}`)
  return id
}

async function ensureSmokeResource(connection, categoryId) {
  const summary = `${smokeResourceKeyword}：用于验证 Express 前台资源查询与 hAdmin 后台资源维护共库协作。`
  const content = '该资源由集成验收种子脚本维护，用于资源搜索、后台资源列表以及共库联调验证。'
  const tags = JSON.stringify([smokeResourceKeyword, 'integration', 'hadmin'])

  const [rows] = await connection.execute(
    'SELECT id FROM resources WHERE title = ? LIMIT 1',
    [smokeResourceTitle]
  )

  if (rows.length > 0) {
    await connection.execute(
      `UPDATE resources
       SET category_id = ?, summary = ?, content = ?, resource_type = ?, tags = ?, status = ?, sort_order = ?, download_count = ?, view_count = ?
       WHERE id = ?`,
      [categoryId, summary, content, 'article', tags, 'published', 999, 25, 10, rows[0].id]
    )
    console.log(`已更新 smoke 资源: ${smokeResourceTitle}`)
    return rows[0].id
  }

  const id = randomUUID()
  await connection.execute(
    `INSERT INTO resources
     (id, category_id, title, summary, content, resource_type, tags, status, sort_order, download_count, view_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, categoryId, smokeResourceTitle, summary, content, 'article', tags, 'published', 999, 25, 10]
  )
  console.log(`已创建 smoke 资源: ${smokeResourceTitle}`)
  return id
}

async function main() {
  const connection = await mysql.createConnection(getDbConfig())

  try {
    await ensureSmokeUser(connection)
    await ensureSmokeAdmin(connection)
    const categoryId = await ensureSmokeCategory(connection)
    await ensureSmokeResource(connection, categoryId)
    console.log('Smoke 集成数据准备完成')
  } finally {
    await connection.end()
  }
}

main().catch(error => {
  console.error('Smoke 集成数据准备失败:', error.message || error)
  if (error.code) {
    console.error(`错误代码: ${error.code}`)
  }
  process.exit(1)
})
