import { test, expect } from '@playwright/test'

test.describe('Trap drill smoke', () => {
  test('trap drill session loads with CKU count', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/trapdrill')
    await expect(page.getByText(/high-frequency exam traps/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/55 high-frequency exam traps/i)).toBeVisible({ timeout: 10_000 })
  })
})
