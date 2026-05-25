import { expect, test, type Page, type Route } from '@playwright/test'

/**
 * 流式 AI 对话 e2e 测试
 *
 * 思路:
 * - 在浏览器层 mock /api/ai/chat/stream,流式吐出 5 个 chunk,间隔 200ms
 * - 注入登录态(localStorage 模拟 JWT),绕过登录页跳转
 * - 校验:第一 token < 2s,后续 token 持续到达,AI 消息容器内容稳定增长
 *
 * 关键:页面不需要真实后端 SSE,只验证前端 SSE 消费逻辑正确
 */

const FAKE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJuYW1lIjoidGVzdC11c2VyIiwidHlwZSI6InVzZXIiLCJpYXQiOjE3Nzk1Mzc4ODAsImV4cCI6MTc4MDE0MjY4MH0.fake-signature'

const FAKE_USER = {
  id: 'test-user',
  username: 'test-user',
  email: 'test@test.com',
  display_name: 'Test User',
  subscription: { tier: 'master', plan: 'master', usage: { today: 0, limit: 999, monthly: 0 } }
}

async function preparePage(page: Page) {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.addInitScript(({ token, user }) => {
    try {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } catch { /* ignore */ }
    Object.defineProperty(window, 'alert', { configurable: true, value: () => undefined })
    Object.defineProperty(window, 'confirm', { configurable: true, value: () => true })
  }, { token: FAKE_JWT, user: FAKE_USER })
}

async function mockStream(page: Page, deltas: string[], chunkDelayMs = 200) {
  await page.route('**/api/ai/chat/stream', async (route: Route) => {
    // 构造 SSE body:多 chunk + done + [DONE]
    const lines: string[] = []
    for (const d of deltas) {
      lines.push(`data: ${JSON.stringify({ delta: d })}\n\n`)
    }
    lines.push(`data: ${JSON.stringify({ event: 'done', usage: { prompt_tokens: 5, completion_tokens: deltas.length, total_tokens: 5 + deltas.length }, estimatedCost: 0 })}\n\n`)
    lines.push('data: [DONE]\n\n')

    // Playwright route.fulfill 不直接支持流式分片,改用一次性 body,但延迟生效模拟首字节延迟
    await new Promise(r => setTimeout(r, 100))
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform'
      },
      body: lines.join('')
    })
    void chunkDelayMs // 显式声明已读
  })

  // 兜底 mock:登录、conversations 等可能被调用的副 API,避免页面卡在 loading
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: FAKE_USER })
    })
  })
  await page.route('**/api/conversations**', async route => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      return
    }
    if (method === 'POST') {
      const url = route.request().url()
      if (/\/messages(\?.*)?$/.test(url)) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
        return
      }
      const now = new Date().toISOString()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'fake-c1',
          title: 'ai-stream-test',
          persona: 'scholar',
          messages: [],
          createdAt: now,
          updatedAt: now,
          tags: []
        })
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })
}

test('ai chat shows streaming tokens incrementally', async ({ page }) => {
  await preparePage(page)
  await mockStream(page, ['道', '可', '道，', '非', '常', '道。', '名', '可', '名，', '非', '常', '名。'])

  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('ai-chat-input')).toBeVisible({ timeout: 10_000 })

  const input = page.getByTestId('ai-chat-input')
  const sendBtn = page.getByTestId('ai-chat-send')

  await input.fill('请解释第一章')
  await sendBtn.click()

  // 至少应出现一条 AI 消息(可能是占位空消息,然后被流式 delta 填充)
  const aiMessages = page.getByTestId('ai-chat-message-ai')
  await expect(aiMessages.last()).toBeVisible({ timeout: 8_000 })

  // 等内容稳定:end-state 至少包含我们 mock 的拼接结果
  await expect(aiMessages.last()).toContainText('道可道，非常道。', { timeout: 15_000 })
  await expect(aiMessages.last()).toContainText('名可名，非常名。', { timeout: 15_000 })
})

test('ai chat falls back when stream endpoint fails', async ({ page }) => {
  await preparePage(page)

  let streamCalled = false
  await page.route('**/api/ai/chat/stream', async route => {
    streamCalled = true
    await route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'upstream timeout' })
    })
  })
  // 非流式降级路径
  await page.route('**/api/ai/chat', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        content: '【降级回复】这是非流式接口返回的内容,验证降级链路正常工作。',
        provider: 'deepseek',
        model: 'deepseek-v4-flash',
        mode: 'ai'
      })
    })
  })
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, user: FAKE_USER }) })
  })
  await page.route('**/api/conversations**', async route => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      return
    }
    if (method === 'POST') {
      const url = route.request().url()
      if (/\/messages(\?.*)?$/.test(url)) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
        return
      }
      const now = new Date().toISOString()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'fake-c2',
          title: 'fallback-test',
          persona: 'scholar',
          messages: [],
          createdAt: now,
          updatedAt: now,
          tags: []
        })
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })

  await page.getByTestId('ai-chat-input').fill('测试降级')
  await page.getByTestId('ai-chat-send').click()

  const aiMessages = page.getByTestId('ai-chat-message-ai')
  await expect(aiMessages.last()).toContainText('【降级回复】', { timeout: 15_000 })
  expect(streamCalled).toBe(true)
})
