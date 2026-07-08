import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

/** Simulate pull-down on the main scroll container (PointerEvent on scroll root). */
async function pullDownRefresh(page) {
  await page.locator('.route-scroll').evaluate((el) => {
    el.scrollTop = 0
    const rect = el.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y0 = rect.top + 8
    const y1 = y0 + 200
    const mk = (type, y) => new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 7,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
    })
    el.dispatchEvent(mk('pointerdown', y0))
    el.dispatchEvent(mk('pointermove', y1))
    el.dispatchEvent(mk('pointerup', y1))
  })
}

test.describe('Pull to refresh', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page, { ccna_progress_v1: { '1.1': { status: 'in_progress', lastSeen: Date.now() } } })
  })

  test('home pull-down reloads study data', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.route-shell--ptr')).toBeVisible()
    await pullDownRefresh(page)
    const host = page.locator('.pull-refresh-host')
    await expect(host).toHaveAttribute('data-ptr-phase', 'refreshing', { timeout: 8000 })
    await expect(host).toHaveAttribute('data-ptr-phase', /^(done|idle)$/, { timeout: 12_000 })
  })

  test('refresh affordance is screen-reader friendly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const host = page.locator('.pull-refresh-host')
    await expect(host).toHaveAttribute('role', 'status')
    await expect(host).toHaveAttribute('aria-live', 'polite')
    await expect(host).toContainText(/pull down to refresh/i)
  })
})
