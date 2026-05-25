'use strict'

/**
 * SSE 工具:供 /api/ai/chat/stream 路由 + 单元测试共用
 * 全部为纯函数,无副作用,便于 node --test 直接覆盖
 */

/**
 * 将新到来的字节串(已经过 TextDecoder 转 string)追加到滚动 buffer,
 * 按 \n\n 切分完整事件块,返回已完成的事件块数组和未消费的剩余 buffer
 *
 * 设计原因:上游 SSE 的 `data:` 行可能跨多个 TCP chunk 到达,
 * 必须先聚合再切分,否则会丢 token —— 这是 SSE 代理最常见的 bug
 */
function splitSSEBuffer(prevBuffer, incomingText) {
  const combined = (prevBuffer || '') + (incomingText || '')
  const parts = combined.split('\n\n')
  const remainingBuffer = parts.pop()
  return {
    events: parts.filter(p => p.length > 0),
    remainingBuffer: remainingBuffer || ''
  }
}

/**
 * 解析单个 SSE 事件块(可能包含多行,如 event:/data:/id:/retry:)
 * 我们只关心 `data:` 行,可能多行 data 拼接成多行字符串
 * 返回:
 *   - { type: 'done' }              对应 data: [DONE]
 *   - { type: 'message', payload }  对应 data: JSON
 *   - { type: 'comment' }           对应 : 注释行(心跳)
 *   - { type: 'unknown' }           其他无法解析
 */
function parseSSEEvent(rawEventBlock) {
  if (!rawEventBlock || typeof rawEventBlock !== 'string') {
    return { type: 'unknown' }
  }
  const lines = rawEventBlock.split('\n')
  const dataLines = []
  let isCommentOnly = true
  for (const line of lines) {
    if (line.startsWith(':')) continue
    isCommentOnly = false
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }
  if (isCommentOnly) return { type: 'comment' }
  if (dataLines.length === 0) return { type: 'unknown' }
  const joined = dataLines.join('\n').trim()
  if (joined === '[DONE]') return { type: 'done' }
  try {
    return { type: 'message', payload: JSON.parse(joined) }
  } catch {
    return { type: 'unknown', raw: joined }
  }
}

/**
 * 从 OpenAI 兼容 chunk(payload)中提取 delta 文本和 usage
 * 三家供应商(DeepSeek/OpenRouter/OpenAI)统一格式:
 *   { choices: [{ delta: { content: "..." } }], usage: {...}? }
 */
function extractDeltaAndUsage(payload) {
  if (!payload || typeof payload !== 'object') {
    return { delta: '', usage: null, finishReason: null }
  }
  const choice = Array.isArray(payload.choices) ? payload.choices[0] : null
  const delta = choice?.delta?.content || ''
  const finishReason = choice?.finish_reason || null
  const usage = payload.usage || null
  return { delta, usage, finishReason }
}

/**
 * 将文本按 chunkSize 切片,用于 mock 模式逐段推送
 * 避免在循环里手算下标
 */
function chunkTextForMock(text, chunkSize = 5) {
  if (!text) return []
  const size = Math.max(1, chunkSize | 0)
  const chunks = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

/**
 * 把对象格式化成 SSE data 行(带尾部 \n\n)
 * 调用方直接 res.write(formatSSEData(...))
 */
function formatSSEData(obj) {
  return `data: ${JSON.stringify(obj)}\n\n`
}

const SSE_DONE_LINE = 'data: [DONE]\n\n'
const SSE_COMMENT_PING = ': ping\n\n'

module.exports = {
  splitSSEBuffer,
  parseSSEEvent,
  extractDeltaAndUsage,
  chunkTextForMock,
  formatSSEData,
  SSE_DONE_LINE,
  SSE_COMMENT_PING
}
