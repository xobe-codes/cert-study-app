import { test, expect } from '@playwright/test'

test.describe('Trap drill smoke', () => {
  test('trap drill opens domain picker instead of 180-question dump', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/trapdrill')
    await expect(page.getByRole('heading', { name: /Trap Drill/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/Pick an exam domain/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('tab', { name: /D1 Fundamentals/i })).toBeVisible()
    await page.getByRole('button', { name: /Drill all in Fundamentals/i }).click()
    await expect(page.getByText(/Question 1 \/ 18/i)).toBeVisible({ timeout: 10_000 })
  })
})
