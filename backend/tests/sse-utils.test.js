'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const {
  splitSSEBuffer,
  parseSSEEvent,
  extractDeltaAndUsage,
  chunkTextForMock,
  formatSSEData,
  SSE_DONE_LINE,
  SSE_COMMENT_PING
} = require('../lib/sse-utils')

test('splitSSEBuffer 拼接跨包碎片再按 \\n\\n 切分', () => {
  const r1 = splitSSEBuffer('', 'data: {"a":1}\n')
  assert.deepEqual(r1.events, [])
  assert.equal(r1.remainingBuffer, 'data: {"a":1}\n')

  const r2 = splitSSEBuffer(r1.remainingBuffer, '\ndata: {"b":2}\n\n')
  assert.deepEqual(r2.events, ['data: {"a":1}', 'data: {"b":2}'])
  assert.equal(r2.remainingBuffer, '')
})

test('splitSSEBuffer 半完整事件留在 remainingBuffer 等下次', () => {
  const r = splitSSEBuffer('', 'data: {"x":1}\n\ndata: {"y":2}\n')
  assert.deepEqual(r.events, ['data: {"x":1}'])
  assert.equal(r.remainingBuffer, 'data: {"y":2}\n')
})

test('splitSSEBuffer 处理空输入', () => {
  const r = splitSSEBuffer(null, null)
  assert.deepEqual(r.events, [])
  assert.equal(r.remainingBuffer, '')
})

test('parseSSEEvent 识别 [DONE]', () => {
  assert.deepEqual(parseSSEEvent('data: [DONE]'), { type: 'done' })
})

test('parseSSEEvent 解析 JSON payload', () => {
  const r = parseSSEEvent('data: {"choices":[{"delta":{"content":"hello"}}]}')
  assert.equal(r.type, 'message')
  assert.equal(r.payload.choices[0].delta.content, 'hello')
})

test('parseSSEEvent 处理多行 data', () => {
  const r = parseSSEEvent('data: {"a":\ndata: 1}')
  assert.equal(r.type, 'message')
  assert.equal(r.payload.a, 1)
})

test('parseSSEEvent 注释行(心跳)单独识别', () => {
  assert.deepEqual(parseSSEEvent(': ping'), { type: 'comment' })
  assert.deepEqual(parseSSEEvent(': keep-alive'), { type: 'comment' })
})

test('parseSSEEvent 无效 JSON 不抛错,返回 unknown', () => {
  const r = parseSSEEvent('data: not-json{')
  assert.equal(r.type, 'unknown')
  assert.equal(r.raw, 'not-json{')
})

test('parseSSEEvent 空输入返回 unknown', () => {
  assert.deepEqual(parseSSEEvent(''), { type: 'unknown' })
  assert.deepEqual(parseSSEEvent(null), { type: 'unknown' })
})

test('extractDeltaAndUsage 抽取标准 OpenAI 兼容 chunk', () => {
  const payload = {
    choices: [{ delta: { content: '你好' }, finish_reason: null }],
    usage: null
  }
  const r = extractDeltaAndUsage(payload)
  assert.equal(r.delta, '你好')
  assert.equal(r.usage, null)
  assert.equal(r.finishReason, null)
})

test('extractDeltaAndUsage 抽取最终 usage', () => {
  const payload = {
    choices: [{ delta: {}, finish_reason: 'stop' }],
    usage: { prompt_tokens: 10, completion_tokens: 50, total_tokens: 60 }
  }
  const r = extractDeltaAndUsage(payload)
  assert.equal(r.delta, '')
  assert.equal(r.usage.total_tokens, 60)
  assert.equal(r.finishReason, 'stop')
})

test('extractDeltaAndUsage 防御空 payload', () => {
  assert.deepEqual(extractDeltaAndUsage(null), { delta: '', usage: null, finishReason: null })
  assert.deepEqual(extractDeltaAndUsage({}), { delta: '', usage: null, finishReason: null })
  assert.deepEqual(extractDeltaAndUsage({ choices: [] }), { delta: '', usage: null, finishReason: null })
})

test('chunkTextForMock 按指定大小切片', () => {
  const r = chunkTextForMock('道法自然万物归一', 3)
  assert.deepEqual(r, ['道法自', '然万物', '归一'])
})

test('chunkTextForMock 空文本返回空数组', () => {
  assert.deepEqual(chunkTextForMock(''), [])
  assert.deepEqual(chunkTextForMock(null), [])
})

test('chunkTextForMock 默认大小 5', () => {
  const r = chunkTextForMock('abcdefghij')
  assert.deepEqual(r, ['abcde', 'fghij'])
})

test('formatSSEData 生成符合规范的 SSE 行', () => {
  const r = formatSSEData({ delta: 'hi' })
  assert.equal(r, 'data: {"delta":"hi"}\n\n')
})

test('SSE_DONE_LINE 与 SSE_COMMENT_PING 常量正确', () => {
  assert.equal(SSE_DONE_LINE, 'data: [DONE]\n\n')
  assert.equal(SSE_COMMENT_PING, ': ping\n\n')
})

test('端到端:模拟 DeepSeek 流响应被正确解析', () => {
  // 模拟上游一次推送的混合内容(跨包合并后的样子)
  const upstream = [
    'data: {"choices":[{"delta":{"content":"道"}}]}\n\n',
    'data: {"choices":[{"delta":{"content":"法"}}]}\n\n',
    ': keep-alive\n\n',
    'data: {"choices":[{"delta":{"content":"自然"}}],"usage":null}\n\n',
    'data: {"choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":3,"completion_tokens":3,"total_tokens":6}}\n\n',
    'data: [DONE]\n\n'
  ].join('')

  // 故意打散成 3 段模拟 TCP chunk
  const mid = Math.floor(upstream.length / 3)
  const tcpChunks = [upstream.slice(0, mid), upstream.slice(mid, mid * 2), upstream.slice(mid * 2)]

  let buffer = ''
  let collectedContent = ''
  let finalUsage = null
  let sawDone = false

  for (const tcp of tcpChunks) {
    const split = splitSSEBuffer(buffer, tcp)
    buffer = split.remainingBuffer
    for (const eventBlock of split.events) {
      const parsed = parseSSEEvent(eventBlock)
      if (parsed.type === 'done') {
        sawDone = true
      } else if (parsed.type === 'message') {
        const { delta, usage } = extractDeltaAndUsage(parsed.payload)
        if (delta) collectedContent += delta
        if (usage) finalUsage = usage
      }
    }
  }

  // 最后一行 [DONE] 可能正好压在尾部,而 buffer 应剩空(因为输入末尾有 \n\n)
  assert.equal(collectedContent, '道法自然')
  assert.equal(finalUsage?.total_tokens, 6)
  assert.equal(sawDone, true)
  assert.equal(buffer, '')
})
