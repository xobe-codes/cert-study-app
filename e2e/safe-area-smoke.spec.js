import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'
import { simulateSafeArea, assertNoHorizontalOverflow } from './helpers/simulateSafeArea.js'

const NOTCH_INSETS = { top: 47, right: 44, bottom: 34, left: 44 }

test.describe('Safe area smoke', () => {
  test('labs hub back control clears notch on iPhone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })

    const backBtn = page.locator('.study-mode-back-btn')
    await expect(backBtn).toBeVisible()
    const box = await backBtn.boundingBox()
    expect(box).toBeTruthy()
    expect(box.y).toBeGreaterThanOrEqual(NOTCH_INSETS.top - 2)

    await assertNoHorizontalOverflow(page)
  })

  test('landscape side insets — trap drill hub fits without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/trapdrill')
    await expect(page.getByRole('heading', { name: /Trap Drill/i })).toBeVisible({ timeout: 20_000 })
    await assertNoHorizontalOverflow(page)
  })
})
