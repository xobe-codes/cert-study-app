import { test, expect } from '@playwright/test'

async function seedOnboarding(page) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_onboard_done_v1', true)
  })
}

test.describe('Ship smoke — site not broken', () => {
  test('home shell loads (no blank screen)', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/')
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('heading', { name: /CCNA 200-301/i })).toBeVisible({ timeout: 15_000 })
    const bodyLen = await page.evaluate(() => (document.body?.innerText || '').trim().length)
    expect(bodyLen).toBeGreaterThan(40)
  })

  test('critical hash routes render headings', async ({ page }) => {
    await seedOnboarding(page)
    const routes = [
      { hash: '/#/domainpass', heading: /Domain Pass/i },
      { hash: '/#/mock', heading: /Mock Exam/i },
      { hash: '/#/labs', heading: /Labs/i },
    ]
    for (const { hash, heading } of routes) {
      await page.goto(hash)
      await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 20_000 })
    }
  })
})
