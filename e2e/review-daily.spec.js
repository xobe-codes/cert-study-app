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

    await page.evaluate(async (q) => {
      const { seedDueReviewBank } = await import('/src/quiz/srsReview.js')
      await seedDueReviewBank('3.5', [q])
      await window.storage.setItem('ccna_onboard_done_v1', true)
    }, SEED_Q)

    await page.goto('/#/review')

    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Question 1|Gathering your reviews/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/default HSRP priority/i)).toBeVisible({ timeout: 10_000 })
  })
})
