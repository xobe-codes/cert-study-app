import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

/** Simulate left-edge swipe on the gesture surface (route shell or scroll). */
async function edgeSwipeBack(page) {
  const target = page.locator('.route-shell--edge-back, .route-scroll--edge-shift').first()
  await expect(target).toBeVisible({ timeout: 20_000 })
  await target.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    const x0 = rect.left + 12
    const x1 = x0 + 120
    const y = rect.top + 80
    const mk = (type, x) => new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 9,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
    })
    el.dispatchEvent(mk('pointerdown', x0))
    el.dispatchEvent(mk('pointermove', x1))
    el.dispatchEvent(mk('pointerup', x1))
  })
}

test.describe('Mobile gestures smoke', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page, { ccna_progress_v1: { '1.1': { status: 'in_progress', lastSeen: Date.now() } } })
  })

  test('edge swipe back from objective returns to home', async ({ page }) => {
    await page.goto('/#/objective/1.1/Study')
    await expect(page.getByRole('tab', { name: /Study/i })).toBeVisible({ timeout: 20_000 })
    await edgeSwipeBack(page)
    await expect(page.getByRole('heading', { name: /CCNA 200-301/i })).toBeVisible({ timeout: 10_000 })
  })

  test('edge swipe on home does not navigate away', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('.route-shell').first().evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const x0 = rect.left + 12
      const x1 = x0 + 120
      const y = rect.top + 80
      const mk = (type, x) => new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerId: 9,
        pointerType: 'touch',
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
      })
      el.dispatchEvent(mk('pointerdown', x0))
      el.dispatchEvent(mk('pointermove', x1))
      el.dispatchEvent(mk('pointerup', x1))
    })
    await expect(page.getByRole('heading', { name: /CCNA 200-301/i })).toBeVisible()
    await expect(page).toHaveURL(/\/(#\/)?$/)
  })

  test('home has pull-to-refresh host', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.route-shell--ptr')).toBeVisible()
    await expect(page.locator('.pull-refresh-host')).toHaveAttribute('role', 'status')
  })
})
