import { expect, test, type Page } from '@playwright/test'

const FAKE_JWT = 'avatar-xp-popover-test-token'

const FAKE_USER = {
  id: 'avatar-xp-user',
  username: 'avatar-xp-user',
  email: 'avatar-xp@example.com',
  display_name: 'Avatar XP User',
  subscription_tier: 'free',
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z'
}

async function prepareLoggedInPage(page: Page) {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.addInitScript(({ token }) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('cultivation_exp', '640')
    Object.defineProperty(window, 'alert', { configurable: true, value: () => undefined })
  }, { token: FAKE_JWT })

  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: FAKE_USER })
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

test('clicking user avatar shows current XP balance and next realm gap', async ({ page }) => {
  await prepareLoggedInPage(page)

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.getByTestId('user-avatar-xp-trigger')).toBeVisible({ timeout: 10_000 })
  await page.getByTestId('user-avatar-xp-trigger').click()

  const popover = page.getByTestId('user-xp-popover')
  await expect(popover).toBeVisible()
  await expect(popover).toContainText('640 XP')
  await expect(popover).toContainText('筑基')
  await expect(popover).toContainText('金丹')
  await expect(popover).toContainText('还差 860 XP')
  await expect(popover).toContainText('每日一签 +50 XP')
  await expect(popover).toContainText('再抽 -30 XP')

  await page.keyboard.press('Escape')
  await expect(popover).toBeHidden()

  await page.getByTestId('user-avatar-xp-trigger').click()
  await expect(popover).toBeVisible()
  await page.locator('main').click()
  await expect(popover).toBeHidden()
})
