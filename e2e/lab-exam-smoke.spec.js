import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Lab Exam smoke', () => {
  test('opens Quick Lab Exam intro from hash', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/labexam')
    await expect(page.getByRole('heading', { name: /Quick Lab Exam/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Start Quick Lab Exam/i })).toBeVisible()
    await page.getByRole('button', { name: /Start Quick Lab Exam/i }).click()
    await expect(page.getByText(/Station 1\s*\/\s*\d+/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.cisco-terminal')).toBeVisible({ timeout: 15_000 })
  })
})
