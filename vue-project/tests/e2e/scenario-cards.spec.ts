import { expect, test, type Page, type Route } from '@playwright/test'

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
      // 列表
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      return
    }
    if (method === 'POST') {
      // 创建会话 / 保存消息
      const url = route.request().url()
      if (/\/messages(\?.*)?$/.test(url)) {
        // 保存单条消息
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
        return
      }
      // 创建会话:apiClient<Conversation> 期望直接返回 Conversation 对象
      const now = new Date().toISOString()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'fake-scenarios',
          title: '场景卡测试',
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

async function mockStreamReply(page: Page, deltas: string[]) {
  await page.route('**/api/ai/chat/stream', async (route: Route) => {
    const lines: string[] = []
    for (const d of deltas) {
      lines.push(`data: ${JSON.stringify({ delta: d })}\n\n`)
    }
    lines.push(`data: ${JSON.stringify({ event: 'done', usage: { prompt_tokens: 5, completion_tokens: deltas.length, total_tokens: 5 + deltas.length }, estimatedCost: 0 })}\n\n`)
    lines.push('data: [DONE]\n\n')
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform'
      },
      body: lines.join('')
    })
  })
}

test('AI 解读页底部渲染场景卡网格', async ({ page }) => {
  await preparePage(page)
  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })

  await expect(page.getByTestId('scenario-cards-panel')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('scenario-card-anxiety-insomnia')).toBeVisible()
  await expect(page.getByTestId('scenario-card-procrastination')).toBeVisible()
  await expect(page.getByTestId('scenario-card-sudden-shock')).toBeVisible()
})

test('点击场景卡触发流式 AI 回复', async ({ page }) => {
  await preparePage(page)
  await mockStreamReply(page, ['顺其', '自然，', '让身心', '回到', '此刻。'])

  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })

  // 等待 auth/me 已落地、isLoggedIn=true(否则点击会被 openAuthModal 拦截)
  await expect(page.locator('button', { hasText: '退出' }).first()).toBeVisible({ timeout: 10_000 })

  const card = page.getByTestId('scenario-card-anxiety-insomnia')
  await expect(card).toBeVisible({ timeout: 10_000 })
  await card.click()

  const aiMessages = page.getByTestId('ai-chat-message-ai')
  await expect(aiMessages.last()).toContainText('顺其自然', { timeout: 15_000 })
})

test('三家会议模式下场景卡仍可见,点击回填到议事 textarea', async ({ page }) => {
  await preparePage(page)
  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('scenario-cards-panel')).toBeVisible({ timeout: 10_000 })

  await page.getByTestId('mode-tab-council').click()
  await expect(page.getByTestId('council-panel')).toBeVisible({ timeout: 10_000 })

  // 切到三家会议后,场景卡 / 章节 / 热门问题应保持可见 — 模式切换辅助内容一致
  await expect(page.getByTestId('scenario-cards-panel')).toBeVisible()

  // 点击场景卡应回填到议事 textarea(不再触发流式)
  const card = page.getByTestId('scenario-card-anxiety-insomnia')
  await expect(card).toBeVisible()
  await card.click()

  const textarea = page.getByTestId('council-question-input')
  await expect(textarea).not.toHaveValue('', { timeout: 5_000 })
})
