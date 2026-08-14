import { test, expect } from '@playwright/test'
import { seedOnboarding, assertHomeLoaded } from './helpers/seedOnboarding.js'
import { assertA11yBasics, assertHasHeading, assertNoAxeViolations } from './helpers/a11yChecks.js'

/**
 * Accessibility smoke — a real WCAG 2A/2AA/2.1A/2.1AA sweep (axe-core via
 * @axe-core/playwright) plus a fast, explicit hand-rolled check layer, run
 * across every major study mode. See helpers/a11yChecks.js for why both
 * layers are worth keeping.
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
    await assertNoAxeViolations(page, 'home')
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
    test(`${label} — accessible names, alt text, headings, axe`, async ({ page }) => {
      await seedOnboarding(page)
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await assertHasHeading(page, label)
      await assertA11yBasics(page, label)
      await assertNoAxeViolations(page, label)
    })
  }

  test('live quiz question and wrong-answer debrief pass axe', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/objective/1.5/Practice')
    await expect(page.locator('.ccna-quiz-idle')).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /(?:Practice \d+ questions?|Start practice)/i }).click({ timeout: 20_000 })
    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 15_000 })
    await assertNoAxeViolations(page, 'quiz question')

    let debriefFound = false
    for (let i = 0; i < 12 && !debriefFound; i++) {
      const radios = page.getByRole('radio')
      const count = await radios.count()
      for (let c = 0; c < count && !debriefFound; c++) {
        await radios.nth(c).click()
        if (await page.locator('.ccna-answer-review').count()) { debriefFound = true; break }
      }
      if (!debriefFound) {
        const next = page.getByRole('button', { name: /Next question/i })
        if (await next.isVisible().catch(() => false)) await next.click()
        else break
      }
    }
    expect(debriefFound).toBe(true)
    await assertNoAxeViolations(page, 'wrong-answer debrief')
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
