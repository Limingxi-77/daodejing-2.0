const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs/promises')
const { randomUUID, timingSafeEqual } = require('crypto')
const {
  alertLevels,
  buildLoginKey,
  estimateAiCost,
  hashIdentifier,
  parsePositiveInt,
  shouldSendAlert,
  touchMemoryRateLimitBucket
} = require('./lib/runtime-utils')
const {
  splitSSEBuffer,
  parseSSEEvent,
  extractDeltaAndUsage,
  chunkTextForMock,
  formatSSEData,
  SSE_DONE_LINE,
  SSE_COMMENT_PING
} = require('./lib/sse-utils')
const {
  COUNCIL_PERSONAS,
  validateQuestion: validateCouncilQuestion,
  aggregateCouncilResults,
  buildFailureFallback: buildCouncilFailureFallback,
  buildDebatePeerPrompt,
  aggregateDebateResults
} = require('./lib/council-utils')
const {
  KNOWLEDGE_CHAPTERS: DIVINATION_CHAPTERS,
  getChapterText,
  getDateKey,
  pickChapterDeterministic,
  buildDivinationPrompt,
  parseDivinationContent,
  buildMockDivination
} = require('./lib/divination-utils')
const {
  formatValueReport
} = require('./lib/value-report-utils')
const {
  TEAM_SIZE_OPTIONS: LEADS_TEAM_SIZE_OPTIONS,
  INTENT_OPTIONS: LEADS_INTENT_OPTIONS,
  validateLeadInput,
  normalizeLeadInput
} = require('./lib/leads-utils')
require('dotenv').config()

const SERVICE_STARTED_AT = new Date()
const SECURITY_CONFIG = {
  rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  apiRateLimitMax: parsePositiveInt(process.env.API_RATE_LIMIT_MAX, 120),
  aiRateLimitMax: parsePositiveInt(process.env.AI_RATE_LIMIT_MAX, 30),
  ttsRateLimitMax: parsePositiveInt(process.env.TTS_RATE_LIMIT_MAX, 20),
  loginRateLimitMax: parsePositiveInt(process.env.LOGIN_RATE_LIMIT_MAX, 10),
  loginFailureLimit: parsePositiveInt(process.env.LOGIN_FAILURE_LIMIT, 5),
  loginLockMs: parsePositiveInt(process.env.LOGIN_LOCK_MS, 15 * 60 * 1000),
  enableAccessLogs: process.env.ENABLE_ACCESS_LOGS !== 'false',
  aiDefaultCostPer1kTokens: Number(process.env.AI_DEFAULT_COST_PER_1K_TOKENS || 0),
  securityStateDriver: process.env.SECURITY_STATE_DRIVER || 'memory',
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL || '',
  alertMinLevel: process.env.ALERT_MIN_LEVEL || 'error'
}

const rateLimitStore = new Map()
const loginFailureStore = new Map()
const requestMetrics = {
  total: 0,
  inFlight: 0,
  totalLatencyMs: 0,
  byStatus: {},
  byRoute: {}
}

const app = express()
const hAdminStaticDir = path.join(__dirname, '..', 'admin', 'hadmin')
const runtimeLogDir = path.join(__dirname, '..', 'logs')
const RUNTIME_LOG_MAX_BYTES = 1024 * 1024
const RUNTIME_LOG_SOURCES = Object.freeze({
  all: { label: '总输出', files: ['backend.log', 'backend.err.log', 'frontend.log', 'frontend.err.log'] },
  backend: { label: '后端输出', file: 'backend.log' },
  backendError: { label: '后端错误', file: 'backend.err.log' },
  frontend: { label: '前端输出', file: 'frontend.log' },
  frontendError: { label: '前端错误', file: 'frontend.err.log' }
})
app.disable('x-powered-by')
app.use(requestContextMiddleware)
app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json({ limit: '1mb' }))
app.get('/hadmin', (_req, res) => {
  res.redirect('/hadmin/login.html')
})
app.get('/hadmin/', (_req, res) => {
  res.redirect('/hadmin/login.html')
})
app.use('/hadmin', express.static(hAdminStaticDir))
app.use('/api/', createRateLimiter({
  name: 'api',
  windowMs: SECURITY_CONFIG.rateLimitWindowMs,
  max: SECURITY_CONFIG.apiRateLimitMax
}))
app.use('/api/ai/', createRateLimiter({
  name: 'ai',
  windowMs: SECURITY_CONFIG.rateLimitWindowMs,
  max: SECURITY_CONFIG.aiRateLimitMax
}))
app.use('/api/tts/', createRateLimiter({
  name: 'tts',
  windowMs: SECURITY_CONFIG.rateLimitWindowMs,
  max: SECURITY_CONFIG.ttsRateLimitMax
}))
app.use('/api/auth/login', createRateLimiter({
  name: 'user-login',
  windowMs: SECURITY_CONFIG.rateLimitWindowMs,
  max: SECURITY_CONFIG.loginRateLimitMax
}))
app.use('/api/admin/auth/login', createRateLimiter({
  name: 'admin-login',
  windowMs: SECURITY_CONFIG.rateLimitWindowMs,
  max: SECURITY_CONFIG.loginRateLimitMax
}))

const JWT_SECRET = process.env.JWT_SECRET || 'daodejing-jwt-secret-dev'
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || `${JWT_SECRET}-admin`
const HADMIN_INTERNAL_TOKEN = process.env.HADMIN_INTERNAL_TOKEN || ''
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const ADMIN_JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || '8h'
const WEAK_SECRET_VALUES = new Set([
  '',
  'password',
  'change-me',
  'change-me-user-jwt-secret',
  'change-me-admin-jwt-secret',
  'change-me-hadmin-internal-token',
  'please-change-this-secret',
  'please-change-this-admin-secret',
  'please-change-this-hadmin-token',
  'daodejing-jwt-secret-dev'
])

function assertProductionSafety() {
  if (process.env.NODE_ENV !== 'production') return
  const checks = [
    ['JWT_SECRET', JWT_SECRET],
    ['ADMIN_JWT_SECRET', ADMIN_JWT_SECRET],
    ['HADMIN_INTERNAL_TOKEN', HADMIN_INTERNAL_TOKEN],
    ['MYSQL_PASSWORD', process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || '']
  ]

  const weakKeys = checks.filter(([, value]) => WEAK_SECRET_VALUES.has(value) || String(value).length < 16)
  if (weakKeys.length > 0) {
    throw new Error(`生产环境存在弱密钥或弱密码: ${weakKeys.map(([key]) => key).join(', ')}`)
  }

  if (!process.env.CORS_ORIGIN) {
    throw new Error('生产环境必须配置 CORS_ORIGIN')
  }

  if (SECURITY_CONFIG.securityStateDriver === 'memory') {
    console.warn('生产环境当前使用内存安全状态；多实例部署建议设置 SECURITY_STATE_DRIVER=mysql 或接入网关/Redis 限流')
  }
}

assertProductionSafety()

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || req.ip || req.socket?.remoteAddress || 'unknown'
}

function sendError(res, status, code, message, details = undefined) {
  const payload = {
    success: false,
    code,
    message,
    requestId: res.req?.requestId
  }
  if (details !== undefined && process.env.NODE_ENV !== 'production') {
    payload.details = details
  }
  return res.status(status).json(payload)
}

function requestContextMiddleware(req, res, next) {
  const startedAt = Date.now()
  req.requestId = req.headers['x-request-id'] || randomUUID()
  res.setHeader('X-Request-Id', req.requestId)
  requestMetrics.inFlight += 1

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt
    const routeKey = `${req.method} ${req.route?.path || req.path}`
    requestMetrics.total += 1
    requestMetrics.inFlight = Math.max(requestMetrics.inFlight - 1, 0)
    requestMetrics.totalLatencyMs += durationMs
    requestMetrics.byStatus[res.statusCode] = (requestMetrics.byStatus[res.statusCode] || 0) + 1
    requestMetrics.byRoute[routeKey] = (requestMetrics.byRoute[routeKey] || 0) + 1

    if (SECURITY_CONFIG.enableAccessLogs) {
      console.log(JSON.stringify({
        type: 'access',
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
        ip: getClientIp(req),
        userId: req.user?.id || null,
        adminId: req.admin?.id || null
      }))
    }
  })

  next()
}

function createRateLimiter({ name, windowMs, max }) {
  return async (req, res, next) => {
    const key = `${name}:${getClientIp(req)}:${req.method}:${req.baseUrl || req.path}`
    const now = Date.now()

    try {
      const record = SECURITY_CONFIG.securityStateDriver === 'mysql'
        ? await touchMysqlRateLimitBucket(key, windowMs)
        : touchMemoryRateLimitBucket(rateLimitStore, key, now, windowMs)

      if (record.count > max) {
        const retryAfter = Math.max(Math.ceil((record.resetAt - now) / 1000), 1)
        res.setHeader('Retry-After', String(retryAfter))
        if (record.count === max + 1) {
          emitAlert({
            level: 'warning',
            type: 'rate_limit.exceeded',
            message: '接口请求触发限流',
            metadata: { bucket: key, count: record.count, max, requestId: req.requestId }
          })
        }
        return sendError(res, 429, 'RATE_LIMITED', '请求过于频繁，请稍后再试')
      }

      next()
    } catch (error) {
      console.error('限流状态检查失败:', error)
      emitAlert({
        level: 'error',
        type: 'rate_limit.state_failed',
        message: '限流状态检查失败',
        metadata: { bucket: key, error: error.message, requestId: req.requestId }
      })
      next()
    }
  }
}

async function touchMysqlRateLimitBucket(key, windowMs) {
  const resetAt = new Date(Date.now() + windowMs)
  await pool.execute(
    `INSERT INTO rate_limit_buckets (bucket_key, request_count, reset_at)
     VALUES (?, 1, ?)
     ON DUPLICATE KEY UPDATE
       request_count = IF(reset_at <= NOW(), 1, request_count + 1),
       reset_at = IF(reset_at <= NOW(), VALUES(reset_at), reset_at),
       updated_at = CURRENT_TIMESTAMP`,
    [key, resetAt]
  )
  const [rows] = await pool.execute(
    'SELECT request_count, reset_at FROM rate_limit_buckets WHERE bucket_key = ?',
    [key]
  )
  return {
    count: Number(rows[0]?.request_count || 1),
    resetAt: new Date(rows[0]?.reset_at || resetAt).getTime()
  }
}

function pruneExpiredRateLimitBuckets(now = Date.now()) {
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

async function pruneExpiredMysqlSecurityState() {
  if (SECURITY_CONFIG.securityStateDriver !== 'mysql') return
  try {
    await pool.execute('DELETE FROM rate_limit_buckets WHERE reset_at <= DATE_SUB(NOW(), INTERVAL 1 MINUTE)')
    await pool.execute('DELETE FROM login_failure_buckets WHERE locked_until <= NOW() AND last_failure_at <= DATE_SUB(NOW(), INTERVAL ? SECOND)', [
      Math.ceil(SECURITY_CONFIG.loginLockMs / 1000)
    ])
  } catch (error) {
    console.error('清理 MySQL 安全状态失败:', error)
  }
}

setInterval(() => {
  pruneExpiredRateLimitBuckets()
  pruneExpiredLoginFailures()
  pruneExpiredMysqlSecurityState()
}, Math.min(SECURITY_CONFIG.rateLimitWindowMs, SECURITY_CONFIG.loginLockMs)).unref()

function pruneExpiredLoginFailures(now = Date.now()) {
  for (const [key, record] of loginFailureStore.entries()) {
    if (record.lockedUntil <= now && record.lastFailureAt + SECURITY_CONFIG.loginLockMs <= now) {
      loginFailureStore.delete(key)
    }
  }
}

async function checkLoginLock(req, identifier, scope) {
  const key = buildLoginKey(getClientIp, req, identifier, scope)
  if (SECURITY_CONFIG.securityStateDriver === 'mysql') {
    const [rows] = await pool.execute(
      'SELECT locked_until FROM login_failure_buckets WHERE bucket_key = ? AND locked_until > NOW()',
      [key]
    )
    if (rows.length > 0) {
      const lockedUntil = new Date(rows[0].locked_until).getTime()
      return {
        locked: true,
        key,
        retryAfterSeconds: Math.max(Math.ceil((lockedUntil - Date.now()) / 1000), 1)
      }
    }
    await pool.execute(
      'DELETE FROM login_failure_buckets WHERE bucket_key = ? AND locked_until IS NOT NULL AND locked_until <= NOW()',
      [key]
    )
    return { locked: false, key }
  }

  pruneExpiredLoginFailures()
  const record = loginFailureStore.get(key)
  if (record?.lockedUntil > Date.now()) {
    return {
      locked: true,
      key,
      retryAfterSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000)
    }
  }
  return { locked: false, key }
}

async function recordLoginFailure(key, metadata = {}) {
  const now = Date.now()
  let record

  if (SECURITY_CONFIG.securityStateDriver === 'mysql') {
    await pool.execute(
      `INSERT INTO login_failure_buckets (bucket_key, failure_count, locked_until, last_failure_at)
       VALUES (?, 1, NULL, NOW())
       ON DUPLICATE KEY UPDATE
         failure_count = IF(locked_until IS NULL OR locked_until <= NOW(), failure_count + 1, failure_count),
         last_failure_at = NOW(),
         locked_until = IF(failure_count >= ?, DATE_ADD(NOW(), INTERVAL ? SECOND), locked_until),
         updated_at = CURRENT_TIMESTAMP`,
      [key, SECURITY_CONFIG.loginFailureLimit, Math.ceil(SECURITY_CONFIG.loginLockMs / 1000)]
    )
    const [rows] = await pool.execute(
      'SELECT failure_count, locked_until FROM login_failure_buckets WHERE bucket_key = ?',
      [key]
    )
    record = {
      count: Number(rows[0]?.failure_count || 1),
      lockedUntil: rows[0]?.locked_until ? new Date(rows[0].locked_until).getTime() : 0
    }
  } else {
    record = loginFailureStore.get(key) || { count: 0, lockedUntil: 0, lastFailureAt: 0 }
    record.count += 1
    record.lastFailureAt = now
    if (record.count >= SECURITY_CONFIG.loginFailureLimit) {
      record.lockedUntil = now + SECURITY_CONFIG.loginLockMs
    }
    loginFailureStore.set(key, record)
  }

  console.warn(JSON.stringify({
    type: 'login_failure',
    scope: metadata.scope,
    requestId: metadata.requestId,
    ip: metadata.ip,
    failureCount: record.count,
    lockedUntil: record.lockedUntil || null
  }))

  if (record.lockedUntil) {
    emitAlert({
      level: 'warning',
      type: 'login.locked',
      message: '登录失败次数达到锁定阈值',
      metadata: { scope: metadata.scope, ip: metadata.ip, failureCount: record.count, requestId: metadata.requestId }
    })
  }
}

async function clearLoginFailures(key) {
  if (SECURITY_CONFIG.securityStateDriver === 'mysql') {
    await pool.execute('DELETE FROM login_failure_buckets WHERE bucket_key = ?', [key])
    return
  }
  loginFailureStore.delete(key)
}

