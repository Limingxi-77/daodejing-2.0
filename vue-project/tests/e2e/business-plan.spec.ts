import { expect, test } from '@playwright/test'

test('访问 /business-plan → 7 个 section 全部可见', async ({ page }) => {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.goto('/business-plan', { waitUntil: 'domcontentloaded' })

  await expect(page.getByTestId('business-plan-page')).toBeVisible({ timeout: 10_000 })

  // 7 section
  await expect(page.getByTestId('bp-section-users')).toBeVisible()
  await expect(page.getByTestId('bp-section-market')).toBeVisible()
  await expect(page.getByTestId('bp-section-pricing')).toBeVisible()
  await expect(page.getByTestId('bp-section-economics')).toBeVisible()
  await expect(page.getByTestId('bp-section-competitors')).toBeVisible()
  await expect(page.getByTestId('bp-section-monetization')).toBeVisible()
  await expect(page.getByTestId('bp-section-roadmap')).toBeVisible()
})

test('商业蓝图关键数字大字呈现', async ({ page }) => {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.goto('/business-plan', { waitUntil: 'domcontentloaded' })

  // 关键数字 — 市场规模区段必含 ¥600 ¥250 ¥420
  const market = page.getByTestId('bp-section-market')
  await expect(market).toContainText('600')
  await expect(market).toContainText('250')
  await expect(market).toContainText('420')

  // 单元经济学 — 87% 毛利 + 5.7× LTV/CAC
  const economics = page.getByTestId('bp-section-economics')
  await expect(economics).toContainText('87')
  await expect(economics).toContainText('5.7')
})

test('About 页底部"查看商业蓝图"链接跳转 OK', async ({ page }) => {
  await page.route('https://cdnjs.cloudflare.com/**', async route => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.goto('/about', { waitUntil: 'domcontentloaded' })

  const cta = page.getByTestId('about-business-plan-cta')
  await expect(cta).toBeVisible({ timeout: 10_000 })

  await cta.locator('a').click()
  await expect(page.getByTestId('business-plan-page')).toBeVisible({ timeout: 5_000 })
})
