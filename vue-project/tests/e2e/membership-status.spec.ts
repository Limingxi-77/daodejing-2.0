import { expect, test, type Page } from '@playwright/test'

const FAKE_JWT = 'membership-status-test-token'

async function prepareLoggedInPage(page: Page, tier: string) {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.addInitScript(({ token }) => {
    localStorage.setItem('auth_token', token)
    Object.defineProperty(window, 'alert', { configurable: true, value: () => undefined })
  }, { token: FAKE_JWT })

  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          id: `membership-${tier}`,
          username: `membership-${tier}`,
          email: `membership-${tier}@example.com`,
          display_name: `Membership ${tier}`,
          subscription_tier: tier,
          subscription_expiry: tier === 'free' ? null : '2026-12-31T00:00:00Z',
          email_verified: true,
          created_at: '2026-01-01T00:00:00Z'
        }
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

test('free user sees the membership purchase icon in the combined entry', async ({ page }) => {
  await prepareLoggedInPage(page, 'free')

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const entry = page.getByTestId('membership-status-button')
  await expect(entry).toBeVisible({ timeout: 10_000 })
  await expect(entry).toHaveAttribute('data-membership-state', 'upgrade')
  await expect(entry).toContainText('会员')
  await expect(entry.locator('i')).toHaveClass(/fa-crown/)
})

test('paid user sees the membership level icon in the combined entry', async ({ page }) => {
  await prepareLoggedInPage(page, 'pro')

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const entry = page.getByTestId('membership-status-button')
  await expect(entry).toBeVisible({ timeout: 10_000 })
  await expect(entry).toHaveAttribute('data-membership-state', 'level')
  await expect(entry).toContainText('居士')
  await expect(entry.locator('i')).toHaveClass(/fa-seedling/)
})
