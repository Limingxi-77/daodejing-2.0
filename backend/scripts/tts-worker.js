const mysql = require('mysql2/promise')
const { randomUUID } = require('crypto')
require('dotenv').config()

const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.VITE_MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || process.env.VITE_MYSQL_USER || 'daodejing',
  password: process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || process.env.VITE_MYSQL_DATABASE || 'daodejing_platform',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
}

const workerConfig = {
  intervalMs: parsePositiveInt(process.env.TTS_WORKER_INTERVAL_MS, 5000),
  batchSize: parsePositiveInt(process.env.TTS_WORKER_BATCH_SIZE, 3),
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY || process.env.COSYVOICE_API_KEY || '',
  dashscopeUrl: process.env.DASHSCOPE_TTS_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  model: process.env.COSYVOICE_MODEL || 'cosyvoice-v1',
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL || ''
}

const pool = mysql.createPool(dbConfig)
let running = false

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

async function emitAlert(level, eventType, message, metadata = {}) {
  const payload = { level, eventType, message, metadata, createdAt: new Date().toISOString() }
  console.error(JSON.stringify({ type: 'alert', ...payload }))

  try {
    await pool.execute(
      `INSERT INTO alert_events (id, level, event_type, message, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), level, eventType, message, JSON.stringify(metadata)]
    )
  } catch (error) {
    console.error('写入 worker 告警失败:', error)
  }

  if (!workerConfig.alertWebhookUrl) return

  try {
    await fetch(workerConfig.alertWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('推送 worker 告警失败:', error)
  }
}

async function claimPendingTasks() {
  const [rows] = await pool.execute(
    `SELECT *
     FROM tts_tasks
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT ?`,
    [workerConfig.batchSize]
  )

  const claimed = []
  for (const task of rows) {
    const [result] = await pool.execute(
      "UPDATE tts_tasks SET status = 'processing' WHERE id = ? AND status = 'pending'",
      [task.id]
    )
    if (result.affectedRows === 1) {
      claimed.push(task)
    }
  }
  return claimed
}

async function writeServiceLog(task, status, durationMs, errorMessage = null) {
  await pool.execute(
    `INSERT INTO external_service_call_logs
     (id, service_type, user_id, provider_name, model_name, status, duration_ms, error_message, request_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      'tts_worker',
      task.user_id,
      'dashscope',
      workerConfig.model,
      status,
      durationMs,
      errorMessage,
      `tts-task:${task.id}`
    ]
  )
}

async function synthesizeTask(task) {
  const startedAt = Date.now()

  if (!workerConfig.dashscopeApiKey) {
    const message = '未配置 DASHSCOPE_API_KEY，TTS worker 无法生成音频'
    await pool.execute(
      "UPDATE tts_tasks SET status = 'failed', error_message = ? WHERE id = ?",
      [message, task.id]
    )
    await writeServiceLog(task, 'failed', Date.now() - startedAt, message)
    await emitAlert('warning', 'tts_worker.missing_key', message, { taskId: task.id })
    return
  }

  try {
    const response = await fetch(workerConfig.dashscopeUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${workerConfig.dashscopeApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: workerConfig.model,
        input: { text: task.text },
        parameters: {
          voice: task.voice,
          speed_ratio: Number(task.speed || 1),
          volume_ratio: Number(task.volume || 1)
        }
      })
    })

    const contentType = response.headers.get('content-type') || ''
    if (!response.ok) {
      const errorData = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {}
      throw new Error(errorData.error?.message || errorData.message || `TTS 请求失败 (${response.status})`)
    }

    if (!contentType.includes('application/json')) {
      throw new Error('TTS 供应商返回二进制音频，当前 worker 需要可持久化 audioUrl')
    }

    const data = await response.json()
    const audioUrl = data.output?.audio || data.output?.url || data.audio_url || ''
    if (!audioUrl) {
      throw new Error('TTS 供应商未返回 audioUrl')
    }

    await pool.execute(
      "UPDATE tts_tasks SET status = 'completed', audio_url = ?, metadata = ? WHERE id = ?",
      [audioUrl, JSON.stringify({ provider: 'dashscope', model: workerConfig.model }), task.id]
    )
    await writeServiceLog(task, 'success', Date.now() - startedAt)
  } catch (error) {
    await pool.execute(
      "UPDATE tts_tasks SET status = 'failed', error_message = ? WHERE id = ?",
      [error.message, task.id]
    )
    await writeServiceLog(task, 'failed', Date.now() - startedAt, error.message)
    await emitAlert('error', 'tts_worker.task_failed', 'TTS 异步任务生成失败', { taskId: task.id, error: error.message })
  }
}

async function tick() {
  if (running) return
  running = true
  try {
    const tasks = await claimPendingTasks()
    for (const task of tasks) {
      await synthesizeTask(task)
    }
  } catch (error) {
    await emitAlert('error', 'tts_worker.tick_failed', 'TTS worker 轮询失败', { error: error.message })
  } finally {
    running = false
  }
}

console.log(`TTS worker 已启动，interval=${workerConfig.intervalMs}ms, batch=${workerConfig.batchSize}`)
tick()
const timer = setInterval(tick, workerConfig.intervalMs)

async function shutdown() {
  clearInterval(timer)
  await pool.end()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
