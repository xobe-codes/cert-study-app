import { test, expect } from '@playwright/test'

test.describe('Automation lab smoke', () => {
  test('labs hub lists automation lab for 6.1', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/Automation/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Interpret Automation Impact/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
