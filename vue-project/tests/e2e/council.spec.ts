import { expect, test, type Page } from '@playwright/test'

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
  }, { token: FAKE_JWT, user: FAKE_USER })
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: FAKE_USER })
    })
  })
}

test('议事页加载并显示三个 persona 占位卡', async ({ page }) => {
  await preparePage(page)
  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('mode-tab-council').click()
  await expect(page.getByTestId('council-panel')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('council-question-input')).toBeVisible()
  await expect(page.getByTestId('council-ask-button')).toBeDisabled()
})

test('提问后并行显示三个 persona 答复', async ({ page }) => {
  await preparePage(page)
  await page.route('**/api/ai/council', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        provider: 'mock',
        model: 'mock-1',
        personas: [
          {
            personaId: 'scholar',
            personaName: '现代学者',
            icon: 'fa-graduation-cap',
            content: '从学术角度,《道德经》第二十二章「曲则全」体现了辩证思维。',
            status: 'success',
            tokens: 42
          },
          {
            personaId: 'hermit',
            personaName: '道家隐士',
            icon: 'fa-mountain',
            content: '道法自然,顺势而为方能化解压力,不必苦苦相争。',
            status: 'success',
            tokens: 38
          },
          {
            personaId: 'healer',
            personaName: '心理疗愈师',
            icon: 'fa-heart',
            content: '允许自己慢下来,呼吸数到十,焦虑会逐渐松开。',
            status: 'success',
            tokens: 30
          }
        ],
        totalTokens: 110,
        estimatedCost: 0.0012,
        mode: 'ai'
      })
    })
  })

  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('mode-tab-council').click()
  await expect(page.getByTestId('council-panel')).toBeVisible({ timeout: 10_000 })

  await page.getByTestId('council-question-input').fill('工作压力大,容易焦虑,《道德经》有什么启示?')
  await page.getByTestId('council-ask-button').click()

  await expect(page.getByTestId('council-results')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('council-card-scholar-content')).toContainText('辩证思维', { timeout: 10_000 })
  await expect(page.getByTestId('council-card-hermit-content')).toContainText('道法自然', { timeout: 10_000 })
  await expect(page.getByTestId('council-card-healer-content')).toContainText('呼吸', { timeout: 10_000 })
})

test('其中一个 persona 失败时,其余正常显示', async ({ page }) => {
  await preparePage(page)
  await page.route('**/api/ai/council', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        provider: 'mock',
        model: 'mock-1',
        personas: [
          {
            personaId: 'scholar',
            personaName: '现代学者',
            icon: 'fa-graduation-cap',
            content: '正常回复。',
            status: 'success',
            tokens: 12
          },
          {
            personaId: 'hermit',
            personaName: '道家隐士',
            icon: 'fa-mountain',
            error: '上游超时'
          },
          {
            personaId: 'healer',
            personaName: '心理疗愈师',
            icon: 'fa-heart',
            content: '另一个正常回复。',
            status: 'success',
            tokens: 14
          }
        ],
        totalTokens: 26,
        estimatedCost: 0.0003,
        mode: 'partial-council'
      })
    })
  })

  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('mode-tab-council').click()
  await expect(page.getByTestId('council-panel')).toBeVisible({ timeout: 10_000 })
  await page.getByTestId('council-question-input').fill('随便问一句')
  await page.getByTestId('council-ask-button').click()

  await expect(page.getByTestId('council-card-scholar-content')).toContainText('正常回复', { timeout: 10_000 })
  await expect(page.getByTestId('council-card-hermit-error')).toContainText('上游超时', { timeout: 10_000 })
  await expect(page.getByTestId('council-card-healer-content')).toContainText('另一个正常回复', { timeout: 10_000 })
})

test('辩论模式渲染两轮三栏卡片', async ({ page }) => {
  await preparePage(page)
  await page.route('**/api/ai/council', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        provider: 'mock',
        model: 'mock-1',
        mode: 'debate',
        status: 'success-debate',
        personas: [
          {
            personaId: 'scholar',
            personaName: '现代学者',
            icon: 'fa-graduation-cap',
            content: '第一轮学者观点:辩证看待焦虑。',
            status: 'success',
            tokens: 30
          },
          {
            personaId: 'hermit',
            personaName: '道家隐士',
            icon: 'fa-mountain',
            content: '第一轮隐士观点:观山观水皆自然。',
            status: 'success',
            tokens: 28
          },
          {
            personaId: 'healer',
            personaName: '心理疗愈师',
            icon: 'fa-heart',
            content: '第一轮疗愈师观点:允许自己慢一些。',
            status: 'success',
            tokens: 26
          }
        ],
        rounds: [
          {
            round: 1,
            personas: [
              {
                personaId: 'scholar',
                personaName: '现代学者',
                icon: 'fa-graduation-cap',
                content: '第一轮学者观点:辩证看待焦虑。',
                status: 'success',
                tokens: 30
              },
              {
                personaId: 'hermit',
                personaName: '道家隐士',
                icon: 'fa-mountain',
                content: '第一轮隐士观点:观山观水皆自然。',
                status: 'success',
                tokens: 28
              },
              {
                personaId: 'healer',
                personaName: '心理疗愈师',
                icon: 'fa-heart',
                content: '第一轮疗愈师观点:允许自己慢一些。',
                status: 'success',
                tokens: 26
              }
            ]
          },
          {
            round: 2,
            personas: [
              {
                personaId: 'scholar',
                personaName: '现代学者',
                icon: 'fa-graduation-cap',
                content: '回应隐士:诗意需要落地为方法论。',
                status: 'success',
                tokens: 36
              },
              {
                personaId: 'hermit',
                personaName: '道家隐士',
                icon: 'fa-mountain',
                content: '回应学者:学术之外,亦有山林之声。',
                status: 'success',
                tokens: 32
              },
              {
                personaId: 'healer',
                personaName: '心理疗愈师',
                icon: 'fa-heart',
                content: '回应两位:共情先行,辩证随后。',
                status: 'success',
                tokens: 30
              }
            ]
          }
        ],
        totalTokens: 182,
        estimatedCost: 0.0021
      })
    })
  })

  await page.goto('/ai-interpretation', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('ai-interpretation-page')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('mode-tab-council').click()
  await expect(page.getByTestId('council-panel')).toBeVisible({ timeout: 10_000 })

  // 切到辩论模式
  await page.getByTestId('council-mode-tab-debate').click()

  await page.getByTestId('council-question-input').fill('996 文化下如何保持自我?')
  await page.getByTestId('council-ask-button').click()

  // 第一轮三栏
  await expect(page.getByTestId('council-debate-results')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('council-debate-r1-scholar-content')).toContainText('辩证看待焦虑', { timeout: 10_000 })
  await expect(page.getByTestId('council-debate-r1-hermit-content')).toContainText('观山观水', { timeout: 10_000 })
  await expect(page.getByTestId('council-debate-r1-healer-content')).toContainText('允许自己慢', { timeout: 10_000 })

  // 第二轮三栏(包含回应内容)
  await expect(page.getByTestId('council-debate-r2-scholar-content')).toContainText('诗意需要落地', { timeout: 10_000 })
  await expect(page.getByTestId('council-debate-r2-hermit-content')).toContainText('山林之声', { timeout: 10_000 })
  await expect(page.getByTestId('council-debate-r2-healer-content')).toContainText('共情先行', { timeout: 10_000 })
})
