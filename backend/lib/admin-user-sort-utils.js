const TIER_ORDER_SQL = `CASE subscription_tier
  WHEN 'free' THEN 0
  WHEN 'basic' THEN 1
  WHEN 'pro' THEN 2
  WHEN 'team' THEN 3
  WHEN 'premium' THEN 4
  WHEN 'master' THEN 5
  WHEN 'vip' THEN 6
  ELSE 1
END`

const MEMBERSHIP_DURATION_SQL = `CASE
  WHEN subscription_tier IS NULL OR subscription_tier = 'free' THEN 0
  WHEN subscription_expiry IS NULL THEN 2147483647
  WHEN subscription_expiry < NOW() THEN 0
  ELSE TIMESTAMPDIFF(SECOND, NOW(), subscription_expiry)
END`

function normalizeSortDir(sortDir) {
  const normalized = String(sortDir || 'desc').trim().toLowerCase()
  return normalized === 'asc' || normalized === 'desc' ? normalized.toUpperCase() : 'DESC'
}

function buildAdminUserOrderBy(sortBy = 'created_at', sortDir = 'desc') {
  const normalizedSortBy = String(sortBy || 'created_at').trim()
  const dir = normalizeSortDir(sortDir)

  if (normalizedSortBy === 'membership_tier') {
    return `ORDER BY ${TIER_ORDER_SQL} ${dir}, subscription_expiry ${dir}, created_at DESC`
  }

  if (normalizedSortBy === 'membership_duration') {
    return `ORDER BY ${MEMBERSHIP_DURATION_SQL} ${dir}, created_at DESC`
  }

  if (normalizedSortBy === 'created_at') {
    return `ORDER BY created_at ${dir}`
  }

  return 'ORDER BY created_at DESC'
}

module.exports = {
  buildAdminUserOrderBy
}
