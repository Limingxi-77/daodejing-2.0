const test = require('node:test')
const assert = require('node:assert/strict')

const {
  getSubscriptionPlan,
  calculateSubscriptionExpiry,
  normalizeSubscriptionOrderStatus,
  formatSubscriptionOrder
} = require('../lib/subscription-order-utils')

test('getSubscriptionPlan returns paid plan metadata', () => {
  assert.deepEqual(getSubscriptionPlan('pro'), {
    tier: 'pro',
    label: '居士',
    amountCents: 1900,
    durationDays: 30
  })
})

test('getSubscriptionPlan rejects free and unknown tiers', () => {
  assert.equal(getSubscriptionPlan('free'), null)
  assert.equal(getSubscriptionPlan('unknown'), null)
})

test('calculateSubscriptionExpiry starts from now when user has no active membership', () => {
  const now = new Date('2026-05-28T08:00:00.000Z')
  const expiry = calculateSubscriptionExpiry(null, 30, now)

  assert.equal(expiry.toISOString(), '2026-06-27T08:00:00.000Z')
})

test('calculateSubscriptionExpiry extends from existing future expiry', () => {
  const now = new Date('2026-05-28T08:00:00.000Z')
  const existing = new Date('2026-06-10T08:00:00.000Z')
  const expiry = calculateSubscriptionExpiry(existing, 30, now)

  assert.equal(expiry.toISOString(), '2026-07-10T08:00:00.000Z')
})

test('normalizeSubscriptionOrderStatus accepts known statuses only', () => {
  assert.equal(normalizeSubscriptionOrderStatus('paid'), 'paid')
  assert.equal(normalizeSubscriptionOrderStatus(' canceled '), 'canceled')
  assert.equal(normalizeSubscriptionOrderStatus('bad'), null)
})

test('formatSubscriptionOrder maps database row to api shape', () => {
  const order = formatSubscriptionOrder({
    id: 'ord-1',
    order_no: 'M202605280001',
    user_id: 'user-1',
    username: 'dao',
    email: 'dao@example.com',
    display_name: '道友',
    tier: 'master',
    tier_label: '宗师',
    amount_cents: 4900,
    duration_days: 30,
    status: 'pending',
    paid_at: null,
    canceled_at: null,
    handled_by: null,
    admin_name: null,
    note: '等待确认',
    created_at: '2026-05-28 10:00:00',
    updated_at: '2026-05-28 10:00:00'
  })

  assert.equal(order.id, 'ord-1')
  assert.equal(order.orderNo, 'M202605280001')
  assert.equal(order.user.displayName, '道友')
  assert.equal(order.amountYuan, '49.00')
  assert.equal(order.status, 'pending')
})
