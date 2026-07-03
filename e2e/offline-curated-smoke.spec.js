import { test, expect } from '@playwright/test'
import { seedOnboarding, assertHomeLoaded } from './helpers/seedOnboarding.js'

test.describe('Offline curated smoke', () => {
  test('SPA routes home ↔ mock while offline after initial load', async ({ page, context }) => {
    await seedOnboarding(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await assertHomeLoaded(page)

    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })

    await context.setOffline(true)

    await page.evaluate(() => { window.location.hash = '' })
    await assertHomeLoaded(page)

    await page.evaluate(() => { window.location.hash = '#/mock' })
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })
  })
})
