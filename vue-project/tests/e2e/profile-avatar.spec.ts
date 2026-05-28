import { expect, test, type Page } from '@playwright/test'

const FAKE_JWT = 'profile-avatar-test-token'

const FAKE_USER = {
  id: 'avatar-user',
  username: 'avatar-user',
  email: 'avatar@example.com',
  display_name: 'Avatar User',
  subscription_tier: 'free',
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
  avatar_url: null,
  pending_avatar_url: null,
  avatar_status: 'none'
}

async function prepareLoggedInPage(page: Page) {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.addInitScript(({ token }) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('cultivation_exp', '120')
    Object.defineProperty(window, 'alert', { configurable: true, value: () => undefined })
  }, { token: FAKE_JWT })

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
        progress: { learned: 0, total: 81, percent: 0 },
        generatedAt: new Date().toISOString()
      })
    })
  })

  await page.route('**/api/notes**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, notes: [] })
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

test('profile avatar upload enters pending review', async ({ page }) => {
  await prepareLoggedInPage(page)

  await page.route('**/api/user/avatar', async route => {
    const payload = route.request().postDataJSON()
    expect(payload.imageData).toContain('data:image/png;base64,')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          ...FAKE_USER,
          pending_avatar_url: '/uploads/avatars/pending/avatar-user-test.png',
          avatar_status: 'pending',
          avatar_submitted_at: new Date().toISOString()
        }
      })
    })
  })

  await page.goto('/profile', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 10_000 })

  await page.getByTestId('profile-avatar-input').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('avatar-bytes')
  })
  await page.getByTestId('profile-avatar-submit').click()

  await expect(page.getByTestId('profile-avatar-status')).toContainText('待审核')
  await expect(page.getByTestId('profile-avatar-message')).toContainText('头像已提交，等待后台审核')
})

test('profile avatar upload shows readable message when backend returns html', async ({ page }) => {
  await prepareLoggedInPage(page)

  await page.route('**/api/user/avatar', async route => {
    await route.fulfill({
      status: 404,
      contentType: 'text/html',
      body: '<!DOCTYPE html><html><body>Not Found</body></html>'
    })
  })

  await page.goto('/profile', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 10_000 })

  await page.getByTestId('profile-avatar-input').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('avatar-bytes')
  })
  await page.getByTestId('profile-avatar-submit').click()

  await expect(page.getByTestId('profile-avatar-message')).toContainText('请求失败 (404)')
  await expect(page.getByTestId('profile-avatar-message')).not.toContainText('Unexpected token')
})
