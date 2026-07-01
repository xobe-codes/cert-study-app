import { test, expect } from '@playwright/test'

test.describe('Mock exam smoke', () => {
  test('intro loads and start button is available', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Start Mock Exam/i })).toBeVisible({ timeout: 20_000 })
  })
})
