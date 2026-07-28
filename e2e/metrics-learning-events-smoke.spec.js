import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Unified learning metrics smoke', () => {
  test('reconciles question, lab, and lesson events without fabricated values', async ({ page }) => {
    await seedOnboarding(page, {
      ccna_events_v1: [
        { eventId: 'q1', schemaVersion: 2, type: 'user_answered_question', at: 1, surface: 'practice', questionId: 'q1', objectiveId: '3.1', correct: true },
        { eventId: 'lab-start', schemaVersion: 2, type: 'user_started_lab', at: 2, labId: 'LAB-31-ROUTE-INTERPRET', objectiveId: '3.1' },
        { eventId: 'lab-done', schemaVersion: 2, type: 'user_completed_lab', at: 3, labId: 'LAB-31-ROUTE-INTERPRET', objectiveId: '3.1' },
        { eventId: 'lesson', schemaVersion: 2, type: 'user_viewed_lesson_section', at: 4, objectiveId: '3.1', lessonAnchor: 'lesson-3-1-concept-cku-route' },
      ],
    })

    await page.goto('/#/metrics')
    await expect(page.getByRole('heading', { name: /Learner Metrics/i })).toBeVisible({ timeout: 20_000 })
    const section = page.getByRole('button', { name: 'QUESTION + LAB ACTIVITY' }).locator('..')
    await expect(section.getByText('100%', { exact: true }).first()).toBeVisible()
    await expect(section.getByText(/1 lesson anchors viewed/i)).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
})
