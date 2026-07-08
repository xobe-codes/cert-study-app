import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

/** Core study modes from the home grid — label regex + expected heading. */
const STUDY_MODES = [
  { label: /^Mock Exam$/i, heading: /Mock Exam/i },
  { label: /^Domain Pass/i, heading: /Domain Pass/i },
  { label: /^Weak Areas$/i, heading: /Weak Areas/i },
  { label: /^Topic Focus$/i, heading: /Topic Focus/i },
  { label: /^Command Hub$/i, heading: /Command Hub/i },
  { label: /^Study Lens$/i, heading: /Study Lens/i },
  { label: /^Exam Traps$/i, heading: /Exam Trap Drill/i },
  { label: /^Labs$/i, heading: /Hands-on Labs/i },
  { label: /^Subnetting$/i, heading: /Subnet/i },
  { label: /^Routing$/i, heading: /Routing/i },
]

test.describe('Study mode navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page, { ccna_progress_v1: { '1.1': { status: 'in_progress', lastSeen: Date.now() } } })
  })

  for (const mode of STUDY_MODES) {
    test(`home → ${mode.label} → back reaches home`, async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: mode.label }).first().click()
      await expect(page.getByRole('heading', { name: mode.heading }).first()).toBeVisible({ timeout: 25_000 })
      const bottomBack = page.getByRole('navigation', { name: /main navigation/i }).getByRole('button', { name: 'Back', exact: true })
      if (await bottomBack.isVisible().catch(() => false)) {
        await bottomBack.click()
      } else if (await page.locator('.study-mode-back-btn').isVisible().catch(() => false)) {
        await page.locator('.study-mode-back-btn').click()
      } else {
        await page.getByRole('button', { name: /^‹ Back$/ }).first().click()
      }
      await expect(page.getByRole('heading', { name: /CCNA 200-301/i })).toBeVisible({ timeout: 15_000 })
    })
  }

  test('hash deep link opens study mode without progress gate', async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/studylens')
    await expect(page.getByRole('heading', { name: /Study Lens/i })).toBeVisible({ timeout: 20_000 })
  })

  test('bottom nav Back returns from labs to home', async ({ page }) => {
    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('navigation', { name: /main navigation/i }).getByRole('button', { name: 'Back', exact: true }).click()
    await expect(page.getByRole('heading', { name: /CCNA 200-301/i })).toBeVisible({ timeout: 15_000 })
  })
})
