const test = require('node:test')
const assert = require('node:assert/strict')
const { ensureTableColumns } = require('../lib/schema-utils')

function createPool(existingColumns = []) {
  const calls = []
  const columns = new Set(existingColumns)

  return {
    calls,
    async execute(sql, params = []) {
      calls.push({ sql, params })

      if (sql.includes('information_schema.columns')) {
        const columnName = params[1]
        return [columns.has(columnName) ? [{ Field: columnName }] : []]
      }

      const match = sql.match(/ADD COLUMN `([^`]+)`/)
      if (match) {
        columns.add(match[1])
      }

      return [{}]
    }
  }
}

test('ensureTableColumns adds only missing columns with compatible ALTER statements', async () => {
  const pool = createPool(['avatar_url'])

  await ensureTableColumns(pool, 'users', [
    { name: 'avatar_url', definition: 'VARCHAR(500)' },
    { name: 'pending_avatar_url', definition: 'VARCHAR(500) DEFAULT NULL', after: 'avatar_url' },
    { name: 'avatar_status', definition: "VARCHAR(30) DEFAULT 'none'", after: 'pending_avatar_url' }
  ])

  const alterCalls = pool.calls.filter(call => call.sql.startsWith('ALTER TABLE'))

  assert.equal(alterCalls.length, 2)
  assert.equal(
    alterCalls[0].sql,
    'ALTER TABLE `users` ADD COLUMN `pending_avatar_url` VARCHAR(500) DEFAULT NULL AFTER `avatar_url`'
  )
  assert.equal(
    alterCalls[1].sql,
    "ALTER TABLE `users` ADD COLUMN `avatar_status` VARCHAR(30) DEFAULT 'none' AFTER `pending_avatar_url`"
  )
  assert.equal(alterCalls.some(call => call.sql.includes('IF NOT EXISTS')), false)
})

test('ensureTableColumns skips existing columns', async () => {
  const pool = createPool(['avatar_url', 'pending_avatar_url'])

  await ensureTableColumns(pool, 'users', [
    { name: 'avatar_url', definition: 'VARCHAR(500)' },
    { name: 'pending_avatar_url', definition: 'VARCHAR(500) DEFAULT NULL', after: 'avatar_url' }
  ])

  assert.equal(pool.calls.some(call => call.sql.startsWith('ALTER TABLE')), false)
})

test('ensureTableColumns rejects unsafe identifiers', async () => {
  const pool = createPool()

  await assert.rejects(
    () => ensureTableColumns(pool, 'users; DROP TABLE users', [
      { name: 'avatar_url', definition: 'VARCHAR(500)' }
    ]),
    /Invalid SQL identifier/
  )
})

test('ensureTableColumns uses information_schema for parameterized column checks', async () => {
  const pool = createPool()

  await ensureTableColumns(pool, 'users', [
    { name: 'pending_avatar_url', definition: 'VARCHAR(500) DEFAULT NULL' }
  ])

  const lookup = pool.calls[0]
  assert.match(lookup.sql, /information_schema\.columns/)
  assert.deepEqual(lookup.params, ['users', 'pending_avatar_url'])
})
