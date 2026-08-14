import { test, expect } from '@playwright/test'
import { seedOnboarding, assertHomeLoaded } from './helpers/seedOnboarding.js'
import { assertA11yBasics, assertHasHeading } from './helpers/a11yChecks.js'

/**
 * Accessibility smoke — verifies baseline a11y affordances that the audit's
 * mobile/accessibility score depends on. Not a full WCAG audit (that needs a
 * real engine like axe-core, which isn't currently a project dependency —
 * ask before adding it), but a systematic sweep of accessible-name/alt-text/
 * heading coverage across every major study mode, not just Home.
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
    await assertHasHeading(page, 'home')
    const { buttonCount } = await assertA11yBasics(page, 'home')
    expect(buttonCount).toBeGreaterThan(0)
  })

  // One route per major study mode reachable directly via hash without extra
  // setup (mock interview/tutor need a live AI session; lab detail/domain
  // placement need a selected instance — covered indirectly via Home/Labs).
  const ROUTES = [
    ['/#/mock', 'Mock Exam'],
    ['/#/metrics', 'Metrics'],
    ['/#/stats', 'Stats'],
    ['/#/missed', 'Missed Review'],
    ['/#/labs', 'Labs Hub'],
    ['/#/focus', 'Weak Areas'],
    ['/#/topicfocus', 'Topic Focus'],
    ['/#/studylens', 'Study Lens'],
    ['/#/examtraps', 'Exam Traps'],
    ['/#/trapdrill', 'Trap Drill'],
    ['/#/domainpass', 'Domain Pass'],
    ['/#/termshub', 'Terms Hub'],
    ['/#/subnet', 'Subnetting'],
    ['/#/routing', 'Routing Decoder'],
    ['/#/extrastudy', 'Extra Study'],
  ]

  for (const [route, label] of ROUTES) {
    test(`${label} — accessible names, alt text, headings`, async ({ page }) => {
      await seedOnboarding(page)
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await assertHasHeading(page, label)
      await assertA11yBasics(page, label)
    })
  }

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
