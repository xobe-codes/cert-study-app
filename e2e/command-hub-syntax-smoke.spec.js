import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Command Hub syntax coach', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/commandhub')
    await expect(page.getByRole('heading', { name: /Command Hub/i })).toBeVisible({ timeout: 20_000 })
  })

  test('syntax coach tab shows mnemonics and starts quiz', async ({ page }) => {
    await page.getByRole('button', { name: 'Syntax coach' }).click()
    await expect(page.getByRole('button', { name: 'Tips & mnemonics' })).toBeVisible()
    await expect(page.getByText(/Mode ladder/i)).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: 'Syntax quiz' }).click()
    await page.getByRole('button', { name: /Start 10-question syntax sprint/i }).click()
    await expect(page.getByText(/Question 1 \//i)).toBeVisible({ timeout: 15_000 })

    const input = page.getByPlaceholder('Type IOS command…')
    if (await input.isVisible().catch(() => false)) {
      await input.fill('show ip route')
      await page.getByRole('button', { name: 'Check' }).click()
      await expect(page.getByText(/Correct|Expected:/i).first()).toBeVisible({ timeout: 10_000 })
    } else {
      await page.getByRole('radio').first().click()
      await page.getByRole('button', { name: 'Check' }).click()
      await expect(page.getByText(/Correct|Expected:/i).first()).toBeVisible({ timeout: 10_000 })
    }
  })
})