function logServiceCall({ type, req, provider, model, status, durationMs, tokens = 0, estimatedCost = 0, error = null }) {
  const payload = {
    type,
    requestId: req.requestId,
    userId: req.user?.id || null,
    provider,
    model,
    status,
    durationMs,
    tokens,
    estimatedCost,
    error: error ? String(error).slice(0, 300) : null
  }

  console.log(JSON.stringify(payload))

  pool.execute(
    `INSERT INTO external_service_call_logs
     (id, service_type, user_id, provider_name, model_name, status, duration_ms, tokens, estimated_cost, error_message, request_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      type,
      payload.userId,
      provider || null,
      model || null,
      status,
      durationMs || 0,
      tokens || 0,
      estimatedCost || 0,
      payload.error,
      req.requestId
    ]
  ).catch(dbError => {
    console.error('写入外部服务调用日志失败:', dbError)
  })
}

const AI_PROVIDERS = {
  deepseek: {
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    defaultModel: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
  },
  openrouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultModel: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free'
  },
  openai: {
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || '',
    defaultModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  }
}

const TTS_CONFIG = {
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY || process.env.COSYVOICE_API_KEY || '',
  dashscopeUrl: process.env.DASHSCOPE_TTS_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  model: process.env.COSYVOICE_MODEL || 'cosyvoice-v1'
}

const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.VITE_MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || process.env.VITE_MYSQL_USER || 'daodejing',
  password: process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || process.env.VITE_MYSQL_DATABASE || 'daodejing_platform',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

const pool = mysql.createPool(dbConfig)

pool.getConnection()
  .then(connection => {
    console.log('MySQL 连接成功')
    connection.release()
  })
  .catch(error => {
    console.error('MySQL 连接失败:', error)
  })

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, type: 'user' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

function generateAdminToken(admin) {
  return jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role_code, type: 'admin' },
    ADMIN_JWT_SECRET,
    { expiresIn: ADMIN_JWT_EXPIRES_IN }
  )
}

function safeCompare(value, expected) {
  if (!value || !expected) return false
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)
  if (valueBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(valueBuffer, expectedBuffer)
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' })
  }

  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET)
  } catch {
    return res.status(401).json({ success: false, message: '令牌无效或已过期' })
  }

  pool.execute('SELECT is_active FROM users WHERE id = ?', [req.user.id]).then(([rows]) => {
    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(403).json({ success: false, message: '账号已被禁用，请联系管理员' })
    }
    next()
  }).catch(() => {
    return res.status(500).json({ success: false, message: '验证用户状态失败' })
  })
}

function adminAuthMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未提供管理员认证令牌' })
  }

  try {
    const payload = jwt.verify(header.slice(7), ADMIN_JWT_SECRET)
    if (payload.type !== 'admin') {
      return res.status(403).json({ success: false, message: '无管理员权限' })
    }
    req.admin = payload
  } catch {
    return res.status(401).json({ success: false, message: '管理员令牌无效或已过期' })
  }

  pool.execute('SELECT is_active FROM admin_users WHERE id = ?', [req.admin.id]).then(([rows]) => {
    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(403).json({ success: false, message: '管理员账号已被禁用' })
    }
    next()
  }).catch(() => {
    return res.status(500).json({ success: false, message: '验证管理员状态失败' })
  })
}

function hAdminInternalMiddleware(req, res, next) {
  const token = req.headers['x-hadmin-token']
  if (!HADMIN_INTERNAL_TOKEN) {
    return res.status(503).json({ success: false, message: '未配置 hAdmin 内部协作令牌' })
  }
  if (!safeCompare(String(token || ''), HADMIN_INTERNAL_TOKEN)) {
    return res.status(401).json({ success: false, message: 'hAdmin 内部令牌无效' })
  }
  req.admin = {
    id: String(req.headers['x-hadmin-admin-id'] || 'hadmin'),
    username: String(req.headers['x-hadmin-admin-name'] || 'hAdmin'),
    role: 'hadmin_internal'
  }
  next()
}

function requirePermission(permissionCode) {
  return async (req, res, next) => {
    if (req.admin?.role === 'super_admin' || req.admin?.role === 'hadmin_internal') return next()

    try {
      const [rows] = await pool.execute(
        `SELECT 1
         FROM admin_user_roles aur
         JOIN role_permissions rp ON rp.role_id = aur.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE aur.admin_user_id = ? AND p.code = ?
         LIMIT 1`,
        [req.admin.id, permissionCode]
      )

      if (rows.length === 0) {
        return res.status(403).json({ success: false, message: '缺少后台操作权限' })
      }

      next()
    } catch (error) {
      console.error('权限校验失败:', error)
      res.status(500).json({ success: false, message: '权限校验失败' })
    }
  }
}

async function auditLog(req, action, targetType, targetId, beforeData = null, afterData = null) {
  try {
    await pool.execute(
      `INSERT INTO admin_operation_logs
       (id, admin_user_id, admin_username, action, target_type, target_id, before_data, after_data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        req.admin?.id || null,
        req.admin?.username || req.admin?.role || 'unknown',
        action,
        targetType,
        targetId || null,
        beforeData ? JSON.stringify(beforeData) : null,
        afterData ? JSON.stringify(afterData) : null,
        req.ip,
        req.headers['user-agent'] || null
      ]
    )
  } catch (error) {
    console.error('写入后台操作日志失败:', error)
  }
}

async function securityEvent(req, eventType, scope, metadata = {}) {
  try {
    await pool.execute(
      `INSERT INTO security_events
       (id, event_type, scope, actor_id, ip_address, user_agent, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        eventType,
        scope,
        req.user?.id || req.admin?.id || null,
        getClientIp(req),
        req.headers['user-agent'] || null,
        JSON.stringify({ requestId: req.requestId, ...metadata })
      ]
    )
  } catch (error) {
    console.error('写入安全事件失败:', error)
  }
}

async function emitAlert({ level = 'error', type, message, metadata = {} }) {
  const payload = {
    level,
    type,
    message,
    metadata,
    createdAt: new Date().toISOString()
  }

  console[level === 'critical' || level === 'error' ? 'error' : 'warn'](JSON.stringify({ type: 'alert', ...payload }))

  try {
    await pool.execute(
      `INSERT INTO alert_events (id, level, event_type, message, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), level, type, message, JSON.stringify(metadata)]
    )
  } catch (error) {
    console.error('写入告警事件失败:', error)
  }

  if (!SECURITY_CONFIG.alertWebhookUrl || !shouldSendAlert(level)) return

  try {
    const response = await fetch(SECURITY_CONFIG.alertWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      console.error(`告警 Webhook 推送失败: ${response.status}`)
    }
  } catch (error) {
    console.error('告警 Webhook 推送异常:', error)
  }
}

function checkSubscriptionExpired(row) {
  if (!row.subscription_tier || row.subscription_tier === 'free') return
  if (!row.subscription_expiry) return
  if (new Date(row.subscription_expiry) < new Date()) {
    return true
  }
  return false
}

async function autoDowngradeExpired(conn, row) {
  if (!checkSubscriptionExpired(row)) return row
  await conn.execute(
    'UPDATE users SET subscription_tier = ?, subscription_expiry = NULL WHERE id = ?',
    ['free', row.id]
  )
  row.subscription_tier = 'free'
  row.subscription_expiry = null
  return row
}

function formatUser(row) {
  // Auto-downgrade if expired before formatting
  if (checkSubscriptionExpired(row)) {
    row.subscription_tier = 'free'
    row.subscription_expiry = null
  }
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    display_name: row.display_name || row.username,
    password: row.plain_password || '',
    subscription_tier: row.subscription_tier || 'free',
    email_verified: Boolean(row.email_verified),
    is_active: row.is_active !== 0,
    created_at: row.created_at,
    last_login: row.last_login,
    subscription_expiry: row.subscription_expiry
  }
}

function formatAdmin(row) {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name || row.username,
    role_code: row.role_code || 'admin',
    is_active: row.is_active !== 0,
    created_at: row.created_at,
    last_login: row.last_login
  }
}

function normalizeAdminProfileInput(body = {}) {
  return {
    username: String(body.username || '').trim(),
    displayName: String(body.display_name || body.displayName || '').trim(),
    currentPassword: String(body.currentPassword || body.current_password || ''),
    newPassword: String(body.newPassword || body.new_password || '')
  }
}

function validateAdminProfileInput(input) {
  if (!input.username) {
    return '请输入管理员账号'
  }
  if (input.username.length < 3 || input.username.length > 80) {
    return '管理员账号长度必须为 3-80 个字符'
  }
  if (!/^[A-Za-z0-9_.-]+$/.test(input.username)) {
    return '管理员账号只能包含字母、数字、下划线、点和短横线'
  }
  if (input.displayName && input.displayName.length > 120) {
    return '显示名称不能超过 120 个字符'
  }
  if (!input.currentPassword) {
    return '请输入当前密码'
  }
  if (input.newPassword) {
    if (input.newPassword.length < 8) {
      return '新密码长度至少 8 位'
    }
    if (!/[A-Za-z]/.test(input.newPassword) || !/\d/.test(input.newPassword)) {
      return '新密码必须同时包含字母和数字'
    }
  }
  return ''
}

function getAIProvider(providerName) {
  const provider = AI_PROVIDERS[providerName] || AI_PROVIDERS.deepseek
  return {
    name: AI_PROVIDERS[providerName] ? providerName : 'deepseek',
    ...provider
  }
}

async function resolveAIProvider(providerName) {
  const base = getAIProvider(providerName)
  try {
    const [rows] = await pool.execute(
      'SELECT config_value FROM system_configs WHERE config_key = ?',
      [`ai.provider.${base.name}`]
    )
    if (rows.length > 0) {
      let cfg = rows[0].config_value
      if (typeof cfg === 'string') {
        try { cfg = JSON.parse(cfg) } catch { cfg = null }
      }
      if (cfg && typeof cfg === 'object') {
        return {
          name: base.name,
          baseUrl: cfg.baseUrl || base.baseUrl,
          apiKey: cfg.apiKey || base.apiKey,
          defaultModel: cfg.defaultModel || base.defaultModel,
          enabled: cfg.enabled !== false
        }
      }
    }
  } catch (err) {
    console.warn(`读取 AI provider [${base.name}] 配置失败，使用 env 默认值:`, err.message)
  }
  return { ...base, enabled: true }
}

function buildMockAIResponse(messages) {
  const userMessage = [...messages].reverse().find(message => message.role === 'user')?.content || ''
  if (userMessage.includes('无为')) {
    return '【演示模式】“无为”不是不做事，而是不违背规律地做事。它提醒我们减少过度控制，给事物自然生长的空间。'
  }
  if (userMessage.includes('上善若水') || userMessage.includes('水')) {
    return '【演示模式】“上善若水”强调柔弱、包容、利他而不争。水滋养万物却不居功，这正是道家推崇的处世智慧。'
  }
  return `【演示模式】关于“${userMessage || '道德经'}”，可以从“道法自然”的角度理解：少一些执念，多一些顺势而为，在日常选择中保持清明与节制。`
}

function parseConversationPayload(row) {
  try {
    const parsed = JSON.parse(row.messages || '{}')
    if (Array.isArray(parsed)) {
      return { messages: parsed }
    }
    return parsed || {}
  } catch {
    return { messages: [] }
  }
}

function formatConversation(row) {
  const payload = parseConversationPayload(row)
  return {
    id: row.id,
    title: row.title,
    persona: payload.persona || 'scholar',
    messages: Array.isArray(payload.messages) ? payload.messages : [],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    createdAt: payload.createdAt || row.created_at,
    updatedAt: row.updated_at
  }
}

function buildConversationStorage(conversation) {
  return JSON.stringify({
    persona: conversation.persona || 'scholar',
    tags: Array.isArray(conversation.tags) ? conversation.tags : [],
    messages: Array.isArray(conversation.messages) ? conversation.messages : [],
    createdAt: conversation.createdAt || new Date().toISOString()
  })
}

