import { test, expect } from '@playwright/test'

test.describe('Mock debrief navigation', () => {
  test('mock exam domain study tab is reachable', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /Study by domain/i }).click()
    await expect(page.getByText('Domains', { exact: true })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /Start study session/i })).toBeVisible({ timeout: 10_000 })
  })
})
