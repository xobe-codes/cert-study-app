import { test, expect } from '@playwright/test'
import { seedOnboarding, assertHomeLoaded } from './helpers/seedOnboarding.js'

test.describe('Home study grid — 390px', () => {
  test('study modes grid fits without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await assertHomeLoaded(page)

    const grid = page.locator('.home-study-grid')
    await expect(grid).toBeVisible()
    await expect(grid.getByRole('button', { name: /Lessons/i })).toBeVisible()
    await expect(grid.getByRole('button', { name: /Mock Exam/i })).toBeVisible()
    await expect(grid.getByRole('button', { name: /Lab Exam/i })).toBeVisible()
    await expect(grid.getByRole('button', { name: /Labs/i })).toBeVisible()

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth > doc.clientWidth + 1
    })
    expect(overflow).toBe(false)
  })
})