function parseTags(tags) {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseJsonValue(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function formatCommunityPost(row) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username || row.author_name || '匿名用户',
    authorName: row.author_name || row.display_name || row.username || '匿名用户',
    title: row.title,
    content: row.content,
    tags: parseTags(row.tags),
    status: row.status || 'published',
    isPinned: Boolean(row.is_pinned),
    isHot: Boolean(row.is_hot),
    viewCount: Number(row.view_count || 0),
    likeCount: Number(row.like_count || 0),
    commentCount: Number(row.comment_count || 0),
    bookmarkCount: Number(row.bookmark_count || 0),
    liked: Boolean(row.liked),
    bookmarked: Boolean(row.bookmarked),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function formatCommunityComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    username: row.username || row.author_name || '匿名用户',
    authorName: row.author_name || row.display_name || row.username || '匿名用户',
    content: row.content,
    status: row.status || 'published',
    parentId: row.parent_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function formatResource(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name || null,
    title: row.title,
    summary: row.summary || '',
    content: row.content || '',
    resourceType: row.resource_type || 'article',
    era: row.era || '',
    author: row.author || '',
    coverUrl: row.cover_url || '',
    fileUrl: row.file_url || '',
    tags: parseTags(row.tags),
    status: row.status || 'published',
    sortOrder: Number(row.sort_order || 0),
    viewCount: Number(row.view_count || 0),
    downloadCount: Number(row.download_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function formatResourceCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    sortOrder: Number(row.sort_order || 0),
    enabled: row.enabled !== 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function formatTtsTask(row) {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    voice: row.voice,
    speed: Number(row.speed || 1),
    volume: Number(row.volume || 1),
    status: row.status,
    audioUrl: row.audio_url || '',
    errorMessage: row.error_message || '',
    metadata: parseJsonValue(row.metadata, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function formatNote(row) {
  return {
    id: row.id,
    userId: row.user_id,
    lessonId: Number(row.lesson_id || row.chapter_id || 0),
    title: row.title || `第${row.lesson_id || row.chapter_id || ''}章笔记`,
    content: row.content,
    tags: parseTags(row.tags),
    isPublic: Boolean(row.is_public),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

const ADMIN_LEARNING_PATHS = [
  {
    id: 'beginner',
    name: '初学者路径',
    description: '适合刚接触《道德经》的学习者，从基础概念开始理解老子思想核心',
    icon: 'fa-leaf',
    color: 'green',
    difficulty: 'beginner',
    totalLessons: 25
  },
  {
    id: 'intermediate',
    name: '进阶者路径',
    description: '适合有一定基础的学习者，深入探讨《道德经》的哲学思想和实践应用',
    icon: 'fa-line-chart',
    color: 'orange',
    difficulty: 'intermediate',
    totalLessons: 36
  },
  {
    id: 'advanced',
    name: '研究者路径',
    description: '适合深入研究的学习者，全面掌握《道德经》的深层次哲学内涵',
    icon: 'fa-graduation-cap',
    color: 'purple',
    difficulty: 'advanced',
    totalLessons: 27
  }
]

function getLearningPathMeta(courseId) {
  return ADMIN_LEARNING_PATHS.find(path => path.id === courseId) || {
    id: courseId || 'unknown',
    name: courseId || '未知路径',
    description: '未在前端学习路径配置中声明的课程路径',
    icon: 'fa-question-circle',
    color: 'gray',
    difficulty: 'unknown',
    totalLessons: 0
  }
}

function formatLearningProgress(row) {
  const pathMeta = getLearningPathMeta(row.course_id)
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username || '',
    email: row.email || '',
    displayName: row.display_name || row.username || '',
    courseId: row.course_id,
    courseName: pathMeta.name,
    chapterId: row.chapter_id,
    progress: Number(row.progress_percentage || 0),
    completed: Boolean(row.completed),
    lastAccessed: row.last_accessed,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function ensureAdminTables() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(80) UNIQUE NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      password_hash VARCHAR(200) NOT NULL,
      plain_password VARCHAR(100) DEFAULT NULL,
      display_name VARCHAR(100),
      avatar_url VARCHAR(500),
      bio TEXT,
      subscription_tier VARCHAR(50) DEFAULT 'free',
      email_verified BOOLEAN DEFAULT FALSE,
      subscription_expiry DATETIME NULL,
      is_active BOOLEAN DEFAULT TRUE,
      last_login DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(80) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(120),
      role_code VARCHAR(50) DEFAULT 'admin',
      is_active BOOLEAN DEFAULT TRUE,
      last_login DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS roles (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(80) UNIQUE NOT NULL,
      name VARCHAR(120) NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS permissions (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(120) UNIQUE NOT NULL,
      name VARCHAR(120) NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_user_roles (
      admin_user_id VARCHAR(36) NOT NULL,
      role_id VARCHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (admin_user_id, role_id)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id VARCHAR(36) NOT NULL,
      permission_id VARCHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (role_id, permission_id)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_operation_logs (
      id VARCHAR(36) PRIMARY KEY,
      admin_user_id VARCHAR(36),
      admin_username VARCHAR(120),
      action VARCHAR(120) NOT NULL,
      target_type VARCHAR(80) NOT NULL,
      target_id VARCHAR(120),
      before_data JSON NULL,
      after_data JSON NULL,
      ip_address VARCHAR(80),
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS system_configs (
      id VARCHAR(36) PRIMARY KEY,
      config_key VARCHAR(120) UNIQUE NOT NULL,
      config_value JSON NULL,
      description TEXT,
      updated_by VARCHAR(36),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ai_providers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(80) UNIQUE NOT NULL,
      base_url VARCHAR(255) NOT NULL,
      default_model VARCHAR(120),
      enabled BOOLEAN DEFAULT FALSE,
      daily_limit INT DEFAULT 0,
      config JSON NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ai_usage_logs (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      provider_name VARCHAR(80),
      model_name VARCHAR(120),
      prompt_tokens INT DEFAULT 0,
      completion_tokens INT DEFAULT 0,
      total_tokens INT DEFAULT 0,
      estimated_cost DECIMAL(12, 6) DEFAULT 0,
      status VARCHAR(30) DEFAULT 'success',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(200) NOT NULL,
      company VARCHAR(200),
      phone VARCHAR(50),
      team_size VARCHAR(50),
      intent VARCHAR(50) DEFAULT 'enterprise',
      note TEXT,
      status VARCHAR(30) DEFAULT 'new',
      ip_address VARCHAR(80),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_created (created_at)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS security_events (
      id VARCHAR(36) PRIMARY KEY,
      event_type VARCHAR(80) NOT NULL,
      scope VARCHAR(50),
      actor_id VARCHAR(36),
      ip_address VARCHAR(80),
      user_agent TEXT,
      metadata JSON NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS external_service_call_logs (
      id VARCHAR(36) PRIMARY KEY,
      service_type VARCHAR(50) NOT NULL,
      user_id VARCHAR(36),
      provider_name VARCHAR(80),
      model_name VARCHAR(120),
      status VARCHAR(40) NOT NULL,
      duration_ms INT DEFAULT 0,
      tokens INT DEFAULT 0,
      estimated_cost DECIMAL(12, 6) DEFAULT 0,
      error_message TEXT,
      request_id VARCHAR(80),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS rate_limit_buckets (
      bucket_key VARCHAR(200) PRIMARY KEY,
      request_count INT DEFAULT 0,
      reset_at DATETIME NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_rate_limit_reset_at (reset_at)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS login_failure_buckets (
      bucket_key VARCHAR(200) PRIMARY KEY,
      failure_count INT DEFAULT 0,
      locked_until DATETIME NULL,
      last_failure_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_login_failure_locked_until (locked_until),
      INDEX idx_login_failure_last_failure_at (last_failure_at)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS alert_events (
      id VARCHAR(36) PRIMARY KEY,
      level VARCHAR(30) NOT NULL,
      event_type VARCHAR(120) NOT NULL,
      message TEXT NOT NULL,
      metadata JSON NULL,
      handled BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_alert_events_level_created (level, created_at),
      INDEX idx_alert_events_handled (handled)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS learning_progress (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      course_id VARCHAR(36) NOT NULL,
      chapter_id VARCHAR(36) NOT NULL,
      progress_percentage INT DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY user_course_chapter (user_id, course_id, chapter_id)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_notes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      lesson_id INT,
      title VARCHAR(255),
      content TEXT NOT NULL,
      chapter_id VARCHAR(36),
      tags JSON NULL,
      is_public BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      tags JSON NULL,
      status VARCHAR(30) DEFAULT 'published',
      is_pinned BOOLEAN DEFAULT FALSE,
      is_hot BOOLEAN DEFAULT FALSE,
      view_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_community_posts_status_created (status, created_at),
      INDEX idx_community_posts_user_id (user_id)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS community_comments (
      id VARCHAR(36) PRIMARY KEY,
      post_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      status VARCHAR(30) DEFAULT 'published',
      parent_id VARCHAR(36) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_community_comments_post_id (post_id),
      INDEX idx_community_comments_status (status)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS community_likes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      post_id VARCHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_post_like (user_id, post_id),
      INDEX idx_community_likes_post_id (post_id)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS community_bookmarks (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      post_id VARCHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_post_bookmark (user_id, post_id),
      INDEX idx_community_bookmarks_post_id (post_id)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS community_reports (
      id VARCHAR(36) PRIMARY KEY,
      reporter_id VARCHAR(36) NOT NULL,
      target_type VARCHAR(30) NOT NULL,
      target_id VARCHAR(36) NOT NULL,
      reason VARCHAR(255) NOT NULL,
      detail TEXT,
      status VARCHAR(30) DEFAULT 'pending',
      handled_by VARCHAR(36),
      handled_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_community_reports_status (status),
      INDEX idx_community_reports_target (target_type, target_id)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS resource_categories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) UNIQUE NOT NULL,
      description TEXT,
      sort_order INT DEFAULT 0,
      enabled BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`ALTER TABLE resources ADD COLUMN IF NOT EXISTS era VARCHAR(50) DEFAULT NULL AFTER resource_type`).catch(() => {})
  await pool.execute(`ALTER TABLE resources ADD COLUMN IF NOT EXISTS author VARCHAR(120) DEFAULT NULL AFTER era`).catch(() => {})

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS resources (
      id VARCHAR(36) PRIMARY KEY,
      category_id VARCHAR(36),
      title VARCHAR(255) NOT NULL,
      summary TEXT,
      content LONGTEXT,
      resource_type VARCHAR(40) DEFAULT 'article',
      era VARCHAR(50) DEFAULT NULL,
      author VARCHAR(120) DEFAULT NULL,
      cover_url VARCHAR(500),
      file_url VARCHAR(500),
      tags JSON NULL,
      status VARCHAR(30) DEFAULT 'published',
      sort_order INT DEFAULT 0,
      view_count INT DEFAULT 0,
      download_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_resources_category_status (category_id, status),
      INDEX idx_resources_status_sort (status, sort_order)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tts_tasks (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      text TEXT NOT NULL,
      voice VARCHAR(80) DEFAULT 'longxiaochun',
      speed DECIMAL(4, 2) DEFAULT 1.00,
      volume DECIMAL(4, 2) DEFAULT 1.00,
      status VARCHAR(30) DEFAULT 'pending',
      audio_url VARCHAR(500),
      error_message TEXT,
      metadata JSON NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tts_tasks_user_created (user_id, created_at),
      INDEX idx_tts_tasks_status (status)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      related_id VARCHAR(36),
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notify_user_read (user_id, is_read, created_at)
    )
  `)

  await seedAdminDefaults()
}

async function seedAdminDefaults() {
  const roles = [
    ['super_admin', '超级管理员', '拥有全部后台权限'],
    ['content_admin', '内容管理员', '管理章节、学习路径和资源'],
    ['community_moderator', '社区审核员', '管理社区内容和举报'],
    ['ai_operator', 'AI 运维', '管理 AI 配置和调用统计']
  ]

  const permissions = [
    ['admin:read', '查看后台基础信息'],
    ['user:list', '查看用户列表'],
    ['user:update', '更新用户状态'],
    ['content:manage', '管理内容配置'],
    ['learning:manage', '查看学习路径和学习进度'],
    ['resource:manage', '管理资源库'],
    ['community:moderate', '审核社区内容'],
    ['tts:manage', '管理 TTS 任务'],
    ['ai_config:manage', '管理 AI 配置'],
    ['audit:read', '查看操作日志']
  ]

  for (const [code, name, description] of roles) {
    await pool.execute(
      'INSERT IGNORE INTO roles (id, code, name, description) VALUES (?, ?, ?, ?)',
      [randomUUID(), code, name, description]
    )
  }

  for (const [code, name] of permissions) {
    await pool.execute(
      'INSERT IGNORE INTO permissions (id, code, name) VALUES (?, ?, ?)',
      [randomUUID(), code, name]
    )
  }

  await pool.execute(`
    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'super_admin'
  `)

  await pool.execute(`
    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('content:manage', 'learning:manage', 'resource:manage')
    WHERE r.code = 'content_admin'
  `)

  await pool.execute(`
    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code = 'community:moderate'
    WHERE r.code = 'community_moderator'
  `)

  await pool.execute(`
    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('ai_config:manage', 'tts:manage', 'audit:read')
    WHERE r.code = 'ai_operator'
  `)

  const resourceCategories = [
    ['dao-texts', '经典原文', '道德经原文、译注与版本资料'],
    ['audio', '音频资源', '诵读、讲解和 TTS 音频'],
    ['learning', '学习资料', '课程、导读、练习与拓展阅读']
  ]

  for (const [slug, name, description] of resourceCategories) {
    await pool.execute(
      'INSERT IGNORE INTO resource_categories (id, slug, name, description) VALUES (?, ?, ?, ?)',
      [randomUUID(), slug, name, description]
    )
  }

  const adminUsername = process.env.ADMIN_BOOTSTRAP_USERNAME
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (!adminUsername || !adminPassword) return

  const [existing] = await pool.execute('SELECT id FROM admin_users WHERE username = ?', [adminUsername])
  if (existing.length > 0) return

  const adminId = randomUUID()
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  await pool.execute(
    'INSERT INTO admin_users (id, username, password_hash, display_name, role_code) VALUES (?, ?, ?, ?, ?)',
    [adminId, adminUsername, passwordHash, '系统管理员', 'super_admin']
  )
  await pool.execute(`
    INSERT IGNORE INTO admin_user_roles (admin_user_id, role_id)
    SELECT ?, id FROM roles WHERE code = 'super_admin'
  `, [adminId])
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' })
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: '密码长度至少8位' })
    }

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '邮箱或用户名已存在' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const id = randomUUID()

    await pool.execute(
      'INSERT INTO users (id, username, email, password_hash, plain_password, display_name) VALUES (?, ?, ?, ?, ?, ?)',
      [id, username, email, passwordHash, password, username]
    )

    const user = { id, username, email, display_name: username, subscription_tier: 'free', email_verified: false }
    const token = generateToken(user)

    res.status(201).json({ success: true, token, user: { ...user, created_at: new Date().toISOString() } })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({ success: false, message: '注册失败' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: '请填写邮箱和密码' })
    }

    const loginLock = await checkLoginLock(req, email, 'user')
    if (loginLock.locked) {
      res.setHeader('Retry-After', String(loginLock.retryAfterSeconds))
      await securityEvent(req, 'login.locked', 'user', { retryAfterSeconds: loginLock.retryAfterSeconds })
      return sendError(res, 429, 'LOGIN_LOCKED', '登录失败次数过多，请稍后再试')
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email])

    if (users.length === 0) {
      await recordLoginFailure(loginLock.key, { scope: 'user', requestId: req.requestId, ip: getClientIp(req) })
      await securityEvent(req, 'login.failed', 'user', { reason: 'user_not_found' })
      return sendError(res, 401, 'INVALID_CREDENTIALS', '邮箱或密码错误')
    }

    const user = users[0]
    if (user.is_active === 0) {
      return sendError(res, 403, 'ACCOUNT_DISABLED', '账号已被禁用')
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      await recordLoginFailure(loginLock.key, { scope: 'user', requestId: req.requestId, ip: getClientIp(req) })
      await securityEvent(req, 'login.failed', 'user', { userId: user.id, reason: 'bad_password' })
      return sendError(res, 401, 'INVALID_CREDENTIALS', '邮箱或密码错误')
    }

    await clearLoginFailures(loginLock.key)
    await securityEvent(req, 'login.success', 'user', { userId: user.id })
    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])

    const token = generateToken(user)
    const formatted = formatUser(user)
    formatted.last_login = new Date().toISOString()

    res.status(200).json({ success: true, token, user: formatted })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ success: false, message: '登录失败' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id])

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    // Auto-downgrade expired subscriptions
    const user = await autoDowngradeExpired(pool, users[0])

    res.status(200).json({ success: true, user: formatUser(user) })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ success: false, message: '获取用户信息失败' })
  }
})

app.patch('/api/auth/subscription', authMiddleware, async (req, res) => {
  try {
    const { tier } = req.body
    const validTiers = new Set(['free', 'pro', 'master', 'team'])
    if (!validTiers.has(tier)) {
      return res.status(400).json({ success: false, message: '无效的会员等级' })
    }

    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 30)

    await pool.execute(
      'UPDATE users SET subscription_tier = ?, subscription_expiry = ? WHERE id = ?',
      [tier, expiry, req.user.id]
    )

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id])
    res.json({ success: true, user: formatUser(users[0]) })
  } catch (error) {
    console.error('升级会员失败:', error)
    res.status(500).json({ success: false, message: '升级会员失败' })
  }
})

app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  const startedAt = Date.now()
  let providerForLog = req.body?.provider || 'deepseek'
  let modelForLog = req.body?.model || ''
  try {
    const { provider: providerName = 'deepseek', model, messages, temperature = 0.7, max_tokens = 2000 } = req.body
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages 不能为空' })
    }

    const provider = await resolveAIProvider(providerName)
    providerForLog = provider.name
    modelForLog = model || provider.defaultModel
    if (!provider.enabled) {
      return res.status(503).json({ success: false, message: `AI 供应商 [${provider.name}] 已被禁用，请联系管理员` })
    }
    if (!provider.apiKey) {
      const content = buildMockAIResponse(messages)
      logServiceCall({
        type: 'ai_call',
        req,
        provider: provider.name,
        model: modelForLog,
        status: 'mock-no-server-key',
        durationMs: Date.now() - startedAt
      })
      return res.json({
        success: true,
        content,
        provider: provider.name,
        model: modelForLog,
        mode: 'mock-no-server-key'
      })
    }

    const response = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: model || provider.defaultModel,
        messages,
        temperature,
        max_tokens,
        stream: false
      })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error?.message || `AI 供应商请求失败 (${response.status})`)
    }

    const content = data.choices?.[0]?.message?.content || ''
    const usage = data.usage || {}
    const estimatedCost = estimateAiCost(usage.total_tokens || 0, SECURITY_CONFIG.aiDefaultCostPer1kTokens)
    if (usage.total_tokens) {
      await pool.execute(
        `INSERT INTO ai_usage_logs
         (id, user_id, provider_name, model_name, prompt_tokens, completion_tokens, total_tokens, estimated_cost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          req.user.id,
          provider.name,
          modelForLog,
          usage.prompt_tokens || 0,
          usage.completion_tokens || 0,
          usage.total_tokens || 0,
          estimatedCost,
          'success'
        ]
      )
    }

    logServiceCall({
      type: 'ai_call',
      req,
      provider: provider.name,
      model: modelForLog,
      status: 'success',
      durationMs: Date.now() - startedAt,
      tokens: usage.total_tokens || 0,
      estimatedCost
    })

    res.json({
      success: true,
      content,
      provider: provider.name,
      model: modelForLog,
      usage,
      estimatedCost
    })
  } catch (error) {
    logServiceCall({
      type: 'ai_call',
      req,
      provider: providerForLog,
      model: modelForLog,
      status: 'failed',
      durationMs: Date.now() - startedAt,
      error: error.message
    })
    console.error('AI 代理调用失败:', error)
    res.status(502).json({ success: false, message: error.message || 'AI 代理调用失败' })
  }
})

app.post('/api/ai/chat/stream', authMiddleware, async (req, res) => {
  const startedAt = Date.now()
  let providerForLog = req.body?.provider || 'deepseek'
  let modelForLog = req.body?.model || ''
  const upstreamAbort = new AbortController()
  let heartbeatTimer = null
  let mockTimer = null
  let streamClosed = false

  const closeStream = () => {
    if (streamClosed) return
    streamClosed = true
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    if (mockTimer) clearTimeout(mockTimer)
    upstreamAbort.abort()
    try { res.end() } catch { /* socket already closed */ }
  }

  req.on('close', () => {
    if (!res.writableEnded) {
      closeStream()
    }
  })

  try {
    const { provider: providerName = 'deepseek', model, messages, temperature = 0.7, max_tokens = 2000 } = req.body
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages 不能为空' })
    }

    const provider = await resolveAIProvider(providerName)
    providerForLog = provider.name
    modelForLog = model || provider.defaultModel

    if (!provider.enabled) {
      return res.status(503).json({ success: false, message: `AI 供应商 [${provider.name}] 已被禁用，请联系管理员` })
    }

    res.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    })
    res.flushHeaders?.()
    if (res.socket) {
      res.socket.setNoDelay(true)
      res.socket.setKeepAlive(true)
    }

    heartbeatTimer = setInterval(() => {
      if (!streamClosed) {
        try { res.write(SSE_COMMENT_PING) } catch { closeStream() }
      }
    }, 15000)

    if (!provider.apiKey) {
      const fullText = buildMockAIResponse(messages)
      const chunks = chunkTextForMock(fullText, 5)
      let aggregated = ''
      let cursor = 0
      const pushNext = () => {
        if (streamClosed) return
        if (cursor >= chunks.length) {
          res.write(formatSSEData({ event: 'done', usage: null, estimatedCost: 0, mode: 'mock-no-server-key' }))
          res.write(SSE_DONE_LINE)
          logServiceCall({
            type: 'ai_call',
            req,
            provider: provider.name,
            model: modelForLog,
            status: 'mock-no-server-key',
            durationMs: Date.now() - startedAt
          })
          closeStream()
          return
        }
        const delta = chunks[cursor++]
        aggregated += delta
        try { res.write(formatSSEData({ delta })) } catch { closeStream(); return }
        mockTimer = setTimeout(pushNext, 50)
      }
      pushNext()
      return
    }

    const upstreamResp = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
        Accept: 'text/event-stream'
      },
      body: JSON.stringify({
        model: model || provider.defaultModel,
        messages,
        temperature,
        max_tokens,
        stream: true,
        stream_options: { include_usage: true }
      }),
      signal: upstreamAbort.signal
    })

    if (!upstreamResp.ok || !upstreamResp.body) {
      const errBody = await upstreamResp.text().catch(() => '')
      throw new Error(`AI 供应商上游错误 (${upstreamResp.status}): ${errBody.slice(0, 200)}`)
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let aggregatedContent = ''
    let finalUsage = null

    for await (const chunk of upstreamResp.body) {
      if (streamClosed) break
      const text = decoder.decode(chunk, { stream: true })
      const split = splitSSEBuffer(buffer, text)
      buffer = split.remainingBuffer
      for (const eventBlock of split.events) {
        const parsed = parseSSEEvent(eventBlock)
        if (parsed.type === 'done') {
          // 上游 [DONE] —— 等待循环自然结束后写本地 done 事件
          continue
        }
        if (parsed.type === 'message') {
          const { delta, usage } = extractDeltaAndUsage(parsed.payload)
          if (delta) {
            aggregatedContent += delta
            try { res.write(formatSSEData({ delta })) } catch { closeStream(); return }
          }
          if (usage) finalUsage = usage
        }
      }
    }

    if (buffer.trim()) {
      const parsed = parseSSEEvent(buffer)
      if (parsed.type === 'message') {
        const { delta, usage } = extractDeltaAndUsage(parsed.payload)
        if (delta) {
          aggregatedContent += delta
          try { res.write(formatSSEData({ delta })) } catch { closeStream(); return }
        }
        if (usage) finalUsage = usage
      }
    }

    if (streamClosed) return

    const totalTokens = finalUsage?.total_tokens || 0
    const estimatedCost = estimateAiCost(totalTokens, SECURITY_CONFIG.aiDefaultCostPer1kTokens)
    res.write(formatSSEData({ event: 'done', usage: finalUsage, estimatedCost }))
    res.write(SSE_DONE_LINE)

    if (totalTokens > 0) {
      await pool.execute(
        `INSERT INTO ai_usage_logs
         (id, user_id, provider_name, model_name, prompt_tokens, completion_tokens, total_tokens, estimated_cost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          req.user.id,
          provider.name,
          modelForLog,
          finalUsage.prompt_tokens || 0,
          finalUsage.completion_tokens || 0,
          totalTokens,
          estimatedCost,
          'success'
        ]
      ).catch(err => console.error('写入 ai_usage_logs 失败:', err))
    }

    logServiceCall({
      type: 'ai_call',
      req,
      provider: provider.name,
      model: modelForLog,
      status: 'success-stream',
      durationMs: Date.now() - startedAt,
      tokens: totalTokens,
      estimatedCost
    })

    closeStream()
  } catch (error) {
    logServiceCall({
      type: 'ai_call',
      req,
      provider: providerForLog,
      model: modelForLog,
      status: 'failed-stream',
      durationMs: Date.now() - startedAt,
      error: error.message
    })
    console.error('AI 流式代理调用失败:', error)
    if (!res.headersSent) {
      res.status(502).json({ success: false, message: error.message || 'AI 流式代理调用失败' })
    } else if (!streamClosed) {
      try {
        res.write(formatSSEData({ event: 'error', message: error.message || 'stream-error' }))
        res.write(SSE_DONE_LINE)
      } catch { /* socket already closed */ }
      closeStream()
    }
  }
})

async function runCouncilPersona(persona, question, provider, model) {
  if (!provider.apiKey) {
    const content = buildMockAIResponse([
      { role: 'system', content: persona.system },
      { role: 'user', content: question }
    ])
    return {
      personaId: persona.id,
      personaName: persona.name,
      icon: persona.icon,
      content: `[${persona.name}] ${content}`,
      status: 'mock-no-server-key',
      tokens: 0
    }
  }
  const upstream = await fetch(provider.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: persona.system },
        { role: 'user', content: question }
      ],
      temperature: persona.temperature,
      max_tokens: 600,
      stream: false
    })
  })
  const data = await upstream.json().catch(() => ({}))
  if (!upstream.ok) {
    throw new Error(data.error?.message || `AI 供应商请求失败 (${upstream.status})`)
  }
  const content = data.choices?.[0]?.message?.content || ''
  const usage = data.usage || {}
  return {
    personaId: persona.id,
    personaName: persona.name,
    icon: persona.icon,
    content,
    status: 'success',
    tokens: usage.total_tokens || 0,
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0
  }
}

async function runCouncilPersonaWithMessages(persona, messages, provider, model) {
  if (!provider.apiKey) {
    const content = buildMockAIResponse(messages)
    return {
      personaId: persona.id,
      personaName: persona.name,
      icon: persona.icon,
      content: `[${persona.name}·二轮] ${content}`,
      status: 'mock-no-server-key',
      tokens: 0
    }
  }
  const upstream = await fetch(provider.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: persona.temperature,
      max_tokens: 600,
      stream: false
    })
  })
  const data = await upstream.json().catch(() => ({}))
  if (!upstream.ok) {
    throw new Error(data.error?.message || `AI 供应商请求失败 (${upstream.status})`)
  }
  const content = data.choices?.[0]?.message?.content || ''
  const usage = data.usage || {}
  return {
    personaId: persona.id,
    personaName: persona.name,
    icon: persona.icon,
    content,
    status: 'success',
    tokens: usage.total_tokens || 0,
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0
  }
}

app.post('/api/ai/council', authMiddleware, async (req, res) => {
  const startedAt = Date.now()
  let providerForLog = req.body?.provider || 'deepseek'
  let modelForLog = req.body?.model || ''
  try {
    const { provider: providerName = 'deepseek', model, question, mode = 'parallel' } = req.body
    const validation = validateCouncilQuestion(question)
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message })
    }
    const trimmedQuestion = validation.value
    const debateMode = mode === 'debate'

    const provider = await resolveAIProvider(providerName)
    providerForLog = provider.name
    modelForLog = model || provider.defaultModel
    if (!provider.enabled) {
      return res.status(503).json({ success: false, message: `AI 供应商 [${provider.name}] 已被禁用` })
    }

    const round1 = await Promise.all(
      COUNCIL_PERSONAS.map(p =>
        runCouncilPersona(p, trimmedQuestion, provider, modelForLog)
          .catch(err => buildCouncilFailureFallback(p, err.message))
      )
    )

    if (!debateMode) {
      const agg = aggregateCouncilResults(round1)
      const { totalTokens, promptTokens, completionTokens, failedCount } = agg
      const estimatedCost = estimateAiCost(totalTokens, SECURITY_CONFIG.aiDefaultCostPer1kTokens)

      if (totalTokens > 0 && provider.apiKey) {
        pool.execute(
          `INSERT INTO ai_usage_logs
           (id, user_id, provider_name, model_name, prompt_tokens, completion_tokens, total_tokens, estimated_cost, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            req.user.id,
            provider.name,
            modelForLog,
            promptTokens,
            completionTokens,
            totalTokens,
            estimatedCost,
            'success-council'
          ]
        ).catch(err => console.error('写入 ai_usage_logs 失败 (council):', err))
      }

      logServiceCall({
        type: 'ai_call',
        req,
        provider: provider.name,
        model: modelForLog,
        status: failedCount === 0 ? 'success-council' : 'partial-council',
        durationMs: Date.now() - startedAt,
        tokens: totalTokens,
        estimatedCost
      })

      return res.json({
        success: true,
        provider: provider.name,
        model: modelForLog,
        personas: round1,
        totalTokens,
        estimatedCost,
        mode: provider.apiKey ? 'live' : 'mock-no-server-key'
      })
    }

    // ---- Debate mode: round 2 with peer awareness ----
    const round2 = await Promise.all(
      COUNCIL_PERSONAS.map(async (p, idx) => {
        const peerResponses = round1.filter((_, i) => i !== idx)
        const debatePrompt = buildDebatePeerPrompt(p, trimmedQuestion, peerResponses)
        if (!debatePrompt) {
          // No usable peer content -> skip with informative fallback
          return buildCouncilFailureFallback(p, '第一轮其他人格均失败,跳过本轮')
        }
        try {
          return await runCouncilPersonaWithMessages(p, debatePrompt.messages, provider, modelForLog)
        } catch (err) {
          return buildCouncilFailureFallback(p, err.message)
        }
      })
    )

    const debateAgg = aggregateDebateResults(round1, round2)
    const totalTokens = debateAgg.totalTokens
    const promptTokens = debateAgg.promptTokens
    const completionTokens = debateAgg.completionTokens
    const estimatedCost = estimateAiCost(totalTokens, SECURITY_CONFIG.aiDefaultCostPer1kTokens)

    if (totalTokens > 0 && provider.apiKey) {
      pool.execute(
        `INSERT INTO ai_usage_logs
         (id, user_id, provider_name, model_name, prompt_tokens, completion_tokens, total_tokens, estimated_cost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          req.user.id,
          provider.name,
          modelForLog,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost,
          debateAgg.status
        ]
      ).catch(err => console.error('写入 ai_usage_logs 失败 (debate):', err))
    }

    logServiceCall({
      type: 'ai_call',
      req,
      provider: provider.name,
      model: modelForLog,
      status: debateAgg.status,
      durationMs: Date.now() - startedAt,
      tokens: totalTokens,
      estimatedCost
    })

    res.json({
      success: true,
      provider: provider.name,
      model: modelForLog,
      mode: 'debate',
      rounds: [
        { round: 1, personas: round1 },
        { round: 2, personas: round2 }
      ],
      // Keep `personas` field for convenience (=round1) so existing clients that
      // ignore `rounds` still see something.
      personas: round1,
      totalTokens,
      estimatedCost,
      status: debateAgg.status
    })
  } catch (error) {
    logServiceCall({
      type: 'ai_call',
      req,
      provider: providerForLog,
      model: modelForLog,
      status: 'failed-council',
      durationMs: Date.now() - startedAt,
      error: error.message
    })
    console.error('AI 议事调用失败:', error)
    res.status(502).json({ success: false, message: error.message || 'AI 议事调用失败' })
  }
})

app.post('/api/ai/divination', authMiddleware, async (req, res) => {
  const startedAt = Date.now()
  let providerForLog = req.body?.provider || 'deepseek'
  let modelForLog = req.body?.model || ''
  try {
    const { provider: providerName = 'deepseek', model, reroll = false } = req.body || {}
    const userId = req.user.id
    const dateKey = getDateKey()
    const salt = reroll ? `reroll:${Date.now()}:${randomUUID().slice(0, 8)}` : null
    const chapter = pickChapterDeterministic(userId, dateKey, salt)
    const chapterText = getChapterText(chapter) || { content: '', modern: '' }

    const provider = await resolveAIProvider(providerName)
    providerForLog = provider.name
    modelForLog = model || provider.defaultModel
    if (!provider.enabled) {
      return res.status(503).json({ success: false, message: `AI 供应商 [${provider.name}] 已被禁用` })
    }

    const { messages } = buildDivinationPrompt(chapter, chapterText.content, chapterText.modern)

    if (!provider.apiKey) {
      const mock = buildMockDivination(chapter)
      logServiceCall({
        type: 'ai_call',
        req,
        provider: provider.name,
        model: modelForLog,
        status: 'mock-divination',
        durationMs: Date.now() - startedAt,
        tokens: 0,
        estimatedCost: 0
      })
      return res.json({
        success: true,
        provider: provider.name,
        model: modelForLog,
        chapter,
        content: chapterText.content,
        modern: chapterText.modern,
        insight: mock.insight,
        action: mock.action,
        dateKey,
        reroll: Boolean(reroll),
        generatedAt: new Date().toISOString(),
        mode: 'mock-no-server-key'
      })
    }

    const upstream = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: modelForLog,
        messages,
        temperature: 0.7,
        max_tokens: 200,
        stream: false
      })
    })
    const data = await upstream.json().catch(() => ({}))
    if (!upstream.ok) {
      throw new Error(data.error?.message || `AI 供应商请求失败 (${upstream.status})`)
    }
    const rawText = data.choices?.[0]?.message?.content || ''
    const parsed = parseDivinationContent(rawText)
    const insight = parsed.insight || buildMockDivination(chapter).insight
    const action = parsed.action || buildMockDivination(chapter).action

    const usage = data.usage || {}
    const totalTokens = usage.total_tokens || 0
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0
    const estimatedCost = estimateAiCost(totalTokens, SECURITY_CONFIG.aiDefaultCostPer1kTokens)

    if (totalTokens > 0) {
      pool.execute(
        `INSERT INTO ai_usage_logs
         (id, user_id, provider_name, model_name, prompt_tokens, completion_tokens, total_tokens, estimated_cost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          userId,
          provider.name,
          modelForLog,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost,
          'success-divination'
        ]
      ).catch(err => console.error('写入 ai_usage_logs 失败 (divination):', err))
    }

    logServiceCall({
      type: 'ai_call',
      req,
      provider: provider.name,
      model: modelForLog,
      status: 'success-divination',
      durationMs: Date.now() - startedAt,
      tokens: totalTokens,
      estimatedCost
    })

    res.json({
      success: true,
      provider: provider.name,
      model: modelForLog,
      chapter,
      content: chapterText.content,
      modern: chapterText.modern,
      insight,
      action,
      dateKey,
      reroll: Boolean(reroll),
      generatedAt: new Date().toISOString(),
      totalTokens,
      estimatedCost,
      mode: 'live'
    })
  } catch (error) {
    logServiceCall({
      type: 'ai_call',
      req,
      provider: providerForLog,
      model: modelForLog,
      status: 'failed-divination',
      durationMs: Date.now() - startedAt,
      error: error.message
    })
    console.error('AI 道签调用失败:', error)
    res.status(502).json({ success: false, message: error.message || 'AI 道签调用失败' })
  }
})

app.get('/api/user/value-report', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const [monthRows] = await pool.execute(
      `SELECT COUNT(*) AS calls, COALESCE(SUM(total_tokens), 0) AS tokens, COALESCE(SUM(estimated_cost), 0) AS cost
       FROM ai_usage_logs
       WHERE user_id = ? AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
      [userId]
    )
    const [lifetimeRows] = await pool.execute(
      `SELECT COUNT(*) AS calls, COALESCE(SUM(total_tokens), 0) AS tokens, COALESCE(SUM(estimated_cost), 0) AS cost
       FROM ai_usage_logs
       WHERE user_id = ?`,
      [userId]
    )
    const [progressRows] = await pool.execute(
      `SELECT COUNT(DISTINCT chapter_id) AS learned
       FROM learning_progress
       WHERE user_id = ? AND completed = 1`,
      [userId]
    )

    const monthRow = monthRows && monthRows[0] ? monthRows[0] : { calls: 0, tokens: 0, cost: 0 }
    const lifetimeRow = lifetimeRows && lifetimeRows[0] ? lifetimeRows[0] : { calls: 0, tokens: 0, cost: 0 }
    const learnedChapters = progressRows && progressRows[0] ? Number(progressRows[0].learned) || 0 : 0

    const report = formatValueReport({ monthRow, lifetimeRow, learnedChapters })
    res.json({ success: true, ...report, generatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('获取价值报告失败:', error)
    res.status(500).json({ success: false, message: error.message || '获取价值报告失败' })
  }
})

app.post('/api/leads', async (req, res) => {
  try {
    const { valid, errors } = validateLeadInput(req.body)
    if (!valid) {
      return res.status(400).json({ success: false, message: '提交内容有误', errors })
    }
    const normalized = normalizeLeadInput(req.body)
    const [result] = await pool.execute(
      `INSERT INTO leads (name, email, company, phone, team_size, intent, note, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalized.name,
        normalized.email,
        normalized.company,
        normalized.phone,
        normalized.teamSize,
        normalized.intent,
        normalized.note,
        getClientIp(req)
      ]
    )
    res.json({
      success: true,
      id: result.insertId,
      message: '已收到您的需求,我们会在 24 小时内联系您'
    })
  } catch (error) {
    console.error('提交销售线索失败:', error)
    res.status(500).json({ success: false, message: error.message || '提交失败,请稍后再试' })
  }
})

app.get('/api/admin/leads', adminAuthMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20))
    const offset = (page - 1) * pageSize
    const statusFilter = req.query.status
    const params = []
    let where = ''
    if (statusFilter && typeof statusFilter === 'string') {
      where = 'WHERE status = ?'
      params.push(statusFilter)
    }
    const [rows] = await pool.execute(
      `SELECT id, name, email, company, phone, team_size, intent, note, status, ip_address, created_at
       FROM leads ${where}
       ORDER BY created_at DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    )
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM leads ${where}`,
      params
    )
    res.json({
      success: true,
      page,
      pageSize,
      total: countRows[0]?.total || 0,
      leads: rows,
      options: {
        teamSize: LEADS_TEAM_SIZE_OPTIONS,
        intent: LEADS_INTENT_OPTIONS
      }
    })
  } catch (error) {
    console.error('获取销售线索列表失败:', error)
    res.status(500).json({ success: false, message: error.message || '获取失败' })
  }
})

const LEAD_STATUS_VALUES = new Set(['new', 'contacted', 'qualified', 'closed'])

app.patch('/api/admin/leads/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ success: false, message: '无效的 lead id' })
    }
    const { status } = req.body || {}
    if (!LEAD_STATUS_VALUES.has(status)) {
      return res.status(400).json({
        success: false,
        message: `status 必须为 ${[...LEAD_STATUS_VALUES].join(' | ')}`
      })
    }
    const [result] = await pool.execute(
      'UPDATE leads SET status = ? WHERE id = ?',
      [status, id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '未找到对应的线索' })
    }
    res.json({ success: true })
  } catch (error) {
    console.error('更新销售线索状态失败:', error)
    res.status(500).json({ success: false, message: error.message || '更新失败' })
  }
})

app.post('/api/tts/synthesize', authMiddleware, async (req, res) => {
  const startedAt = Date.now()
  try {
    const { text, voice = 'longxiaochun', speed = 1.0, volume = 1.0 } = req.body
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'text 不能为空' })
    }

    const processedText = text.replace(/\s+/g, ' ').trim()
    if (processedText.length > 5000) {
      return res.status(400).json({ success: false, message: '文本长度超过限制' })
    }

    if (!TTS_CONFIG.dashscopeApiKey) {
      logServiceCall({
        type: 'tts_call',
        req,
        provider: 'dashscope',
        model: TTS_CONFIG.model,
        status: 'browser-fallback',
        durationMs: Date.now() - startedAt
      })
      return res.json({
        success: true,
        mode: 'browser-fallback',
        message: '服务端未配置 TTS API Key，请使用浏览器内置语音合成'
      })
    }

    const response = await fetch(TTS_CONFIG.dashscopeUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TTS_CONFIG.dashscopeApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TTS_CONFIG.model,
        input: { text: processedText },
        parameters: {
          voice,
          speed_ratio: speed,
          volume_ratio: volume
        }
      })
    })

    const contentType = response.headers.get('content-type') || ''
    if (!response.ok) {
      const errorData = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {}
      throw new Error(errorData.error?.message || errorData.message || `TTS 请求失败 (${response.status})`)
    }

    if (contentType.includes('application/json')) {
      const data = await response.json()
      logServiceCall({
        type: 'tts_call',
        req,
        provider: 'dashscope',
        model: TTS_CONFIG.model,
        status: 'success',
        durationMs: Date.now() - startedAt
      })
      return res.json({
        success: true,
        mode: 'server-url',
        audioUrl: data.output?.audio || data.output?.url || data.audio_url || '',
        raw: data
      })
    }

    const arrayBuffer = await response.arrayBuffer()
    logServiceCall({
      type: 'tts_call',
      req,
      provider: 'dashscope',
      model: TTS_CONFIG.model,
      status: 'success',
      durationMs: Date.now() - startedAt
    })
    res.setHeader('Content-Type', contentType || 'audio/mpeg')
    res.send(Buffer.from(arrayBuffer))
  } catch (error) {
    logServiceCall({
      type: 'tts_call',
      req,
      provider: 'dashscope',
      model: TTS_CONFIG.model,
      status: 'failed',
      durationMs: Date.now() - startedAt,
      error: error.message
    })
    console.error('TTS 代理调用失败:', error)
    res.status(502).json({ success: false, message: error.message || 'TTS 代理调用失败' })
  }
})

