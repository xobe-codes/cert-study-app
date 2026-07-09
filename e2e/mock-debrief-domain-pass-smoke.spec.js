import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

async function seedWeakMockHistory(page) {
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_mock_history_v1', [{
      date: Date.now() - 60_000,
      pct: 55,
      correct: 17,
      total: 30,
      weakDomainId: 'security',
      weakDomainName: 'Security Fundamentals',
      weakObjectiveIds: ['5.5'],
    }])
    await window.storage.setItem('ccna_progress_v1', {
      '2.1': { status: 'in_progress', quizScores: [{ score: 1, total: 5 }], lastSeen: Date.now() },
      '2.2': { status: 'in_progress', quizScores: [{ score: 1, total: 5 }], lastSeen: Date.now() },
      '2.3': { status: 'in_progress', quizScores: [{ score: 1, total: 5 }], lastSeen: Date.now() },
    })
    await window.storage.setItem('ccna_domain_placement_v1', {
      access: {
        lastAttempt: { at: Date.now(), pct: 80, blueprintVersion: 2, correct: 12, total: 15, weakObjectives: [] },
        attempts: 1,
        history: [],
      },
    })
  })
}

test.describe('Mock debrief → domain pass smoke', () => {
  test('weak mock history surfaces home CTA and domain pass hub opens', async ({ page }) => {
    await seedOnboarding(page)
    await seedWeakMockHistory(page)

    await page.goto('/')
    await expect(page.getByText('WEAK AREAS', { exact: true })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/Last mock 55%/i).first()).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: /Domain Pass/i }).first().click()
    await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /Network Access/i }).first().click()
    await expect(page.getByText(/Question 1 \//i)).toBeVisible({ timeout: 30_000 })
  })

  test('domain pass hub shows set baseline first when placement missing', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/domainpass')
    await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Set baseline first/i }).first()).toBeVisible({ timeout: 10_000 })
  })
})
