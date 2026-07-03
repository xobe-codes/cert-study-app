import { test, expect } from '@playwright/test'
import { seedOnboarding, assertHomeLoaded } from './helpers/seedOnboarding.js'

test.describe('Offline preview smoke', () => {
  test('built shell loads from preview server', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await assertHomeLoaded(page)
    await expect(page.locator('.app-shell')).toBeVisible()
  })
})
