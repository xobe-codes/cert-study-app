import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

async function seedSecurityAdaptivePlacement(page) {
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_domain_placement_v1', {
      security: {
        lastAttempt: {
          at: Date.now() - 3 * 24 * 60 * 60 * 1000,
          pct: 53,
          trapPct: 40,
          correct: 8,
          total: 15,
          blueprintVersion: 1,
          byObjective: {
            '5.1': { correct: 0, total: 1 },
            '5.2': { correct: 1, total: 1 },
            '5.3': { correct: 0, total: 2 },
            '5.4': { correct: 1, total: 1 },
            '5.5': { correct: 0, total: 3 },
            '5.6': { correct: 1, total: 2 },
            '5.7': { correct: 1, total: 1 },
            '5.8': { correct: 1, total: 1 },
            '5.9': { correct: 1, total: 1 },
            '5.10': { correct: 1, total: 1 },
            '5.11': { correct: 1, total: 1 },
          },
          weakObjectives: ['5.1', '5.3', '5.5'],
        },
        attempts: 1,
        history: [],
      },
    })
  })
}

async function completePlacementSession(page) {
  for (let q = 0; q < 15; q++) {
    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 30_000 })
    const radios = page.getByRole('radio')
    await (q === 0 ? radios.nth(1) : radios.first()).click()
    await expect(page.getByText(/Correct|Incorrect/).first()).toBeVisible({ timeout: 10_000 })
    if (q < 14) await page.getByRole('button', { name: 'Next' }).click()
  }
  await page.getByRole('button', { name: /See results/i }).click()
}

async function seedFundamentalsStalePlacement(page) {
  await page.evaluate(async () => {
    const v2 = { at: Date.now(), pct: 85, blueprintVersion: 2, correct: 12, total: 15 }
    await window.storage.setItem('ccna_domain_placement_v1', {
      fundamentals: {
        lastAttempt: {
          at: Date.now() - 5 * 24 * 60 * 60 * 1000,
          pct: 72,
          correct: 11,
          total: 15,
          blueprintVersion: 1,
          byObjective: {
            '1.1': { correct: 1, total: 2 },
            '1.2': { correct: 1, total: 2 },
            '1.3': { correct: 1, total: 2 },
            '1.4': { correct: 1, total: 2 },
            '1.5': { correct: 1, total: 2 },
            '1.6': { correct: 1, total: 2 },
            '1.7': { correct: 1, total: 2 },
            '1.8': { correct: 1, total: 1 },
          },
          weakObjectives: ['1.2', '1.5'],
        },
        attempts: 1,
        history: [],
      },
      access: { lastAttempt: { ...v2 }, attempts: 1 },
      connectivity: { lastAttempt: { ...v2 }, attempts: 1 },
      services: { lastAttempt: { ...v2 }, attempts: 1 },
      security: { lastAttempt: { ...v2 }, attempts: 1 },
      automation: { lastAttempt: { ...v2 }, attempts: 1 },
    })
  })
}

test.describe('Domain placement smoke', () => {
  test('hub lists 6 domains and session answers one question', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/domainplacement')
    await expect(page.getByRole('heading', { name: /Domain baseline/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/Baselines recorded:/i)).toBeVisible({ timeout: 10_000 })

    const securityCard = page.getByRole('button', { name: /Security Fundamentals/i }).first()
    await expect(securityCard).toBeVisible({ timeout: 10_000 })
    await securityCard.click()

    await expect(page.getByText(/Placement/i).first()).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 15_000 })
    await page.getByRole('radio').first().click()

    await expect(
      page.getByText(/Correct|Incorrect/).first(),
    ).toBeVisible({ timeout: 10_000 })
  })

  test('adaptive retake front-loads weak objectives from seeded storage', async ({ page }) => {
    await seedOnboarding(page)
    await seedSecurityAdaptivePlacement(page)

    await page.goto('/#/domainplacement')
    const securityCard = page.getByRole('button', { name: /Security Fundamentals/i }).first()
    await expect(securityCard).toBeVisible({ timeout: 20_000 })
    await securityCard.click()

    await expect(page.getByText(/sprint \(weak \+ unsampled/i)).toBeVisible({ timeout: 30_000 })
  })

  test('home Check Level count refreshes immediately after placement save event', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/')
    await expect(page.getByRole('button', { name: /Baseline \(0\/6 · 0 tested out\)/i })).toBeVisible({ timeout: 20_000 })

    await page.evaluate(async () => {
      await window.storage.setItem('ccna_domain_placement_v1', {
        security: {
          lastAttempt: {
            at: Date.now(),
            pct: 80,
            correct: 12,
            total: 15,
            byObjective: { '5.1': { correct: 1, total: 1 } },
            weakObjectives: [],
          },
          attempts: 1,
          history: [],
        },
      })
      window.dispatchEvent(new CustomEvent('ccna-placement-baseline-refresh'))
    })

    await expect(page.getByRole('button', { name: /Baseline \(1\/6/i })).toBeVisible({ timeout: 10_000 })
  })

  test('debrief shows per-objective breakdown after full session', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/domainplacement')
    await page.getByRole('button', { name: /Security Fundamentals/i }).first().click()
    await completePlacementSession(page)

    await expect(page.getByText(/Baseline map/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Study →/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('full baseline debrief maps every subsection with no sprint skips', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/domainplacement')
    await page.getByRole('button', { name: /Network Fundamentals/i }).first().click()
    await expect(page.getByText(/every subsection sampled once/i)).toBeVisible({ timeout: 30_000 })
    await completePlacementSession(page)

    await expect(page.getByText(/Baseline map/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Skipped in sprint/i)).toHaveCount(0)
    await expect(page.getByText(/Not in this check/i)).toHaveCount(0)
    for (const id of ['1.1', '1.9', '1.12']) {
      await expect(page.getByText(id, { exact: true }).first()).toBeVisible()
    }
  })

  test('stale v1 baseline shows Full remap on home domain panel', async ({ page }) => {
    await seedOnboarding(page)
    await seedFundamentalsStalePlacement(page)

    await page.goto('/')
    await expect(page.getByText(/UPDATE YOUR BASELINE MAP/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Full remap Network Fundamentals/i })).toBeVisible()
  })

  test('study next surfaces full remap for stale fundamentals baseline', async ({ page }) => {
    await seedOnboarding(page)
    await seedFundamentalsStalePlacement(page)

    await page.goto('/')
    await expect(page.getByRole('button', { name: /STUDY NEXT/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/Full remap — Network Fundamentals/i)).toBeVisible()
  })
})
