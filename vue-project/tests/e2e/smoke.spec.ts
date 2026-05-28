import { expect, test, type Page } from '@playwright/test'

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

test('auth routes render expected forms', async ({ page }) => {
  await preparePage(page)

  await openRoute(page, '/login', 'login-page')
  await page.getByTestId('login-email').fill('user@example.com')
  await page.getByTestId('login-password').fill('StrongPass123!')
  await page.getByTestId('login-to-register').click()
  await page.waitForFunction(() => window.location.pathname === '/register', null, {
    timeout: 15_000
  })

  await expect(page.getByTestId('register-page')).toBeVisible({ timeout: 15_000 })
  await page.getByTestId('register-name').fill('playwright-user')
  await page.getByTestId('register-email').fill('playwright@example.com')
  await page.getByTestId('register-password').fill('StrongPass123!')
  await page.getByTestId('register-confirm-password').fill('StrongPass123!')
  await expect(page.getByTestId('register-submit')).toBeEnabled()
})

test('community page supports local compose fallback', async ({ page }) => {
  await preparePage(page)

  await openRoute(page, '/community', 'community-page')

  const posts = page.getByTestId('community-post-item')
  const postList = page.getByTestId('community-post-list')
  await expect(posts.first()).toBeVisible({ timeout: 15_000 })
  const initialCount = await posts.count()
  const title = `playwright-community-post-${Date.now()}`

  await page.getByTestId('community-post-title').fill(title)
  await page.getByTestId('community-post-content').fill('playwright smoke content')
  await page.getByTestId('community-post-tags').fill('playwright smoke')
  await page.locator('[data-testid="community-post-form"] button[type="submit"]').click()

  await expect(page.getByTestId('community-post-title')).toHaveValue('', { timeout: 15_000 })
  await expect(postList).toContainText(title, { timeout: 15_000 })
  await expect
    .poll(async () => posts.count(), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(initialCount + 1)
  await expect(posts.first()).toContainText(title, { timeout: 15_000 })

  await page.getByTestId('community-search').fill(title)
  await expect(posts).toHaveCount(1, { timeout: 15_000 })
  await expect(posts.first()).toContainText(title)
})

test('resource library filters local data', async ({ page }) => {
  await preparePage(page)

  await openRoute(page, '/resource-library', 'resource-library-page')
  await expect(page.getByTestId('resource-card').first()).toBeVisible({ timeout: 15_000 })

  await page.getByTestId('resource-hero-search').fill('王弼')
  await expect(page.getByTestId('resource-card-list')).toContainText('王弼', { timeout: 15_000 })

  await page.getByTestId('resource-sort').selectOption('downloads')
  await expect(page.getByTestId('resource-card').first()).toBeVisible({ timeout: 15_000 })
})

test('tts page supports custom text generation smoke flow', async ({ page }) => {
  await preparePage(page)

  // Mock TTS task creation API
  await page.route('**/api/tts/tasks', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, task: { id: 'mock-task-id', status: 'pending' } })
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      })
    }
  })

  // Mock TTS synthesize API - return a small valid audio blob
  await page.route('**/api/tts/synthesize', async route => {
    // Generate a minimal WAV file header (44 bytes)
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // file size - 8
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6D, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // chunk size
      0x01, 0x00,             // PCM format
      0x01, 0x00,             // mono
      0x44, 0xAC, 0x00, 0x00, // 44100 Hz
      0x88, 0x58, 0x01, 0x00, // byte rate
      0x02, 0x00,             // block align
      0x10, 0x00,             // bits per sample
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // data size (0)
    ])
    await route.fulfill({
      status: 200,
      contentType: 'audio/wav',
      body: wavHeader
    })
  })

  await openRoute(page, '/tts', 'tts-page')

  await page.getByTestId('tts-mode-custom').click()
  await page.getByTestId('tts-custom-text').fill('Playwright TTS smoke text')
  await expect(page.getByTestId('tts-display-text')).toHaveValue('Playwright TTS smoke text')

  await page.getByTestId('tts-generate').click()
  await expect(page.getByTestId('tts-download')).toBeEnabled({ timeout: 15_000 })
  await expect(page.getByTestId('tts-history-list').locator('li')).toHaveCount(1, { timeout: 15_000 })
})
