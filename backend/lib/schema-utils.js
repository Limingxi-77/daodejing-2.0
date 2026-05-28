const IDENTIFIER_RE = /^[A-Za-z0-9_]+$/

function quoteIdentifier(identifier) {
  if (!IDENTIFIER_RE.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`)
  }
  return `\`${identifier}\``
}

async function columnExists(pool, tableName, columnName) {
  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  )
  return rows.length > 0
}

async function ensureTableColumns(pool, tableName, columns) {
  for (const column of columns) {
    if (await columnExists(pool, tableName, column.name)) {
      continue
    }

    const after = column.after ? ` AFTER ${quoteIdentifier(column.after)}` : ''
    await pool.execute(
      `ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN ${quoteIdentifier(column.name)} ${column.definition}${after}`
    )
  }
}

module.exports = {
  ensureTableColumns
}
