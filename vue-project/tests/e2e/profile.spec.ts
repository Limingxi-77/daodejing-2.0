import { expect, test, type Page } from '@playwright/test'

const FAKE_JWT = 'profile-hub-test-token'

const FAKE_USER = {
  id: 'profile-user',
  username: 'profile-user',
  email: 'profile@example.com',
  display_name: 'Profile User',
  subscription_tier: 'pro',
  subscription_expiry: '2026-12-31T00:00:00Z',
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

  await page.route('**/api/user/value-report', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        month: { calls: 18, tokens: 24500, cost: 2.4, savedAdvisory: 540 },
        lifetime: { calls: 88, tokens: 120000, cost: 11.8, savedAdvisory: 2640 },
        progress: { learned: 12, total: 81, percent: 15 },
        generatedAt: new Date().toISOString()
      })
    })
  })

  await page.route('**/api/notes**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        notes: [
          {
            id: 'note-1',
            userId: 'profile-user',
            lessonId: 8,
            title: '上善若水',
            content: '柔弱胜刚强',
            tags: ['水', '处下'],
            createdAt: '2026-05-01T00:00:00Z',
            updatedAt: '2026-05-02T00:00:00Z',
            isPublic: false
          },
          {
            id: 'note-2',
            userId: 'profile-user',
            lessonId: 16,
            title: '致虚守静',
            content: '观察复归',
            tags: ['静'],
            createdAt: '2026-05-03T00:00:00Z',
            updatedAt: '2026-05-04T00:00:00Z',
            isPublic: false
          }
        ]
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

test('profile page aggregates account and learning state', async ({ page }) => {
  await prepareLoggedInPage(page)

  await page.goto('/profile', { waitUntil: 'domcontentloaded' })

  await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('profile-display-name')).toContainText('Profile User')
  await expect(page.getByTestId('profile-email')).toContainText('profile@example.com')
  await expect(page.getByTestId('profile-tier')).toContainText('居士')
  await expect(page.getByTestId('profile-xp')).toContainText('640 XP')
  await expect(page.getByTestId('profile-current-realm')).toContainText('筑基')
  await expect(page.getByTestId('profile-next-realm-gap')).toContainText('还差 860 XP')
  await expect(page.getByTestId('value-report-card')).toBeVisible()
  await expect(page.getByTestId('profile-learning-progress')).toContainText('12/81 章')
  await expect(page.getByTestId('profile-notes-count')).toContainText('2')
  await expect(page.getByTestId('profile-recent-notes')).toContainText('上善若水')
  await expect(page.getByTestId('profile-action-learning')).toBeVisible()
  await expect(page.getByTestId('profile-action-ai')).toBeVisible()
})
