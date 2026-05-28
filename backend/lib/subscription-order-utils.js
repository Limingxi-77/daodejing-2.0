const SUBSCRIPTION_PLANS = {
  pro: {
    tier: 'pro',
    label: '居士',
    amountCents: 1900,
    durationDays: 30
  },
  master: {
    tier: 'master',
    label: '宗师',
    amountCents: 4900,
    durationDays: 30
  },
  team: {
    tier: 'team',
    label: '团队',
    amountCents: 29900,
    durationDays: 30
  }
}

const SUBSCRIPTION_ORDER_STATUSES = new Set(['pending', 'paid', 'canceled'])

function getSubscriptionPlan(tier) {
  return SUBSCRIPTION_PLANS[String(tier || '').trim()] || null
}

function calculateSubscriptionExpiry(existingExpiry, durationDays, now = new Date()) {
  const current = now instanceof Date ? now : new Date(now)
  const existing = existingExpiry ? new Date(existingExpiry) : null
  const start = existing && !Number.isNaN(existing.getTime()) && existing > current
    ? new Date(existing)
    : new Date(current)

  start.setDate(start.getDate() + Number(durationDays || 0))
  return start
}

function normalizeSubscriptionOrderStatus(status) {
  const normalized = String(status || '').trim().toLowerCase()
  return SUBSCRIPTION_ORDER_STATUSES.has(normalized) ? normalized : null
}

function formatAmountYuan(amountCents) {
  return (Number(amountCents || 0) / 100).toFixed(2)
}

function formatSubscriptionOrder(row) {
  return {
    id: row.id,
    orderNo: row.order_no,
    userId: row.user_id,
    user: {
      id: row.user_id,
      username: row.username || '',
      email: row.email || '',
      displayName: row.display_name || row.username || ''
    },
    tier: row.tier,
    tierLabel: row.tier_label,
    amountCents: Number(row.amount_cents || 0),
    amountYuan: formatAmountYuan(row.amount_cents),
    durationDays: Number(row.duration_days || 0),
    status: row.status,
    paidAt: row.paid_at || null,
    canceledAt: row.canceled_at || null,
    handledBy: row.handled_by || null,
    handledByName: row.admin_name || null,
    note: row.note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function buildSubscriptionOrderNo(now = new Date(), randomPart = '') {
  const d = now instanceof Date ? now : new Date(now)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const time = String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0')
  const suffix = String(randomPart || Math.floor(Math.random() * 1000000)).replace(/\D/g, '').padStart(6, '0').slice(0, 6)
  return `M${y}${m}${day}${time}${suffix}`
}

module.exports = {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_ORDER_STATUSES,
  getSubscriptionPlan,
  calculateSubscriptionExpiry,
  normalizeSubscriptionOrderStatus,
  formatSubscriptionOrder,
  buildSubscriptionOrderNo
}
