import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Diagram iPad touch', () => {
  test.use({ viewport: { width: 834, height: 1194 } })

  test('expandable diagram opens full modal on tap', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/objective/1.2/Study')
    await expect(page.getByText(/Campus tier|tier/i).first()).toBeVisible({ timeout: 20_000 })

    const expandBtn = page.locator('.curated-diagram-expand-btn')
    await expect(expandBtn).toBeVisible({ timeout: 15_000 })
    await expandBtn.click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /Campus tier/i })).toBeVisible()
    await page.getByRole('button', { name: /Close diagram/i }).click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 })
  })
})
