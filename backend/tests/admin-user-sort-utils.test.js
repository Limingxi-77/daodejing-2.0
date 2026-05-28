const test = require('node:test')
const assert = require('node:assert/strict')
const { buildAdminUserOrderBy } = require('../lib/admin-user-sort-utils')

test('buildAdminUserOrderBy defaults to created_at desc', () => {
  assert.equal(buildAdminUserOrderBy(), 'ORDER BY created_at DESC')
})

test('buildAdminUserOrderBy sorts membership tier from low to high', () => {
  const orderBy = buildAdminUserOrderBy('membership_tier', 'asc')

  assert.match(orderBy, /^ORDER BY CASE subscription_tier/)
  assert.match(orderBy, /WHEN 'free' THEN 0/)
  assert.match(orderBy, /WHEN 'pro' THEN 2/)
  assert.match(orderBy, /WHEN 'master' THEN 5/)
  assert.match(orderBy, /END ASC, subscription_expiry ASC, created_at DESC$/)
})

test('buildAdminUserOrderBy sorts membership duration from high to low', () => {
  const orderBy = buildAdminUserOrderBy('membership_duration', 'desc')

  assert.match(orderBy, /^ORDER BY CASE/)
  assert.match(orderBy, /subscription_tier = 'free' THEN 0/)
  assert.match(orderBy, /subscription_expiry IS NULL THEN 2147483647/)
  assert.match(orderBy, /TIMESTAMPDIFF\(SECOND, NOW\(\), subscription_expiry\)/)
  assert.match(orderBy, /END DESC, created_at DESC$/)
})

test('buildAdminUserOrderBy rejects unsafe sort input by falling back', () => {
  const orderBy = buildAdminUserOrderBy('membership_tier; DROP TABLE users', 'desc; DROP')

  assert.equal(orderBy, 'ORDER BY created_at DESC')
})
