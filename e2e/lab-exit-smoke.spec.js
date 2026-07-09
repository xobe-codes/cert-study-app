import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Lab exit smoke', () => {
  test('completed lab shows exit CTA and returns to labs hub', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })

    await page.getByRole('button', { name: /SHOW ONLY/i }).first().click()
    await page.getByRole('button', { name: /Start hands-on lab/i }).click()

    await expect(page.locator('.lab-sticky-header')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Back to Labs/i }).first()).toBeVisible()

    await page.getByRole('button', { name: /Back to Labs/i }).first().click()
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 10_000 })
  })
})
