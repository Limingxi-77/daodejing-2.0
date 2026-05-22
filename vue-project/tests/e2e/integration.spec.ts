import { expect, test, type Page } from '@playwright/test'

const userEmail = process.env.E2E_USER_EMAIL || process.env.SMOKE_USER_EMAIL || 'smoke-user@example.com'
const userPassword = process.env.E2E_USER_PASSWORD || process.env.SMOKE_USER_PASSWORD || 'SmokePass123!'
const resourceKeyword = process.env.E2E_RESOURCE_KEYWORD || process.env.SMOKE_RESOURCE_KEYWORD || '集成验收资源'

async function preparePage(page: Page) {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    const url = route.request().url()
    if (url.endsWith('.css')) {
      await route.fulfill({
        status: 200,
        contentType: 'text/css',
        body: ''
      })
      return
    }

    await route.fulfill({
      status: 204,
      body: ''
    })
  })

  await page.route('**/video.mp3', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'audio/mpeg',
      body: Buffer.from('ID3')
    })
  })

  await page.addInitScript(() => {
    Object.defineProperty(window, 'alert', {
      configurable: true,
      value: () => undefined
    })

    Object.defineProperty(window, 'confirm', {
      configurable: true,
      value: () => true
    })

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => undefined,
        readText: async () => ''
      }
    })

    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: function play() {
        this.dispatchEvent(new Event('play'))
        return Promise.resolve()
      }
    })

    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: function pause() {
        this.dispatchEvent(new Event('pause'))
      }
    })
  })
}

async function openRoute(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    targetTestId => Boolean(document.querySelector(`[data-testid="${targetTestId}"]`)),
    testId,
    { timeout: 20_000 }
  )
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 20_000 })
}

async function login(page: Page) {
  await openRoute(page, '/login', 'login-page')
  await page.getByTestId('login-email').fill(userEmail)
  await page.getByTestId('login-password').fill(userPassword)

  const loginResponse = page.waitForResponse(response =>
    response.url().includes('/api/auth/login') &&
    response.request().method() === 'POST' &&
    response.status() === 200
  )

  await page.getByTestId('login-submit').click()
  await loginResponse
  await page.waitForFunction(() => Boolean(window.localStorage.getItem('auth_token')), null, {
    timeout: 20_000
  })
}

test('frontend integration flow persists through Express shared backend', async ({ page }) => {
  await preparePage(page)
  await login(page)

  const communityTitle = `playwright-integration-post-${Date.now()}`
  await openRoute(page, '/community', 'community-page')
  await page.getByTestId('community-post-title').fill(communityTitle)
  await page.getByTestId('community-post-content').fill('Playwright integration validates backend persistence.')
  await page.getByTestId('community-post-tags').fill('playwright integration')

  const communityCreateResponse = page.waitForResponse(response =>
    response.url().includes('/api/community/posts') &&
    response.request().method() === 'POST' &&
    response.status() === 201
  )

  await page.locator('[data-testid="community-post-form"] button[type="submit"]').click()
  await communityCreateResponse
  await expect(page.getByTestId('community-post-list')).toContainText(communityTitle, { timeout: 20_000 })

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('community-page')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('community-search').fill(communityTitle)
  await page.getByTestId('community-search').press('Enter')
  await expect(page.getByTestId('community-post-list')).toContainText(communityTitle, { timeout: 20_000 })

  await openRoute(page, '/resource-library', 'resource-library-page')
  await page.getByTestId('resource-hero-search').fill(resourceKeyword)
  await expect(page.getByTestId('resource-card-list')).toContainText(resourceKeyword, { timeout: 20_000 })

  const ttsText = `playwright integration tts ${Date.now()}`
  await openRoute(page, '/tts', 'tts-page')
  const initialHistoryCount = await page.getByTestId('tts-history-list').locator('li').count()
  await page.getByTestId('tts-mode-custom').click()
  await page.getByTestId('tts-custom-text').fill(ttsText)

  const ttsCreateResponse = page.waitForResponse(response =>
    response.url().includes('/api/tts/tasks') &&
    response.request().method() === 'POST' &&
    response.status() === 201
  )

  await page.getByTestId('tts-generate').click()
  await ttsCreateResponse
  await expect(page.getByTestId('tts-download')).toBeEnabled({ timeout: 20_000 })
  await expect
    .poll(async () => page.getByTestId('tts-history-list').locator('li').count(), { timeout: 20_000 })
    .toBeGreaterThan(initialHistoryCount)

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('tts-page')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('tts-history-list')).toContainText(ttsText.slice(0, 18), { timeout: 20_000 })
})