app.post('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const conversation = req.body || {}
    const id = conversation.id || randomUUID()
    const title = conversation.title || '新对话'

    await pool.execute(
      'INSERT INTO conversations (id, user_id, title, messages) VALUES (?, ?, ?, ?)',
      [id, req.user.id, title, buildConversationStorage({ ...conversation, id, title })]
    )

    const [rows] = await pool.execute('SELECT * FROM conversations WHERE id = ? AND user_id = ?', [id, req.user.id])
    res.status(201).json(formatConversation(rows[0]))
  } catch (error) {
    console.error('创建会话失败:', error)
    res.status(500).json({ success: false, message: '创建会话失败' })
  }
})

app.get('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    )
    res.json(rows.map(formatConversation))
  } catch (error) {
    console.error('加载会话失败:', error)
    res.status(500).json({ success: false, message: '加载会话失败' })
  }
})

app.get('/api/conversations/search', authMiddleware, async (req, res) => {
  try {
    const keyword = String(req.query.q || '').trim().toLowerCase()
    const persona = String(req.query.persona || '').trim()
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    )

    const results = rows
      .map(formatConversation)
      .filter(conversation => {
        const matchesPersona = !persona || conversation.persona === persona
        const matchesKeyword = !keyword ||
          conversation.title.toLowerCase().includes(keyword) ||
          conversation.messages.some(message => String(message.content || '').toLowerCase().includes(keyword))
        return matchesPersona && matchesKeyword
      })

    res.json(results)
  } catch (error) {
    console.error('搜索会话失败:', error)
    res.status(500).json({ success: false, message: '搜索会话失败' })
  }
})

