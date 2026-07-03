import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'
import { STORAGE_KEYS } from '../src/storageKeys.js'

test.describe('Tutor premium smoke', () => {
  test('premium tutor shell loads with library-backed copy', async ({ page }) => {
    await seedOnboarding(page, { [STORAGE_KEYS.premiumUnlocked]: true })
    await page.reload({ waitUntil: 'networkidle' })
    await page.goto('/#/tutor')
    await expect(page.getByRole('heading', { name: /AI Tutor Chat/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/bundled study library/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Ask the tutor/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Read aloud/i })).toBeVisible()
  })
})
