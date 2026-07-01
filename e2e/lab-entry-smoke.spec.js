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
    await expect(page.getByRole('button', { name: /LEARN → DO/i }).first()).toBeVisible({ timeout: 20_000 })
  })
})
