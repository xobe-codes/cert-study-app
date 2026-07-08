import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('CLI abbreviation smoke', () => {
  test('terminal flags ambiguous single-letter prefix', async ({ page }) => {
    await seedOnboarding(page, { ccna_progress_v1: { '2.1': { status: 'in_progress', lastSeen: Date.now() } } })
    await page.goto('/#/objective/2.1/CLI%20Drill')
    await expect(page.getByRole('region', { name: /CLI Drill/i })).toBeVisible({ timeout: 20_000 })

    const input = page.locator('.cisco-terminal-input-row input')
    await input.fill('e')
    await input.press('Enter')
    await expect(page.getByText(/Ambiguous command/i)).toBeVisible({ timeout: 10_000 })
  })

  test('terminal accepts en as enable abbreviation', async ({ page }) => {
    await seedOnboarding(page, { ccna_progress_v1: { '2.1': { status: 'in_progress', lastSeen: Date.now() } } })
    await page.goto('/#/objective/2.1/CLI%20Drill')
    await expect(page.getByRole('region', { name: /CLI Drill/i })).toBeVisible({ timeout: 20_000 })

    const input = page.locator('.cisco-terminal-input-row input')
    await input.fill('en')
    await input.press('Enter')
    await expect(page.locator('.cisco-terminal-prompt')).toContainText('#', { timeout: 10_000 })
  })
})