app.post('/api/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '会话不存在' })
    }

    const conversation = formatConversation(rows[0])
    conversation.messages.push(req.body)

    if (conversation.messages.length === 2 && conversation.messages[0]?.type === 'user') {
      conversation.title = `${String(conversation.messages[0].content || '').slice(0, 30)}...`
    }

    await pool.execute(
      'UPDATE conversations SET title = ?, messages = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [conversation.title, buildConversationStorage(conversation), req.params.id, req.user.id]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('保存会话消息失败:', error)
    res.status(500).json({ success: false, message: '保存会话消息失败' })
  }
})

app.delete('/api/conversations/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM conversations WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    res.json({ success: true })
  } catch (error) {
    console.error('删除会话失败:', error)
    res.status(500).json({ success: false, message: '删除会话失败' })
  }
})

app.get('/api/learning/progress', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM learning_progress WHERE user_id = ?', [req.user.id])
    const progress = {}
    rows.forEach(row => {
      if (!progress[row.course_id]) progress[row.course_id] = {}
      progress[row.course_id][row.chapter_id] = row.progress_percentage
    })
    res.json({ success: true, progress })
  } catch (error) {
    console.error('获取学习进度失败:', error)
    res.status(500).json({ success: false, message: '获取学习进度失败' })
  }
})

app.put('/api/learning/progress', authMiddleware, async (req, res) => {
  try {
    const { courseId, chapterId, progress } = req.body
    const normalizedProgress = Math.max(0, Math.min(100, Number(progress)))
    if (!courseId || !chapterId || Number.isNaN(normalizedProgress)) {
      return res.status(400).json({ success: false, message: 'courseId、chapterId、progress 必填' })
    }

    await pool.execute(
      `INSERT INTO learning_progress (id, user_id, course_id, chapter_id, progress_percentage, completed, last_accessed)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE progress_percentage = VALUES(progress_percentage), completed = VALUES(completed), last_accessed = NOW(), updated_at = NOW()`,
      [randomUUID(), req.user.id, courseId, chapterId, normalizedProgress, normalizedProgress >= 100]
    )
    res.json({ success: true, progress: normalizedProgress })
  } catch (error) {
    console.error('更新学习进度失败:', error)
    res.status(500).json({ success: false, message: '更新学习进度失败' })
  }
})

app.get('/api/notes', authMiddleware, async (req, res) => {
  try {
    const lessonId = req.query.lessonId
    const params = [req.user.id]
    let where = 'WHERE user_id = ?'
    if (lessonId) {
      where += ' AND lesson_id = ?'
      params.push(Number(lessonId))
    }

    const [rows] = await pool.execute(`SELECT * FROM user_notes ${where} ORDER BY updated_at DESC`, params)
    res.json({ success: true, notes: rows.map(formatNote) })
  } catch (error) {
    console.error('获取笔记失败:', error)
    res.status(500).json({ success: false, message: '获取笔记失败' })
  }
})

app.post('/api/notes', authMiddleware, async (req, res) => {
  try {
    const note = req.body || {}
    if (!note.content) {
      return res.status(400).json({ success: false, message: '笔记内容不能为空' })
    }

    const id = note.id || randomUUID()
    await pool.execute(
      `INSERT INTO user_notes (id, user_id, lesson_id, title, content, chapter_id, tags, is_public, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        note.lessonId || null,
        note.title || null,
        note.content,
        note.chapterId || note.lessonId || null,
        JSON.stringify(note.tags || []),
        Boolean(note.isPublic),
        note.createdAt || new Date().toISOString(),
        note.updatedAt || new Date().toISOString()
      ]
    )

    const [rows] = await pool.execute('SELECT * FROM user_notes WHERE id = ? AND user_id = ?', [id, req.user.id])
    res.status(201).json({ success: true, note: formatNote(rows[0]) })
  } catch (error) {
    console.error('创建笔记失败:', error)
    res.status(500).json({ success: false, message: '创建笔记失败' })
  }
})

app.patch('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const note = req.body || {}
    await pool.execute(
      `UPDATE user_notes
       SET lesson_id = COALESCE(?, lesson_id), title = COALESCE(?, title), content = COALESCE(?, content),
           tags = COALESCE(?, tags), is_public = COALESCE(?, is_public), updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        note.lessonId ?? null,
        note.title ?? null,
        note.content ?? null,
        note.tags ? JSON.stringify(note.tags) : null,
        typeof note.isPublic === 'boolean' ? note.isPublic : null,
        req.params.id,
        req.user.id
      ]
    )

    const [rows] = await pool.execute('SELECT * FROM user_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (rows.length === 0) return res.status(404).json({ success: false, message: '笔记不存在' })
    res.json({ success: true, note: formatNote(rows[0]) })
  } catch (error) {
    console.error('更新笔记失败:', error)
    res.status(500).json({ success: false, message: '更新笔记失败' })
  }
})

app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM user_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    res.json({ success: true })
  } catch (error) {
    console.error('删除笔记失败:', error)
    res.status(500).json({ success: false, message: '删除笔记失败' })
  }
})

app.get('/api/community/posts', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const keyword = String(req.query.keyword || '').trim()
    const status = req.query.status === 'all' ? null : 'published'
    const params = []
    const whereParts = []

    if (status) {
      whereParts.push('p.status = ?')
      params.push(status)
    }
    if (keyword) {
      whereParts.push('(p.title LIKE ? OR p.content LIKE ?)')
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    const where = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''
    const [rows] = await pool.execute(
      `SELECT p.*, u.username, u.display_name,
        (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id AND c.status = 'published') AS comment_count,
        (SELECT COUNT(*) FROM community_bookmarks b WHERE b.post_id = p.id) AS bookmark_count,
        EXISTS(SELECT 1 FROM community_likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked,
        EXISTS(SELECT 1 FROM community_bookmarks b WHERE b.post_id = p.id AND b.user_id = ?) AS bookmarked
       FROM community_posts p
       LEFT JOIN users u ON u.id = p.user_id
       ${where}
       ORDER BY p.is_pinned DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, ...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM community_posts p ${where}`,
      params
    )

    res.json({ success: true, data: rows.map(formatCommunityPost), pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('获取社区帖子失败:', error)
    res.status(500).json({ success: false, message: '获取社区帖子失败' })
  }
})

app.post('/api/community/posts', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body
    if (!title || !content) {
      return res.status(400).json({ success: false, message: '标题和内容不能为空' })
    }

    const id = randomUUID()
    await pool.execute(
      'INSERT INTO community_posts (id, user_id, title, content, tags, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, String(title).trim(), String(content).trim(), JSON.stringify(Array.isArray(tags) ? tags : []), 'published']
    )
    const [rows] = await pool.execute(
      `SELECT p.*, u.username, u.display_name,
        0 AS like_count, 0 AS comment_count, 0 AS bookmark_count, FALSE AS liked, FALSE AS bookmarked
       FROM community_posts p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = ?`,
      [id]
    )

    res.status(201).json({ success: true, post: formatCommunityPost(rows[0]) })
  } catch (error) {
    console.error('发布社区帖子失败:', error)
    res.status(500).json({ success: false, message: '发布社区帖子失败' })
  }
})

app.get('/api/community/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, u.username, u.display_name
       FROM community_comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ? AND c.status = 'published'
       ORDER BY c.created_at ASC`,
      [req.params.id]
    )
    res.json({ success: true, data: rows.map(formatCommunityComment) })
  } catch (error) {
    console.error('获取社区评论失败:', error)
    res.status(500).json({ success: false, message: '获取社区评论失败' })
  }
})

app.post('/api/community/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content, parentId = null } = req.body
    if (!content) {
      return res.status(400).json({ success: false, message: '评论内容不能为空' })
    }

    const [posts] = await pool.execute('SELECT id FROM community_posts WHERE id = ? AND status = ?', [req.params.id, 'published'])
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在或不可评论' })
    }

    const id = randomUUID()
    await pool.execute(
      'INSERT INTO community_comments (id, post_id, user_id, content, parent_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.params.id, req.user.id, String(content).trim(), parentId, 'published']
    )
    const [rows] = await pool.execute(
      `SELECT c.*, u.username, u.display_name
       FROM community_comments c LEFT JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [id]
    )

    res.status(201).json({ success: true, comment: formatCommunityComment(rows[0]) })
  } catch (error) {
    console.error('发布社区评论失败:', error)
    res.status(500).json({ success: false, message: '发布社区评论失败' })
  }
})

app.post('/api/community/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const { liked = true } = req.body
    if (liked) {
      await pool.execute(
        'INSERT IGNORE INTO community_likes (id, user_id, post_id) VALUES (?, ?, ?)',
        [randomUUID(), req.user.id, req.params.id]
      )
    } else {
      await pool.execute('DELETE FROM community_likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id])
    }
    const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM community_likes WHERE post_id = ?', [req.params.id])
    res.json({ success: true, liked: Boolean(liked), likeCount: countRows[0].total })
  } catch (error) {
    console.error('更新点赞失败:', error)
    res.status(500).json({ success: false, message: '更新点赞失败' })
  }
})

app.post('/api/community/posts/:id/bookmark', authMiddleware, async (req, res) => {
  try {
    const { bookmarked = true } = req.body
    if (bookmarked) {
      await pool.execute(
        'INSERT IGNORE INTO community_bookmarks (id, user_id, post_id) VALUES (?, ?, ?)',
        [randomUUID(), req.user.id, req.params.id]
      )
    } else {
      await pool.execute('DELETE FROM community_bookmarks WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id])
    }
    res.json({ success: true, bookmarked: Boolean(bookmarked) })
  } catch (error) {
    console.error('更新收藏失败:', error)
    res.status(500).json({ success: false, message: '更新收藏失败' })
  }
})

app.post('/api/community/reports', authMiddleware, async (req, res) => {
  try {
    const { targetType, targetId, reason, detail = '' } = req.body
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: '举报对象和原因不能为空' })
    }

    const id = randomUUID()
    await pool.execute(
      'INSERT INTO community_reports (id, reporter_id, target_type, target_id, reason, detail) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, targetType, targetId, reason, detail]
    )

    // 创建通知：举报已提交
    await pool.execute(
      'INSERT INTO user_notifications (id, user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?, ?)',
      [randomUUID(), req.user.id, 'report_submitted', '举报已提交', `您对${targetType === 'post' ? '帖子' : '评论'}的举报已提交，管理员将尽快审核处理。`, id]
    )

    res.status(201).json({ success: true, id })
  } catch (error) {
    console.error('提交举报失败:', error)
    res.status(500).json({ success: false, message: '提交举报失败' })
  }
})

// 用户通知 / 收件箱
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const [rows] = await pool.execute(
      'SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.id, pageSize, offset]
    )
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM user_notifications WHERE user_id = ?',
      [req.user.id]
    )
    res.json({ success: true, data: rows, pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('获取通知失败:', error)
    res.status(500).json({ success: false, message: '获取通知失败' })
  }
})

app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM user_notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    )
    res.json({ success: true, count: rows[0].count })
  } catch (error) {
    console.error('获取未读通知数失败:', error)
    res.status(500).json({ success: false, message: '获取未读通知数失败' })
  }
})

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM user_notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '通知不存在' })
    }
    await pool.execute('UPDATE user_notifications SET is_read = TRUE WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('标记通知已读失败:', error)
    res.status(500).json({ success: false, message: '标记通知已读失败' })
  }
})

app.patch('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await pool.execute('UPDATE user_notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [req.user.id])
    res.json({ success: true })
  } catch (error) {
    console.error('标记全部已读失败:', error)
    res.status(500).json({ success: false, message: '标记全部已读失败' })
  }
})

app.get('/api/resources/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM resource_categories WHERE enabled = TRUE ORDER BY sort_order ASC, created_at ASC'
    )
    res.json({ success: true, data: rows.map(formatResourceCategory) })
  } catch (error) {
    console.error('获取资源分类失败:', error)
    res.status(500).json({ success: false, message: '获取资源分类失败' })
  }
})

app.get('/api/resources', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const params = []
    const whereParts = ['r.status = ?']
    params.push('published')

    if (req.query.categoryId) {
      whereParts.push('r.category_id = ?')
      params.push(req.query.categoryId)
    }
    if (req.query.type) {
      whereParts.push('r.resource_type = ?')
      params.push(req.query.type)
    }
    if (req.query.keyword) {
      whereParts.push('(r.title LIKE ? OR r.summary LIKE ? OR r.content LIKE ?)')
      const keyword = `%${String(req.query.keyword).trim()}%`
      params.push(keyword, keyword, keyword)
    }
    if (req.query.era) {
      whereParts.push('r.era = ?')
      params.push(req.query.era)
    }
    if (req.query.author) {
      whereParts.push('r.author = ?')
      params.push(req.query.author)
    }

    const where = `WHERE ${whereParts.join(' AND ')}`
    const [rows] = await pool.execute(
      `SELECT r.*, c.name AS category_name
       FROM resources r
       LEFT JOIN resource_categories c ON c.id = r.category_id
       ${where}
       ORDER BY r.sort_order ASC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM resources r ${where}`,
      params
    )

    res.json({ success: true, data: rows.map(formatResource), pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('获取资源列表失败:', error)
    res.status(500).json({ success: false, message: '获取资源列表失败' })
  }
})

