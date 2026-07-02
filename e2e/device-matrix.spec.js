import { test, expect } from '@playwright/test'
import { seedOnboarding, assertHomeLoaded } from './helpers/seedOnboarding.js'

const VIEWPORTS = [
  { label: 'iPhone 13 portrait', width: 390, height: 844 },
  { label: 'iPad Pro portrait', width: 834, height: 1194 },
  { label: 'Pixel 5 landscape', width: 844, height: 390 },
  { label: 'Desktop-ish', width: 1280, height: 800 },
]

test.describe('Device matrix — home screen', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.label} loads home with content`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await seedOnboarding(page)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await assertHomeLoaded(page)
    })
  }

  test('iPhone 13 — Practice path reachable via mock heading', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await assertHomeLoaded(page)

    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })
  })
})
