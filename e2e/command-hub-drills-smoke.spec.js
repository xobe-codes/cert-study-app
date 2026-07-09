import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Command Hub command drills', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/commandhub')
    await expect(page.getByRole('heading', { name: /Command Hub/i })).toBeVisible({ timeout: 20_000 })
  })

  test('command drills tab starts type-in sprint', async ({ page }) => {
    await page.getByRole('button', { name: 'Command drills' }).click()
    await page.getByRole('button', { name: /Start 10-question command drill/i }).click()
    await expect(page.getByText(/Question 1 \//i)).toBeVisible({ timeout: 15_000 })

    const input = page.getByLabel('IOS command answer')
    await expect(input).toBeVisible()
    await input.fill('show ip route')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/Correct|Expected:/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
