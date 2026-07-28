import { test, expect } from '@playwright/test'

test.describe('Lab entry smoke', () => {
  test('labs hub opens and shows at least one lab card', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /SHOW ONLY/i }).first()).toBeVisible({ timeout: 20_000 })
  })

  for (const width of [320, 768, 1440]) {
    test(`lab practice remains usable without horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 320 ? 720 : 900 })
      await page.goto('/')
      await page.waitForFunction(() => typeof window.storage?.setItem === 'function')
      await page.evaluate(async () => {
        await window.storage.setItem('ccna_onboard_done_v1', true)
      })

      await page.goto('/#/labs')
      await page.getByRole('button', { name: /SHOW ONLY/i }).first().click()
      await page.getByRole('button', { name: /Start hands-on lab/i }).click()

      const taskControl = page.getByRole('button', { name: /^Task 1:/ })
      await expect(taskControl).toBeVisible({ timeout: 20_000 })
      expect(await taskControl.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    })
  }
})
