import { test, expect } from '@playwright/test'
import { seedDueReviewBank } from './helpers/seedDueReviewBank.js'

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
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })
    await seedDueReviewBank(page, '3.5', [SEED_Q])
    const dueCount = await page.evaluate(async () => {
      const bank = (await window.storage.getItem('ccna_quiz_bank_v1')) || {}
      let n = 0
      const now = Date.now()
      for (const objectiveId of Object.keys(bank)) {
        for (const q of bank[objectiveId]) {
          if (q.srs && (q.attempts?.length || 0) > 0 && (q.srs.due ?? 0) <= now) n++
        }
      }
      return n
    })

    expect(dueCount).toBeGreaterThan(0)

    await page.goto('/#/review')

    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/default HSRP priority/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/of 1/i)).toBeVisible({ timeout: 10_000 })
  })
})
