import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Diagram iPhone smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('expandable topology opens full modal with SVG devices', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/objective/1.2/Study')
    await expect(page.getByText(/Campus tier|tier/i).first()).toBeVisible({ timeout: 20_000 })

    const expandBtn = page.locator('.curated-diagram-expand-btn')
    await expect(expandBtn).toBeVisible({ timeout: 15_000 })
    await expandBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /Campus tier/i })).toBeVisible()
    await expect(dialog.locator('.curated-diagram-svg')).toBeVisible()
    await expect(dialog.locator('.curated-diagram-zoom-canvas')).toBeVisible()
    await expect(dialog.getByText(/Pinch to zoom/i)).toBeVisible()

    await page.getByRole('button', { name: /Close diagram/i }).click()
    await expect(dialog).toBeHidden({ timeout: 10_000 })
  })
})

test.describe('Diagram iPhone landscape smoke', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('expandable topology opens zoom canvas in landscape', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/objective/1.2/Study')
    await expect(page.getByText(/Campus tier|tier/i).first()).toBeVisible({ timeout: 20_000 })

    const expandBtn = page.locator('.curated-diagram-expand-btn')
    await expect(expandBtn).toBeVisible({ timeout: 15_000 })
    await expandBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10_000 })
    await expect(dialog.locator('.curated-diagram-zoom-canvas')).toBeVisible()
    await expect(dialog.getByText(/Pinch to zoom/i)).toBeVisible()
    await page.getByRole('button', { name: /Close diagram/i }).click()
    await expect(dialog).toBeHidden({ timeout: 10_000 })
  })
})
