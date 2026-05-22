const { createHash } = require('crypto')

const alertLevels = { info: 1, warning: 2, error: 3, critical: 4 }

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function hashIdentifier(value) {
  return createHash('sha256').update(String(value || '').toLowerCase().trim()).digest('hex')
}

function buildLoginKey(getClientIp, req, identifier, scope) {
  return `${scope}:${getClientIp(req)}:${hashIdentifier(identifier)}`
}

function touchMemoryRateLimitBucket(store, key, now, windowMs) {
  const record = store.get(key)
  if (!record || record.resetAt <= now) {
    const nextRecord = { count: 1, resetAt: now + windowMs }
    store.set(key, nextRecord)
    return nextRecord
  }
  record.count += 1
  return record
}

function estimateAiCost(totalTokens, unitCost) {
  if (!unitCost || !totalTokens) return 0
  return Number(((totalTokens / 1000) * unitCost).toFixed(6))
}

function shouldSendAlert(level, minLevel) {
  return (alertLevels[level] || alertLevels.info) >= (alertLevels[minLevel] || alertLevels.error)
}

module.exports = {
  alertLevels,
  buildLoginKey,
  estimateAiCost,
  hashIdentifier,
  parsePositiveInt,
  shouldSendAlert,
  touchMemoryRateLimitBucket
}
