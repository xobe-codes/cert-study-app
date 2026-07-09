import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

async function seedSecurityWeakBaseline(page) {
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_domain_placement_v1', {
      security: {
        lastAttempt: {
          at: Date.now() - 2 * 24 * 60 * 60 * 1000,
          pct: 53,
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
    window.dispatchEvent(new CustomEvent('ccna-placement-baseline-refresh'))
  })
}

test.describe('Domain learning loop smoke', () => {
  test('home domain accordion shows baseline weak row or CTA after seeded placement', async ({ page }) => {
    await seedOnboarding(page)
    await seedSecurityWeakBaseline(page)

    await page.goto('/')
    await expect(page.getByRole('group', { name: 'Course domains' })).toBeVisible({ timeout: 20_000 })

    const securityToggle = page.getByRole('button', { name: /D5 Security Fundamentals/i }).first()
    await expect(securityToggle).toBeVisible({ timeout: 10_000 })
    await securityToggle.click()

    const panel = page.locator('#domain-panel-security')
    await expect(panel).toBeVisible({ timeout: 10_000 })
    await expect(panel.getByText('FOCUS HERE')).toBeVisible({ timeout: 10_000 })
  })
})