app.post('/api/resources/:id/view', async (req, res) => {
  try {
    await pool.execute('UPDATE resources SET view_count = view_count + 1 WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('记录资源浏览失败:', error)
    res.status(500).json({ success: false, message: '记录资源浏览失败' })
  }
})

app.post('/api/resources/:id/download', async (req, res) => {
  try {
    await pool.execute('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('记录资源下载失败:', error)
    res.status(500).json({ success: false, message: '记录资源下载失败' })
  }
})

app.post('/api/tts/tasks', authMiddleware, async (req, res) => {
  try {
    const { text, voice = 'longxiaochun', speed = 1.0, volume = 1.0 } = req.body
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'text 不能为空' })
    }

    const id = randomUUID()
    await pool.execute(
      `INSERT INTO tts_tasks (id, user_id, text, voice, speed, volume, status, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, text.trim(), voice, speed, volume, 'pending', JSON.stringify({ source: 'frontend' })]
    )
    const [rows] = await pool.execute('SELECT * FROM tts_tasks WHERE id = ?', [id])
    res.status(201).json({ success: true, task: formatTtsTask(rows[0]) })
  } catch (error) {
    console.error('创建 TTS 任务失败:', error)
    res.status(500).json({ success: false, message: '创建 TTS 任务失败' })
  }
})

app.get('/api/tts/tasks', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tts_tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [req.user.id]
    )
    res.json({ success: true, data: rows.map(formatTtsTask) })
  } catch (error) {
    console.error('获取 TTS 任务失败:', error)
    res.status(500).json({ success: false, message: '获取 TTS 任务失败' })
  }
})

app.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请填写管理员账号和密码' })
    }

    const loginLock = await checkLoginLock(req, username, 'admin')
    if (loginLock.locked) {
      res.setHeader('Retry-After', String(loginLock.retryAfterSeconds))
      await securityEvent(req, 'admin_login.locked', 'admin', { retryAfterSeconds: loginLock.retryAfterSeconds })
      return sendError(res, 429, 'ADMIN_LOGIN_LOCKED', '管理员登录失败次数过多，请稍后再试')
    }

    const [admins] = await pool.execute('SELECT * FROM admin_users WHERE username = ?', [username])
    if (admins.length === 0) {
      await recordLoginFailure(loginLock.key, { scope: 'admin', requestId: req.requestId, ip: getClientIp(req) })
      await securityEvent(req, 'admin_login.failed', 'admin', { reason: 'admin_not_found' })
      return sendError(res, 401, 'INVALID_ADMIN_CREDENTIALS', '管理员账号或密码错误')
    }

    const admin = admins[0]
    if (admin.is_active === 0) {
      return sendError(res, 403, 'ADMIN_ACCOUNT_DISABLED', '管理员账号已禁用')
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    if (!passwordMatch) {
      await recordLoginFailure(loginLock.key, { scope: 'admin', requestId: req.requestId, ip: getClientIp(req) })
      await securityEvent(req, 'admin_login.failed', 'admin', { adminId: admin.id, reason: 'bad_password' })
      return sendError(res, 401, 'INVALID_ADMIN_CREDENTIALS', '管理员账号或密码错误')
    }

    await clearLoginFailures(loginLock.key)
    await securityEvent(req, 'admin_login.success', 'admin', { adminId: admin.id })
    await pool.execute('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [admin.id])
    const formatted = formatAdmin(admin)
    formatted.last_login = new Date().toISOString()

    await auditLog({ admin: formatted, ip: req.ip, headers: req.headers }, 'admin.login', 'admin_user', admin.id)

    res.json({ success: true, token: generateAdminToken(formatted), admin: formatted })
  } catch (error) {
    console.error('管理员登录失败:', error)
    res.status(500).json({ success: false, message: '管理员登录失败' })
  }
})

app.get('/api/admin/auth/me', adminAuthMiddleware, async (req, res) => {
  try {
    const [admins] = await pool.execute('SELECT * FROM admin_users WHERE id = ?', [req.admin.id])
    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: '管理员不存在' })
    }
    res.json({ success: true, admin: formatAdmin(admins[0]) })
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    res.status(500).json({ success: false, message: '获取管理员信息失败' })
  }
})

app.get('/api/admin/learning/paths', adminAuthMiddleware, requirePermission('learning:manage'), async (req, res) => {
  try {
    const [summaryRows] = await pool.execute(
      `SELECT
         course_id,
         COUNT(DISTINCT user_id) AS learner_count,
         COUNT(*) AS progress_records,
         SUM(CASE WHEN completed = TRUE OR progress_percentage >= 100 THEN 1 ELSE 0 END) AS completed_records,
         SUM(progress_percentage) AS progress_sum,
         ROUND(AVG(progress_percentage), 2) AS average_progress,
         MAX(last_accessed) AS last_accessed
       FROM learning_progress
       GROUP BY course_id`
    )

    const summaryByCourse = new Map(summaryRows.map(row => [row.course_id, row]))
    const knownPaths = ADMIN_LEARNING_PATHS.map(path => {
      const row = summaryByCourse.get(path.id) || {}
      const learnerCount = Number(row.learner_count || 0)
      const normalizedAverage = learnerCount > 0 && path.totalLessons > 0
        ? Number((((Number(row.progress_sum || 0)) / (learnerCount * path.totalLessons))).toFixed(2))
        : Number(row.average_progress || 0)
      return {
        ...path,
        learnerCount,
        progressRecords: Number(row.progress_records || 0),
        completedRecords: Number(row.completed_records || 0),
        averageProgress: normalizedAverage,
        lastAccessed: row.last_accessed || null
      }
    })

    const extraPaths = summaryRows
      .filter(row => !ADMIN_LEARNING_PATHS.some(path => path.id === row.course_id))
      .map(row => ({
        ...getLearningPathMeta(row.course_id),
        learnerCount: Number(row.learner_count || 0),
        progressRecords: Number(row.progress_records || 0),
        completedRecords: Number(row.completed_records || 0),
        averageProgress: Number(row.average_progress || 0),
        lastAccessed: row.last_accessed || null
      }))

    res.json({ success: true, data: knownPaths.concat(extraPaths) })
  } catch (error) {
    console.error('后台获取学习路径失败:', error)
    res.status(500).json({ success: false, message: '后台获取学习路径失败' })
  }
})

app.get('/api/admin/learning/progress', adminAuthMiddleware, requirePermission('learning:manage'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const params = []
    const whereParts = []

    if (req.query.courseId) {
      whereParts.push('lp.course_id = ?')
      params.push(String(req.query.courseId))
    }

    if (req.query.completed === 'true' || req.query.completed === 'false') {
      whereParts.push('lp.completed = ?')
      params.push(req.query.completed === 'true')
    }

    if (req.query.keyword) {
      const keyword = `%${String(req.query.keyword).trim()}%`
      whereParts.push('(u.username LIKE ? OR u.email LIKE ? OR u.display_name LIKE ? OR lp.chapter_id LIKE ?)')
      params.push(keyword, keyword, keyword, keyword)
    }

    const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
    const [rows] = await pool.execute(
      `SELECT
         lp.*,
         u.username,
         u.email,
         u.display_name
       FROM learning_progress lp
       LEFT JOIN users u ON u.id = lp.user_id
       ${where}
       ORDER BY lp.last_accessed DESC, lp.updated_at DESC
       LIMIT ? OFFSET ?`,
      params.concat([pageSize, offset])
    )
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM learning_progress lp
       LEFT JOIN users u ON u.id = lp.user_id
       ${where}`,
      params
    )

    res.json({
      success: true,
      data: rows.map(formatLearningProgress),
      pagination: { page, pageSize, total: countRows[0].total }
    })
  } catch (error) {
    console.error('后台获取学习进度失败:', error)
    res.status(500).json({ success: false, message: '后台获取学习进度失败' })
  }
})

app.get('/api/admin/learning/chapters', adminAuthMiddleware, requirePermission('learning:manage'), async (req, res) => {
  try {
    const params = []
    const whereParts = []

    if (req.query.courseId) {
      whereParts.push('course_id = ?')
      params.push(String(req.query.courseId))
    }

    const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
    const [rows] = await pool.execute(
      `SELECT
         course_id,
         chapter_id,
         COUNT(DISTINCT user_id) AS learner_count,
         COUNT(*) AS progress_records,
         SUM(CASE WHEN completed = TRUE OR progress_percentage >= 100 THEN 1 ELSE 0 END) AS completed_records,
         ROUND(AVG(progress_percentage), 2) AS average_progress,
         MAX(last_accessed) AS last_accessed
       FROM learning_progress
       ${where}
       GROUP BY course_id, chapter_id
       ORDER BY course_id ASC, CAST(chapter_id AS UNSIGNED) ASC, chapter_id ASC`,
      params
    )

    res.json({
      success: true,
      data: rows.map(row => {
        const pathMeta = getLearningPathMeta(row.course_id)
        return {
          courseId: row.course_id,
          courseName: pathMeta.name,
          chapterId: row.chapter_id,
          learnerCount: Number(row.learner_count || 0),
          progressRecords: Number(row.progress_records || 0),
          completedRecords: Number(row.completed_records || 0),
          averageProgress: Number(row.average_progress || 0),
          lastAccessed: row.last_accessed || null
        }
      })
    })
  } catch (error) {
    console.error('后台获取学习章节统计失败:', error)
    res.status(500).json({ success: false, message: '后台获取学习章节统计失败' })
  }
})

app.patch('/api/admin/auth/profile', adminAuthMiddleware, async (req, res) => {
  try {
    const input = normalizeAdminProfileInput(req.body)
    const validationError = validateAdminProfileInput(input)
    if (validationError) {
      return sendError(res, 400, 'INVALID_ADMIN_PROFILE', validationError)
    }

    const [admins] = await pool.execute('SELECT * FROM admin_users WHERE id = ?', [req.admin.id])
    if (admins.length === 0) {
      return sendError(res, 404, 'ADMIN_NOT_FOUND', '管理员不存在')
    }

    const admin = admins[0]
    if (admin.is_active === 0) {
      return sendError(res, 403, 'ADMIN_ACCOUNT_DISABLED', '管理员账号已禁用')
    }

    const passwordMatch = await bcrypt.compare(input.currentPassword, admin.password_hash)
    if (!passwordMatch) {
      await securityEvent(req, 'admin_profile.update_failed', 'admin', { adminId: admin.id, reason: 'bad_current_password' })
      return sendError(res, 401, 'INVALID_CURRENT_PASSWORD', '当前密码错误')
    }

    const [conflicts] = await pool.execute(
      'SELECT id FROM admin_users WHERE username = ? AND id <> ? LIMIT 1',
      [input.username, admin.id]
    )
    if (conflicts.length > 0) {
      return sendError(res, 409, 'ADMIN_USERNAME_EXISTS', '管理员账号已存在')
    }

    const before = formatAdmin(admin)
    const updates = ['username = ?', 'display_name = ?']
    const params = [input.username, input.displayName || input.username]
    const passwordChanged = Boolean(input.newPassword)

    if (passwordChanged) {
      updates.push('password_hash = ?')
      params.push(await bcrypt.hash(input.newPassword, 10))
    }

    params.push(admin.id)
    await pool.execute(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, params)

    const [updatedRows] = await pool.execute('SELECT * FROM admin_users WHERE id = ?', [admin.id])
    const formatted = formatAdmin(updatedRows[0])
    await auditLog(req, 'admin.profile.update', 'admin_user', admin.id, before, {
      ...formatted,
      password_changed: passwordChanged
    })
    await securityEvent(req, 'admin_profile.updated', 'admin', { adminId: admin.id, passwordChanged })

    res.json({ success: true, admin: formatted, token: generateAdminToken(formatted) })
  } catch (error) {
    console.error('更新管理员账号信息失败:', error)
    res.status(500).json({ success: false, message: '更新管理员账号信息失败' })
  }
})

