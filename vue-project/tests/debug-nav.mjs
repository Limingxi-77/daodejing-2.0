import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:5180'

const browser = await chromium.launch({ headless: true })
const page = await browser.newContext().then(c => c.newPage())

page.on('pageerror', e => console.log('  pageerror:', e.message))

async function snapshot(label) {
  const text = await page.locator('main').textContent()
  const len = text?.trim().length ?? 0
  console.log(`[${label}] url=${page.url()} main.textLen=${len}`)
}

await page.goto(BASE)
await page.waitForLoadState('networkidle')
await snapshot('home')

await page.locator('a[href="/ai-interpretation"]').first().click()
await page.waitForTimeout(2000)
await snapshot('home → AI 解读')

await page.locator('a[href="/learning-path"]').first().click()
await page.waitForTimeout(2000)
await snapshot('AI 解读 → 学习路径')

await page.locator('a[href="/"]').first().click()
await page.waitForTimeout(2000)
await snapshot('学习路径 → 首页')

await page.locator('a[href="/community"]').first().click()
await page.waitForTimeout(2000)
await snapshot('首页 → 共创社区')

await page.locator('a[href="/about"]').first().click()
await page.waitForTimeout(2000)
await snapshot('共创社区 → 关于')

await browser.close()
