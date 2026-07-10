import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Command Hub Command Sprint', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/commandhub')
    await expect(page.getByRole('heading', { name: /Command Hub/i })).toBeVisible({ timeout: 20_000 })
  })

  test('sprint pack starts type-in session without opening a lab', async ({ page }) => {
    await page.getByRole('button', { name: 'Command Sprint' }).click()
    await expect(page.locator('[data-command-sprint="true"]')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Learn IOS commands in a short sprint/i)).toBeVisible()

    const start = page.getByRole('button', { name: /Start sprint/i }).first()
    await expect(start).toBeVisible()
    await start.click()

    await expect(page.getByText(/\d+\/\d+/)).toBeVisible({ timeout: 15_000 })
    const input = page.getByLabel('IOS command answer')
    await expect(input).toBeVisible()
    await input.fill('enable')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/Correct|Expected:/i).first()).toBeVisible({ timeout: 10_000 })

    // Still on Command Hub — no lab chrome
    await expect(page.getByRole('heading', { name: /Command Hub/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Command Sprint' })).toBeVisible()
  })
})