app.get('/api/admin/users', adminAuthMiddleware, requirePermission('user:list'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const keyword = `%${String(req.query.keyword || '').trim()}%`
    const offset = (page - 1) * pageSize

    const where = req.query.keyword ? 'WHERE username LIKE ? OR email LIKE ? OR display_name LIKE ?' : ''
    const params = req.query.keyword ? [keyword, keyword, keyword] : []
    const [rows] = await pool.execute(
      `SELECT id, username, email, display_name, plain_password, subscription_tier, subscription_expiry, email_verified, is_active, created_at, last_login
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      params
    )

    res.json({ success: true, data: rows.map(formatUser), pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ success: false, message: '获取用户列表失败' })
  }
})

app.patch('/api/admin/users/:id/status', adminAuthMiddleware, requirePermission('user:update'), async (req, res) => {
  try {
    const { is_active } = req.body
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active 必须是布尔值' })
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id])
    const [updated] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    await auditLog(req, 'user.update_status', 'user', req.params.id, formatUser(users[0]), formatUser(updated[0]))

    res.json({ success: true, user: formatUser(updated[0]) })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    res.status(500).json({ success: false, message: '更新用户状态失败' })
  }
})

app.patch('/api/admin/users/:id', adminAuthMiddleware, requirePermission('user:update'), async (req, res) => {
  try {
    const { username, email, display_name, subscription_tier, subscription_expiry, password } = req.body
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    const updates = [], params = []
    if (username !== undefined) { updates.push('username = ?'); params.push(username) }
    if (email !== undefined) { updates.push('email = ?'); params.push(email) }
    if (display_name !== undefined) { updates.push('display_name = ?'); params.push(display_name) }
    if (subscription_tier !== undefined) { updates.push('subscription_tier = ?'); params.push(subscription_tier) }
    if (subscription_expiry !== undefined) { updates.push('subscription_expiry = ?'); params.push(subscription_expiry ? new Date(subscription_expiry) : null) }
    if (password !== undefined && password !== '') {
      updates.push('password_hash = ?'); params.push(await bcrypt.hash(password, 10))
      updates.push('plain_password = ?'); params.push(password)
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有提供需要更新的字段' })
    }

    params.push(req.params.id)
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)
    const [updated] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    await auditLog(req, 'user.update', 'user', req.params.id, formatUser(users[0]), formatUser(updated[0]))

    res.json({ success: true, user: formatUser(updated[0]) })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: '用户名或邮箱已被占用' })
    }
    console.error('更新用户信息失败:', error)
    res.status(500).json({ success: false, message: '更新用户信息失败' })
  }
})

app.post('/api/admin/users/:id/reset-password', adminAuthMiddleware, requirePermission('user:update'), async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: '密码不能少于 6 个字符' })
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await pool.execute('UPDATE users SET password_hash = ?, plain_password = ? WHERE id = ?', [passwordHash, password, req.params.id])
    await auditLog(req, 'user.reset_password', 'user', req.params.id, { username: users[0].username }, { username: users[0].username })

    res.json({ success: true, message: '密码已重置' })
  } catch (error) {
    console.error('重置密码失败:', error)
    res.status(500).json({ success: false, message: '重置密码失败' })
  }
})

app.get('/api/admin/configs', adminAuthMiddleware, requirePermission('content:manage'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM system_configs ORDER BY config_key ASC')
    res.json({ success: true, data: rows.map(row => {
      let value = row.config_value
      if (typeof value === 'string') {
        try { value = JSON.parse(value) } catch { /* keep raw string */ }
      }
      return {
        key: row.config_key,
        value,
        description: row.description || '',
        updated_by: row.updated_by,
        updated_at: row.updated_at
      }
    }) })
  } catch (error) {
    console.error('获取系统配置失败:', error)
    res.status(500).json({ success: false, message: '获取系统配置失败' })
  }
})

app.put('/api/admin/configs/:key', adminAuthMiddleware, requirePermission('content:manage'), async (req, res) => {
  try {
    const { value, description } = req.body
    const configKey = req.params.key
    const [beforeRows] = await pool.execute('SELECT * FROM system_configs WHERE config_key = ?', [configKey])

    await pool.execute(
      `INSERT INTO system_configs (id, config_key, config_value, description, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), description = VALUES(description), updated_by = VALUES(updated_by)`,
      [randomUUID(), configKey, JSON.stringify(value ?? null), description || null, req.admin.id]
    )

    const [afterRows] = await pool.execute('SELECT * FROM system_configs WHERE config_key = ?', [configKey])
    await auditLog(req, 'config.upsert', 'system_config', configKey, beforeRows[0] || null, afterRows[0] || null)

    res.json({ success: true, config: afterRows[0] })
  } catch (error) {
    console.error('保存系统配置失败:', error)
    res.status(500).json({ success: false, message: '保存系统配置失败' })
  }
})

app.delete('/api/admin/configs/:key', adminAuthMiddleware, requirePermission('content:manage'), async (req, res) => {
  try {
    const configKey = req.params.key
    const [beforeRows] = await pool.execute('SELECT * FROM system_configs WHERE config_key = ?', [configKey])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: '配置项不存在' })
    }
    await pool.execute('DELETE FROM system_configs WHERE config_key = ?', [configKey])
    await auditLog(req, 'config.delete', 'system_config', configKey, beforeRows[0], null)
    res.json({ success: true })
  } catch (error) {
    console.error('删除系统配置失败:', error)
    res.status(500).json({ success: false, message: '删除系统配置失败' })
  }
})

const AI_PROVIDER_NAMES = ['deepseek', 'openrouter', 'openai']

function maskApiKey(key) {
  if (!key || typeof key !== 'string') return ''
  if (key.length <= 8) return '***'
  return key.slice(0, 3) + '***' + key.slice(-4)
}

app.get('/api/admin/ai-providers', adminAuthMiddleware, requirePermission('content:manage'), async (req, res) => {
  try {
    const data = await Promise.all(AI_PROVIDER_NAMES.map(async name => {
      const cfg = await resolveAIProvider(name)
      return {
        name,
        baseUrl: cfg.baseUrl,
        defaultModel: cfg.defaultModel,
        enabled: cfg.enabled,
        hasApiKey: !!cfg.apiKey,
        apiKeyMask: maskApiKey(cfg.apiKey),
        envHasKey: !!(AI_PROVIDERS[name] && AI_PROVIDERS[name].apiKey)
      }
    }))
    res.json({ success: true, data })
  } catch (error) {
    console.error('获取 AI 供应商配置失败:', error)
    res.status(500).json({ success: false, message: '获取 AI 供应商配置失败' })
  }
})

app.put('/api/admin/ai-providers/:name', adminAuthMiddleware, requirePermission('content:manage'), async (req, res) => {
  try {
    const providerName = req.params.name
    if (!AI_PROVIDER_NAMES.includes(providerName)) {
      return res.status(400).json({ success: false, message: `不支持的 AI 供应商: ${providerName}` })
    }
    const { apiKey, baseUrl, defaultModel, enabled, clearApiKey } = req.body || {}
    const configKey = `ai.provider.${providerName}`
    const [beforeRows] = await pool.execute('SELECT * FROM system_configs WHERE config_key = ?', [configKey])

    let existing = {}
    if (beforeRows.length > 0) {
      let val = beforeRows[0].config_value
      if (typeof val === 'string') {
        try { val = JSON.parse(val) } catch { val = {} }
      }
      if (val && typeof val === 'object') existing = val
    }

    const next = { ...existing }
    if (typeof baseUrl === 'string') {
      const trimmed = baseUrl.trim()
      if (trimmed) next.baseUrl = trimmed
      else delete next.baseUrl
    }
    if (typeof defaultModel === 'string') {
      const trimmed = defaultModel.trim()
      if (trimmed) next.defaultModel = trimmed
      else delete next.defaultModel
    }
    if (typeof enabled === 'boolean') next.enabled = enabled
    if (clearApiKey === true) {
      delete next.apiKey
    } else if (typeof apiKey === 'string' && apiKey.trim()) {
      next.apiKey = apiKey.trim()
    }

    await pool.execute(
      `INSERT INTO system_configs (id, config_key, config_value, description, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), description = VALUES(description), updated_by = VALUES(updated_by)`,
      [randomUUID(), configKey, JSON.stringify(next), `AI 供应商 ${providerName} 配置（含 API Key）`, req.admin.id]
    )

    const maskRecord = obj => {
      if (!obj || typeof obj !== 'object') return obj
      const clone = { ...obj }
      if (clone.apiKey) clone.apiKey = maskApiKey(clone.apiKey)
      return clone
    }
    await auditLog(req, 'ai_provider.upsert', 'ai_provider', providerName, maskRecord(existing), maskRecord(next))

    res.json({
      success: true,
      provider: providerName,
      hasApiKey: !!next.apiKey,
      apiKeyMask: maskApiKey(next.apiKey),
      enabled: next.enabled !== false
    })
  } catch (error) {
    console.error('保存 AI 供应商配置失败:', error)
    res.status(500).json({ success: false, message: '保存 AI 供应商配置失败' })
  }
})

app.post('/api/admin/ai-providers/:name/test', adminAuthMiddleware, requirePermission('content:manage'), async (req, res) => {
  const startedAt = Date.now()
  try {
    const providerName = req.params.name
    if (!AI_PROVIDER_NAMES.includes(providerName)) {
      return res.status(400).json({ success: false, message: `不支持的 AI 供应商: ${providerName}` })
    }
    const provider = await resolveAIProvider(providerName)
    if (!provider.apiKey) {
      return res.status(400).json({ success: false, message: '尚未配置 API Key' })
    }
    const response = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.defaultModel,
        messages: [{ role: 'user', content: '只回答一个字：道' }],
        temperature: 0.1,
        max_tokens: 16,
        stream: false
      })
    })
    const data = await response.json().catch(() => ({}))
    const durationMs = Date.now() - startedAt
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: (data && data.error && data.error.message) || `供应商返回 HTTP ${response.status}`,
        status: response.status,
        durationMs
      })
    }
    const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || ''
    res.json({
      success: true,
      provider: provider.name,
      model: provider.defaultModel,
      content: String(content).slice(0, 200),
      durationMs,
      usage: data.usage || null
    })
  } catch (error) {
    console.error('AI 供应商连通测试失败:', error)
    res.status(502).json({ success: false, message: error.message || 'AI 供应商连通测试失败', durationMs: Date.now() - startedAt })
  }
})

app.get('/api/admin/audit-logs', adminAuthMiddleware, requirePermission('audit:read'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const [rows] = await pool.execute(
      'SELECT * FROM admin_operation_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    )
    const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM admin_operation_logs')
    res.json({ success: true, data: rows, pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('获取审计日志失败:', error)
    res.status(500).json({ success: false, message: '获取审计日志失败' })
  }
})

app.get('/api/admin/community/posts', adminAuthMiddleware, requirePermission('community:moderate'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const status = req.query.status ? String(req.query.status) : null
    const params = []
    const where = status ? 'WHERE p.status = ?' : ''
    if (status) params.push(status)

    const [rows] = await pool.execute(
      `SELECT p.*, u.username, u.display_name,
        (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comment_count,
        (SELECT COUNT(*) FROM community_bookmarks b WHERE b.post_id = p.id) AS bookmark_count
       FROM community_posts p
       LEFT JOIN users u ON u.id = p.user_id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM community_posts p ${where}`, params)
    res.json({ success: true, data: rows.map(formatCommunityPost), pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('后台获取社区帖子失败:', error)
    res.status(500).json({ success: false, message: '后台获取社区帖子失败' })
  }
})

app.patch('/api/admin/community/posts/:id/status', adminAuthMiddleware, requirePermission('community:moderate'), async (req, res) => {
  try {
    const { status, isPinned, isHot, reason } = req.body
    const allowedStatuses = new Set(['published', 'hidden', 'rejected'])
    if (status && !allowedStatuses.has(status)) {
      return res.status(400).json({ success: false, message: '帖子状态不合法' })
    }

    const [beforeRows] = await pool.execute('SELECT * FROM community_posts WHERE id = ?', [req.params.id])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' })
    }

    await pool.execute(
      `UPDATE community_posts
       SET status = COALESCE(?, status),
           is_pinned = COALESCE(?, is_pinned),
           is_hot = COALESCE(?, is_hot)
       WHERE id = ?`,
      [
        status || null,
        typeof isPinned === 'boolean' ? isPinned : null,
        typeof isHot === 'boolean' ? isHot : null,
        req.params.id
      ]
    )
    const [afterRows] = await pool.execute('SELECT * FROM community_posts WHERE id = ?', [req.params.id])
    await auditLog(req, 'community.post.moderate', 'community_post', req.params.id, beforeRows[0], { ...afterRows[0], reason })
    res.json({ success: true, post: formatCommunityPost(afterRows[0]) })
  } catch (error) {
    console.error('审核社区帖子失败:', error)
    res.status(500).json({ success: false, message: '审核社区帖子失败' })
  }
})

app.get('/api/admin/community/reports', adminAuthMiddleware, requirePermission('community:moderate'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const status = req.query.status ? String(req.query.status) : null
    const where = status ? 'WHERE status = ?' : ''
    const params = status ? [status] : []
    const [rows] = await pool.execute(
      `SELECT * FROM community_reports ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM community_reports ${where}`, params)
    res.json({ success: true, data: rows, pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('获取社区举报失败:', error)
    res.status(500).json({ success: false, message: '获取社区举报失败' })
  }
})

app.patch('/api/admin/community/reports/:id/status', adminAuthMiddleware, requirePermission('community:moderate'), async (req, res) => {
  try {
    const { status, note = '' } = req.body
    const allowedStatuses = new Set(['pending', 'resolved', 'rejected'])
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ success: false, message: '举报状态不合法' })
    }
    const [beforeRows] = await pool.execute('SELECT * FROM community_reports WHERE id = ?', [req.params.id])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: '举报不存在' })
    }
    await pool.execute(
      'UPDATE community_reports SET status = ?, handled_by = ?, handled_at = NOW() WHERE id = ?',
      [status, req.admin.id, req.params.id]
    )
    const [afterRows] = await pool.execute('SELECT * FROM community_reports WHERE id = ?', [req.params.id])
    await auditLog(req, 'community.report.handle', 'community_report', req.params.id, beforeRows[0], { ...afterRows[0], note })

    // 通知举报人处理结果
    const reporterId = afterRows[0].reporter_id
    if (reporterId) {
      const statusLabel = status === 'resolved' ? '已处理' : '已驳回'
      const statusMsg = status === 'resolved'
        ? '感谢您的举报！经管理员审核，该内容已被处理。'
        : '感谢您的举报！经管理员审核，该举报未被采纳。'
      await pool.execute(
        'INSERT INTO user_notifications (id, user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?, ?)',
        [randomUUID(), reporterId, `report_${status}`, `举报${statusLabel}`, statusMsg, req.params.id]
      )
    }

    res.json({ success: true, report: afterRows[0] })
  } catch (error) {
    console.error('处理社区举报失败:', error)
    res.status(500).json({ success: false, message: '处理社区举报失败' })
  }
})

app.get('/api/admin/resources/categories', adminAuthMiddleware, requirePermission('resource:manage'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM resource_categories ORDER BY sort_order ASC, created_at ASC')
    res.json({ success: true, data: rows.map(formatResourceCategory) })
  } catch (error) {
    console.error('后台获取资源分类失败:', error)
    res.status(500).json({ success: false, message: '后台获取资源分类失败' })
  }
})

app.post('/api/admin/resources/categories', adminAuthMiddleware, requirePermission('resource:manage'), async (req, res) => {
  try {
    const { name, slug, description = '', sortOrder = 0, enabled = true } = req.body
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: '分类名称和标识不能为空' })
    }
    const id = randomUUID()
    await pool.execute(
      'INSERT INTO resource_categories (id, name, slug, description, sort_order, enabled) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, slug, description, sortOrder, enabled]
    )
    const [rows] = await pool.execute('SELECT * FROM resource_categories WHERE id = ?', [id])
    await auditLog(req, 'resource.category.create', 'resource_category', id, null, rows[0])
    res.status(201).json({ success: true, category: formatResourceCategory(rows[0]) })
  } catch (error) {
    console.error('创建资源分类失败:', error)
    res.status(500).json({ success: false, message: '创建资源分类失败' })
  }
})

app.get('/api/admin/resources', adminAuthMiddleware, requirePermission('resource:manage'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const params = []
    const whereParts = []
    if (req.query.type) {
      whereParts.push('r.resource_type = ?')
      params.push(req.query.type)
    }
    if (req.query.era) {
      whereParts.push('r.era = ?')
      params.push(req.query.era)
    }
    if (req.query.author) {
      whereParts.push('r.author = ?')
      params.push(req.query.author)
    }
    const where = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''
    const [rows] = await pool.execute(
      `SELECT r.*, c.name AS category_name
       FROM resources r LEFT JOIN resource_categories c ON c.id = r.category_id
       ${where}
       ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM resources r ${where}`, params)
    res.json({ success: true, data: rows.map(formatResource), pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('后台获取资源列表失败:', error)
    res.status(500).json({ success: false, message: '后台获取资源列表失败' })
  }
})

app.post('/api/admin/resources', adminAuthMiddleware, requirePermission('resource:manage'), async (req, res) => {
  try {
    const {
      categoryId = null,
      title,
      summary = '',
      content = '',
      resourceType = 'article',
      era = null,
      author = null,
      coverUrl = '',
      fileUrl = '',
      tags = [],
      status = 'draft',
      sortOrder = 0
    } = req.body
    if (!title) {
      return res.status(400).json({ success: false, message: '资源标题不能为空' })
    }
    const id = randomUUID()
    await pool.execute(
      `INSERT INTO resources
       (id, category_id, title, summary, content, resource_type, era, author, cover_url, file_url, tags, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, categoryId, title, summary, content, resourceType, era, author, coverUrl, fileUrl, JSON.stringify(Array.isArray(tags) ? tags : []), status, sortOrder]
    )
    const [rows] = await pool.execute(
      'SELECT r.*, c.name AS category_name FROM resources r LEFT JOIN resource_categories c ON c.id = r.category_id WHERE r.id = ?',
      [id]
    )
    await auditLog(req, 'resource.create', 'resource', id, null, rows[0])
    res.status(201).json({ success: true, resource: formatResource(rows[0]) })
  } catch (error) {
    console.error('创建资源失败:', error)
    res.status(500).json({ success: false, message: '创建资源失败' })
  }
})

app.patch('/api/admin/resources/:id', adminAuthMiddleware, requirePermission('resource:manage'), async (req, res) => {
  try {
    const [beforeRows] = await pool.execute('SELECT * FROM resources WHERE id = ?', [req.params.id])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: '资源不存在' })
    }
    const {
      categoryId,
      title,
      summary,
      content,
      resourceType,
      era,
      author,
      coverUrl,
      fileUrl,
      tags,
      status,
      sortOrder
    } = req.body
    await pool.execute(
      `UPDATE resources
       SET category_id = COALESCE(?, category_id),
           title = COALESCE(?, title),
           summary = COALESCE(?, summary),
           content = COALESCE(?, content),
           resource_type = COALESCE(?, resource_type),
           era = COALESCE(?, era),
           author = COALESCE(?, author),
           cover_url = COALESCE(?, cover_url),
           file_url = COALESCE(?, file_url),
           tags = COALESCE(?, tags),
           status = COALESCE(?, status),
           sort_order = COALESCE(?, sort_order)
       WHERE id = ?`,
      [
        categoryId ?? null,
        title ?? null,
        summary ?? null,
        content ?? null,
        resourceType ?? null,
        era ?? null,
        author ?? null,
        coverUrl ?? null,
        fileUrl ?? null,
        Array.isArray(tags) ? JSON.stringify(tags) : null,
        status ?? null,
        sortOrder ?? null,
        req.params.id
      ]
    )
    const [afterRows] = await pool.execute(
      'SELECT r.*, c.name AS category_name FROM resources r LEFT JOIN resource_categories c ON c.id = r.category_id WHERE r.id = ?',
      [req.params.id]
    )
    await auditLog(req, 'resource.update', 'resource', req.params.id, beforeRows[0], afterRows[0])
    res.json({ success: true, resource: formatResource(afterRows[0]) })
  } catch (error) {
    console.error('更新资源失败:', error)
    res.status(500).json({ success: false, message: '更新资源失败' })
  }
})

app.delete('/api/admin/resources/:id', adminAuthMiddleware, requirePermission('resource:manage'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM resources WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '资源不存在' })
    }
    await pool.execute('DELETE FROM resources WHERE id = ?', [req.params.id])
    await auditLog(req, 'resource.delete', 'resource', req.params.id, rows[0], null)
    res.json({ success: true })
  } catch (error) {
    console.error('删除资源失败:', error)
    res.status(500).json({ success: false, message: '删除资源失败' })
  }
})

app.get('/api/admin/tts/tasks', adminAuthMiddleware, requirePermission('tts:manage'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const where = req.query.status ? 'WHERE status = ?' : ''
    const params = req.query.status ? [req.query.status] : []
    const [rows] = await pool.execute(
      `SELECT * FROM tts_tasks ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM tts_tasks ${where}`, params)
    res.json({ success: true, data: rows.map(formatTtsTask), pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('后台获取 TTS 任务失败:', error)
    res.status(500).json({ success: false, message: '后台获取 TTS 任务失败' })
  }
})

app.patch('/api/admin/tts/tasks/:id', adminAuthMiddleware, requirePermission('tts:manage'), async (req, res) => {
  try {
    const { status, audioUrl, errorMessage, metadata } = req.body
    const [beforeRows] = await pool.execute('SELECT * FROM tts_tasks WHERE id = ?', [req.params.id])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'TTS 任务不存在' })
    }
    await pool.execute(
      `UPDATE tts_tasks
       SET status = COALESCE(?, status),
           audio_url = COALESCE(?, audio_url),
           error_message = COALESCE(?, error_message),
           metadata = COALESCE(?, metadata)
       WHERE id = ?`,
      [status ?? null, audioUrl ?? null, errorMessage ?? null, metadata ? JSON.stringify(metadata) : null, req.params.id]
    )
    const [afterRows] = await pool.execute('SELECT * FROM tts_tasks WHERE id = ?', [req.params.id])
    await auditLog(req, 'tts.task.update', 'tts_task', req.params.id, beforeRows[0], afterRows[0])
    res.json({ success: true, task: formatTtsTask(afterRows[0]) })
  } catch (error) {
    console.error('更新 TTS 任务失败:', error)
    res.status(500).json({ success: false, message: '更新 TTS 任务失败' })
  }
})

