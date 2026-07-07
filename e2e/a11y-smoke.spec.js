import { test, expect } from '@playwright/test'
import { seedOnboarding, assertHomeLoaded } from './helpers/seedOnboarding.js'

/**
 * Accessibility smoke — verifies baseline a11y affordances that the audit's
 * mobile/accessibility score depends on. Not a full WCAG audit, but catches
 * regressions in landmarks, accessible names, language, and image alt text.
 */
test.describe('Accessibility smoke', () => {
  test('document declares a language', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang, 'html[lang] must be set for screen readers').toBeTruthy()
  })

  test('home exposes a heading and named navigation controls', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await assertHomeLoaded(page)

    const headingCount = await page.getByRole('heading').count()
    expect(headingCount, 'home should expose at least one heading').toBeGreaterThan(0)

    // Every rendered button must have an accessible name (text or aria-label).
    const buttons = page.getByRole('button')
    const total = await buttons.count()
    expect(total).toBeGreaterThan(0)
    let unnamed = 0
    for (let i = 0; i < total; i++) {
      const btn = buttons.nth(i)
      const name = (await btn.getAttribute('aria-label')) || (await btn.innerText()).trim()
      if (!name) unnamed++
    }
    expect(unnamed, 'all buttons should have an accessible name').toBe(0)
  })

  test('images carry alt text on key routes', async ({ page }) => {
    await seedOnboarding(page)
    for (const route of ['/', '/#/mock']) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const imgs = page.locator('img')
      const count = await imgs.count()
      for (let i = 0; i < count; i++) {
        const alt = await imgs.nth(i).getAttribute('alt')
        expect(alt, `img on ${route} must define alt (empty allowed for decorative)`).not.toBeNull()
      }
    }
  })
})
