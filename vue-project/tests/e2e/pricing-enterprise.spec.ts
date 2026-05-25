import { expect, test, type Page } from '@playwright/test'

const FAKE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJuYW1lIjoidGVzdC11c2VyIiwidHlwZSI6InVzZXIiLCJpYXQiOjE3Nzk1Mzc4ODAsImV4cCI6MTc4MDE0MjY4MH0.fake-signature'

const FAKE_USER = {
  id: 'test-user',
  username: 'test-user',
  email: 'test@test.com',
  display_name: 'Test User',
  subscription_tier: 'free',
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z'
}

async function preparePage(page: Page) {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })
  await page.addInitScript(({ token, user }) => {
    try {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        subscription: { tier: 'free' },
        email_verified: true,
        created_at: user.created_at
      }))
    } catch { /* ignore */ }
    Object.defineProperty(window, 'alert', { configurable: true, value: () => undefined })
  }, { token: FAKE_JWT, user: FAKE_USER })

  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: FAKE_USER })
    })
  })

  await page.route('**/api/user/value-report', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        month: { calls: 0, tokens: 0, cost: 0, savedAdvisory: 0 },
        lifetime: { calls: 0, tokens: 0, cost: 0, savedAdvisory: 0 },
        progress: { learned: 0, total: 23, percent: 0 },
        generatedAt: new Date().toISOString()
      })
    })
  })

  await page.route('**/api/inbox**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, items: [], unreadCount: 0 })
    })
  })
}

async function openPricingModal(page: Page) {
  const memberBtn = page.locator('button[title="升级会员"]').first()
  await expect(memberBtn).toBeVisible({ timeout: 10_000 })
  await memberBtn.click()
}

test('Pricing 弹窗显示 5 档(个人 3 + 企业 2)', async ({ page }) => {
  await preparePage(page)
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await openPricingModal(page)

  await expect(page.getByTestId('tier-card-free')).toBeVisible({ timeout: 5_000 })
  await expect(page.getByTestId('tier-card-pro')).toBeVisible()
  await expect(page.getByTestId('tier-card-master')).toBeVisible()
  await expect(page.getByTestId('tier-card-team')).toBeVisible()
  await expect(page.getByTestId('tier-card-enterprise')).toBeVisible()
})

test('点击 Enterprise → 表单 → 提交成功显示确认', async ({ page }) => {
  await preparePage(page)
  await page.route('**/api/leads', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 42 })
      })
      return
    }
    await route.fallback()
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await openPricingModal(page)

  await expect(page.getByTestId('tier-card-enterprise')).toBeVisible({ timeout: 5_000 })

  await page.getByTestId('enterprise-contact-btn').click()
  await expect(page.getByTestId('enterprise-contact-modal')).toBeVisible({ timeout: 3_000 })

  await page.getByTestId('lead-name-input').fill('张三')
  await page.getByTestId('lead-email-input').fill('zhangsan@example.com')
  await page.getByTestId('lead-company-input').fill('某科技公司')
  await page.getByTestId('lead-team-size-select').selectOption('51-200')
  await page.getByTestId('lead-note-textarea').fill('希望了解企业私有部署方案')

  await page.getByTestId('lead-submit-btn').click()
  await expect(page.getByTestId('enterprise-submitted')).toBeVisible({ timeout: 5_000 })
})

test('Enterprise 表单后端 400 错误时显示错误消息', async ({ page }) => {
  await preparePage(page)
  await page.route('**/api/leads', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'email format invalid' })
      })
      return
    }
    await route.fallback()
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await openPricingModal(page)
  await page.getByTestId('enterprise-contact-btn').click()
  await expect(page.getByTestId('enterprise-contact-modal')).toBeVisible({ timeout: 3_000 })

  await page.getByTestId('lead-name-input').fill('李四')
  await page.getByTestId('lead-email-input').fill('not-an-email@x')
  await page.getByTestId('lead-submit-btn').click()

  await expect(page.getByTestId('lead-error-message')).toBeVisible({ timeout: 5_000 })
  await expect(page.getByTestId('lead-error-message')).toContainText('email')
})