app.post('/api/admin/internal/users/:id/status', hAdminInternalMiddleware, async (req, res) => {
  try {
    const { is_active, reason } = req.body
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active 必须是布尔值' })
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id])
    const [updated] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    await auditLog(req, 'hadmin.user.update_status', 'user', req.params.id, formatUser(users[0]), { ...formatUser(updated[0]), reason })

    res.json({ success: true, user: formatUser(updated[0]) })
  } catch (error) {
    console.error('hAdmin 更新用户状态失败:', error)
    res.status(500).json({ success: false, message: 'hAdmin 更新用户状态失败' })
  }
})

app.post('/api/admin/internal/ai-usage', hAdminInternalMiddleware, async (req, res) => {
  try {
    const usage = req.body || {}
    const id = randomUUID()
    await pool.execute(
      `INSERT INTO ai_usage_logs
       (id, user_id, provider_name, model_name, prompt_tokens, completion_tokens, total_tokens, estimated_cost, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        usage.user_id || null,
        usage.provider_name || null,
        usage.model_name || null,
        usage.prompt_tokens || 0,
        usage.completion_tokens || 0,
        usage.total_tokens || 0,
        usage.estimated_cost || 0,
        usage.status || 'success'
      ]
    )
    await auditLog(req, 'hadmin.ai_usage.create', 'ai_usage_log', id, null, usage)
    res.status(201).json({ success: true, id })
  } catch (error) {
    console.error('hAdmin 写入 AI 用量失败:', error)
    res.status(500).json({ success: false, message: 'hAdmin 写入 AI 用量失败' })
  }
})

app.post('/api/admin/internal/community/posts/:id/status', hAdminInternalMiddleware, async (req, res) => {
  try {
    const { status, reason } = req.body
    const allowedStatuses = new Set(['published', 'hidden', 'rejected'])
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ success: false, message: '帖子状态不合法' })
    }
    const [beforeRows] = await pool.execute('SELECT * FROM community_posts WHERE id = ?', [req.params.id])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' })
    }
    await pool.execute('UPDATE community_posts SET status = ? WHERE id = ?', [status, req.params.id])
    const [afterRows] = await pool.execute('SELECT * FROM community_posts WHERE id = ?', [req.params.id])
    await auditLog(req, 'hadmin.community.post.status', 'community_post', req.params.id, beforeRows[0], { ...afterRows[0], reason })
    res.json({ success: true, post: formatCommunityPost(afterRows[0]) })
  } catch (error) {
    console.error('hAdmin 审核帖子失败:', error)
    res.status(500).json({ success: false, message: 'hAdmin 审核帖子失败' })
  }
})

app.post('/api/admin/internal/tts/tasks/:id', hAdminInternalMiddleware, async (req, res) => {
  try {
    const { status, audioUrl, errorMessage, metadata } = req.body
    const [beforeRows] = await pool.execute('SELECT * FROM tts_tasks WHERE id = ?', [req.params.id])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'TTS 任务不存在' })
    }
    await pool.execute(
      `UPDATE tts_tasks
       SET status = COALESCE(?, status),
           audio_url = COALESCE(?, audio_url),
           error_message = COALESCE(?, error_message),
           metadata = COALESCE(?, metadata)
       WHERE id = ?`,
      [status ?? null, audioUrl ?? null, errorMessage ?? null, metadata ? JSON.stringify(metadata) : null, req.params.id]
    )
    const [afterRows] = await pool.execute('SELECT * FROM tts_tasks WHERE id = ?', [req.params.id])
    await auditLog(req, 'hadmin.tts.task.update', 'tts_task', req.params.id, beforeRows[0], afterRows[0])
    res.json({ success: true, task: formatTtsTask(afterRows[0]) })
  } catch (error) {
    console.error('hAdmin 更新 TTS 任务失败:', error)
    res.status(500).json({ success: false, message: 'hAdmin 更新 TTS 任务失败' })
  }
})

async function buildHealthPayload() {
  const checks = {
    database: { ok: false, latencyMs: null },
    ai: Object.fromEntries(Object.entries(AI_PROVIDERS).map(([name, provider]) => [
      name,
      { configured: Boolean(provider.apiKey), model: provider.defaultModel }
    ])),
    tts: { configured: Boolean(TTS_CONFIG.dashscopeApiKey), model: TTS_CONFIG.model },
    hadmin_internal: { enabled: Boolean(HADMIN_INTERNAL_TOKEN) }
  }

  const dbStartedAt = Date.now()
  try {
    await pool.query('SELECT 1')
    checks.database.ok = true
    checks.database.latencyMs = Date.now() - dbStartedAt
  } catch (error) {
    checks.database.error = error.code || error.message
  }

  return {
    success: checks.database.ok,
    message: checks.database.ok ? '服务运行正常' : '数据库连接异常',
    architecture: 'dual-backend',
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt: SERVICE_STARTED_AT.toISOString(),
    frontend_api: '/api/*',
    admin_bridge: '/api/admin/*',
    checks
  }
}

function stripAnsiCodes(value) {
  return String(value || '').replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
}

function classifyRuntimeLogLine(line) {
  const normalized = String(line || '').toLowerCase()
  if (/critical|fatal|error|exception|crashed|econnrefused|unhandled|failed|失败|错误/.test(normalized)) return 'error'
  if (/warn|warning|timeout|retry|告警|警告/.test(normalized)) return 'warning'
  if (/success|ready|starting|listening|running|成功|正常/.test(normalized)) return 'success'
  return 'info'
}

async function readRuntimeLogTail(filePath) {
  const stats = await fs.stat(filePath)
  if (stats.size <= RUNTIME_LOG_MAX_BYTES) {
    return { stats, text: await fs.readFile(filePath, 'utf8'), truncated: false }
  }

  const handle = await fs.open(filePath, 'r')
  try {
    const buffer = Buffer.alloc(RUNTIME_LOG_MAX_BYTES)
    await handle.read(buffer, 0, RUNTIME_LOG_MAX_BYTES, stats.size - RUNTIME_LOG_MAX_BYTES)
    return { stats, text: buffer.toString('utf8'), truncated: true }
  } finally {
    await handle.close()
  }
}

async function buildRuntimeLogPayload(query = {}) {
  const sourceKey = String(query.source || 'all')
  const source = RUNTIME_LOG_SOURCES[sourceKey] || RUNTIME_LOG_SOURCES.all
  const selectedSource = RUNTIME_LOG_SOURCES[sourceKey] ? sourceKey : 'all'
  const maxLines = Math.min(Math.max(parseInt(query.lines || '200', 10) || 200, 20), 1000)
  const keyword = String(query.keyword || '').trim().toLowerCase()
  const level = String(query.level || 'all').trim().toLowerCase()
  const allowedLevels = new Set(['all', 'info', 'success', 'warning', 'error'])
  const selectedLevel = allowedLevels.has(level) ? level : 'all'
  const logsRoot = path.resolve(runtimeLogDir)
  const sourceFiles = source.files || [source.file]
  const filePaths = sourceFiles.map(file => {
    const filePath = path.resolve(runtimeLogDir, file)
    if (!filePath.startsWith(logsRoot + path.sep)) {
      throw new Error('Invalid runtime log path')
    }
    return { file, filePath }
  })

  const sources = Object.entries(RUNTIME_LOG_SOURCES).map(([key, value]) => ({
    key,
    label: value.label,
    file: value.file || value.files.join(', ')
  }))

  try {
    const chunks = []
    let totalSizeBytes = 0
    let latestUpdatedAt = null
    let anyExists = false
    let anyTruncated = false

    for (const item of filePaths) {
      try {
        const result = await readRuntimeLogTail(item.filePath)
        totalSizeBytes += result.stats.size
        anyExists = true
        anyTruncated = anyTruncated || result.truncated
        if (!latestUpdatedAt || result.stats.mtime > latestUpdatedAt) latestUpdatedAt = result.stats.mtime
        const lines = result.text.split(/\r?\n/).map((line, index) => ({
          file: item.file,
          no: index + 1,
          sortTime: result.stats.mtimeMs,
          line
        }))
        chunks.push(...lines)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }

    if (!anyExists) {
      return {
        success: true,
        sources,
        selectedSource,
        selectedLevel,
        keyword,
        maxLines,
        file: source.file || source.files.join(', '),
        label: source.label,
        exists: false,
        truncated: false,
        sizeBytes: 0,
        updated_at: null,
        totalMatched: 0,
        lines: []
      }
    }

    const rawLines = chunks.sort((left, right) => left.sortTime - right.sortTime || left.file.localeCompare(right.file) || left.no - right.no)
    const normalized = rawLines
      .map((entry, index) => {
        const message = stripAnsiCodes(entry.line)
        return {
          no: index + 1,
          source: entry.file,
          lineNo: entry.no,
          level: classifyRuntimeLogLine(message),
          message
        }
      })
      .filter(line => line.message.trim())
      .filter(line => !keyword || line.message.toLowerCase().includes(keyword))
      .filter(line => selectedLevel === 'all' || line.level === selectedLevel)

    return {
      success: true,
      sources,
      selectedSource,
      selectedLevel,
      keyword,
      maxLines,
      file: source.file || source.files.join(', '),
      label: source.label,
      exists: true,
      truncated: anyTruncated,
      sizeBytes: totalSizeBytes,
      updated_at: latestUpdatedAt ? latestUpdatedAt.toISOString() : null,
      totalMatched: normalized.length,
      lines: normalized.slice(-maxLines)
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        success: true,
        sources,
        selectedSource,
        selectedLevel,
        keyword,
        maxLines,
        file: source.file || source.files.join(', '),
        label: source.label,
        exists: false,
        truncated: false,
        sizeBytes: 0,
        updated_at: null,
        totalMatched: 0,
        lines: []
      }
    }
    throw error
  }
}
function buildMetricsPayload() {
  const averageLatencyMs = requestMetrics.total > 0
    ? Number((requestMetrics.totalLatencyMs / requestMetrics.total).toFixed(2))
    : 0

  return {
    success: true,
    uptimeSeconds: Math.floor(process.uptime()),
    requests: {
      total: requestMetrics.total,
      inFlight: requestMetrics.inFlight,
      averageLatencyMs,
      byStatus: requestMetrics.byStatus,
      topRoutes: Object.entries(requestMetrics.byRoute)
        .sort(([, left], [, right]) => right - left)
        .slice(0, 20)
        .map(([route, count]) => ({ route, count }))
    },
    security: {
      stateDriver: SECURITY_CONFIG.securityStateDriver,
      activeRateLimitBuckets: rateLimitStore.size,
      activeLoginFailureBuckets: loginFailureStore.size,
      loginFailureLimit: SECURITY_CONFIG.loginFailureLimit,
      loginLockMs: SECURITY_CONFIG.loginLockMs
    },
    alerting: {
      webhookConfigured: Boolean(SECURITY_CONFIG.alertWebhookUrl),
      minLevel: SECURITY_CONFIG.alertMinLevel
    }
  }
}

app.get('/api/health', async (req, res) => {
  const payload = await buildHealthPayload()
  res.status(payload.success ? 200 : 503).json(payload)
})

app.get('/api/health/ready', async (req, res) => {
  const payload = await buildHealthPayload()
  res.status(payload.success ? 200 : 503).json({
    success: payload.success,
    checks: payload.checks,
    requestId: req.requestId
  })
})

app.get('/api/admin/metrics', adminAuthMiddleware, requirePermission('audit:read'), async (req, res) => {
  try {
    const [todayAiRows] = await pool.execute(
      `SELECT
         COUNT(*) AS calls,
         COALESCE(SUM(total_tokens), 0) AS total_tokens,
         COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
         COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
         COALESCE(SUM(estimated_cost), 0) AS estimated_cost
       FROM ai_usage_logs
       WHERE created_at >= CURDATE()`
    )
    // 按 provider + model 维度细分今日 token 用量
    const [todayAiByModelRows] = await pool.execute(
      `SELECT
         COALESCE(provider_name, '') AS provider_name,
         COALESCE(model_name, '')   AS model_name,
         COUNT(*) AS calls,
         COALESCE(SUM(total_tokens), 0)      AS total_tokens,
         COALESCE(SUM(prompt_tokens), 0)     AS prompt_tokens,
         COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
         COALESCE(SUM(estimated_cost), 0)    AS estimated_cost
       FROM ai_usage_logs
       WHERE created_at >= CURDATE()
       GROUP BY provider_name, model_name
       ORDER BY total_tokens DESC, calls DESC`
    )
    const [securityRows] = await pool.execute(
      `SELECT event_type, COUNT(*) AS count
       FROM security_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY event_type`
    )
    const [serviceRows] = await pool.execute(
      `SELECT
         service_type,
         provider_name,
         status,
         COUNT(*) AS calls,
         COALESCE(SUM(tokens), 0) AS tokens,
         COALESCE(SUM(estimated_cost), 0) AS estimated_cost,
         ROUND(AVG(duration_ms), 2) AS avg_duration_ms
       FROM external_service_call_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY service_type, provider_name, status
       ORDER BY calls DESC`
    )
    const [alertRows] = await pool.execute(
      `SELECT level, event_type, COUNT(*) AS count
       FROM alert_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY level, event_type
       ORDER BY count DESC`
    )

    res.json({
      ...buildMetricsPayload(),
      aiToday: {
        ...todayAiRows[0],
        byModel: todayAiByModelRows
      },
      securityEvents24h: securityRows,
      externalServiceCalls24h: serviceRows,
      alertEvents24h: alertRows
    })
  } catch (error) {
    console.error('获取运行指标失败:', error)
    res.status(500).json({ success: false, message: '获取运行指标失败' })
  }
})

app.get('/api/admin/runtime-logs', adminAuthMiddleware, requirePermission('audit:read'), async (req, res) => {
  try {
    res.json(await buildRuntimeLogPayload(req.query))
  } catch (error) {
    console.error('读取运行日志失败:', error)
    res.status(500).json({ success: false, message: '读取运行日志失败' })
  }
})

app.get('/api/admin/alerts', adminAuthMiddleware, requirePermission('audit:read'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const offset = (page - 1) * pageSize
    const handled = req.query.handled === undefined ? null : req.query.handled === 'true'
    const where = handled === null ? '' : 'WHERE handled = ?'
    const params = handled === null ? [] : [handled]

    const [rows] = await pool.execute(
      `SELECT * FROM alert_events ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM alert_events ${where}`, params)
    res.json({ success: true, data: rows, pagination: { page, pageSize, total: countRows[0].total } })
  } catch (error) {
    console.error('获取告警事件失败:', error)
    res.status(500).json({ success: false, message: '获取告警事件失败' })
  }
})

app.patch('/api/admin/alerts/:id/handled', adminAuthMiddleware, requirePermission('audit:read'), async (req, res) => {
  try {
    const { handled = true } = req.body
    const [beforeRows] = await pool.execute('SELECT * FROM alert_events WHERE id = ?', [req.params.id])
    if (beforeRows.length === 0) {
      return res.status(404).json({ success: false, message: '告警事件不存在' })
    }
    await pool.execute('UPDATE alert_events SET handled = ? WHERE id = ?', [Boolean(handled), req.params.id])
    const [afterRows] = await pool.execute('SELECT * FROM alert_events WHERE id = ?', [req.params.id])
    await auditLog(req, 'alert.mark_handled', 'alert_event', req.params.id, beforeRows[0], afterRows[0])
    res.json({ success: true, alert: afterRows[0] })
  } catch (error) {
    console.error('更新告警状态失败:', error)
    res.status(500).json({ success: false, message: '更新告警状态失败' })
  }
})

app.get('/api/admin/internal/metrics', hAdminInternalMiddleware, async (req, res) => {
  res.json(buildMetricsPayload())
})

const PORT = process.env.PORT || 8000

ensureAdminTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`hAdmin 静态后台入口: http://localhost:${PORT}/hadmin/login.html`)
      console.log(`前台业务后端运行在 http://localhost:${PORT}`)
      console.log('JWT 用户认证已就绪')
      console.log('hAdmin 双后端协作桥已就绪')
      console.log(`hAdmin 内部 API: ${HADMIN_INTERNAL_TOKEN ? '已启用' : '未启用（缺少 HADMIN_INTERNAL_TOKEN）'}`)
    })
  })
  .catch(error => {
    console.error('初始化管理端表结构失败:', error)
    process.exit(1)
  })
