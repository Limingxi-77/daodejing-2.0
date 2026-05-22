const test = require('node:test')
const assert = require('node:assert/strict')
const {
  buildLoginKey,
  estimateAiCost,
  hashIdentifier,
  parsePositiveInt,
  shouldSendAlert,
  touchMemoryRateLimitBucket
} = require('../lib/runtime-utils')

test('parsePositiveInt returns fallback for invalid values', () => {
  assert.equal(parsePositiveInt(undefined, 10), 10)
  assert.equal(parsePositiveInt('0', 10), 10)
  assert.equal(parsePositiveInt('-5', 10), 10)
  assert.equal(parsePositiveInt('abc', 10), 10)
})

test('parsePositiveInt parses positive integers', () => {
  assert.equal(parsePositiveInt('15', 10), 15)
})

test('hashIdentifier normalizes case and whitespace', () => {
  assert.equal(hashIdentifier(' User@Test.Com '), hashIdentifier('user@test.com'))
})

test('buildLoginKey combines scope, ip and hashed identifier', () => {
  const req = { ip: '127.0.0.1' }
  const key = buildLoginKey(currentReq => currentReq.ip, req, 'user@test.com', 'user')
  assert.match(key, /^user:127\.0\.0\.1:[a-f0-9]{64}$/)
})

test('touchMemoryRateLimitBucket creates and increments buckets', () => {
  const store = new Map()
  const first = touchMemoryRateLimitBucket(store, 'api:test', 1000, 60000)
  assert.deepEqual(first, { count: 1, resetAt: 61000 })

  const second = touchMemoryRateLimitBucket(store, 'api:test', 2000, 60000)
  assert.equal(second.count, 2)
  assert.equal(second.resetAt, 61000)
})

test('touchMemoryRateLimitBucket resets expired bucket', () => {
  const store = new Map([['api:test', { count: 3, resetAt: 1000 }]])
  const next = touchMemoryRateLimitBucket(store, 'api:test', 1500, 60000)
  assert.deepEqual(next, { count: 1, resetAt: 61500 })
})

test('estimateAiCost returns rounded cost', () => {
  assert.equal(estimateAiCost(2500, 0.8), 2)
  assert.equal(estimateAiCost(0, 0.8), 0)
  assert.equal(estimateAiCost(2500, 0), 0)
})

test('shouldSendAlert respects minimum level', () => {
  assert.equal(shouldSendAlert('error', 'warning'), true)
  assert.equal(shouldSendAlert('info', 'warning'), false)
  assert.equal(shouldSendAlert('critical', 'error'), true)
})
