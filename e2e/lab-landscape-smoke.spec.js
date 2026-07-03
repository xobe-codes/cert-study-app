import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Lab landscape smoke', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('iPhone landscape shows fluid Cisco terminal in lab practice', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /LEARN → DO/i }).first().click()
    await expect(page.getByRole('button', { name: /Start hands-on lab/i })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /Start hands-on lab/i }).click()
    await expect(page.locator('.cisco-terminal--fluid')).toBeVisible({ timeout: 20_000 })
  })
})
