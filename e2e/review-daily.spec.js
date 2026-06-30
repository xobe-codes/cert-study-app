import { test, expect } from '@playwright/test'

const SEED_Q = {
  question: 'What is the default HSRP priority?',
  choices: ['100', '255', '1', '50'],
  correctIndex: 0,
  explanation: 'Default HSRP priority is 100.',
  type: 'definition',
  difficulty: 'easy',
  concept: 'hsrp priority',
}

test.describe('Daily Review (#/review)', () => {
  test('loads seeded due questions after seedDueReviewBank', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')

    const dueCount = await page.evaluate(async (q) => {
      const { seedDueReviewBank, countDueQuestions } = await import('/src/quiz/srsReview.js')
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await seedDueReviewBank('3.5', [q])
      return countDueQuestions()
    }, SEED_Q)

    expect(dueCount).toBeGreaterThan(0)

    await page.goto('/#/review')

    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/default HSRP priority/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/of 1/i)).toBeVisible({ timeout: 10_000 })
  })
})
