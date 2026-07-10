import { test, expect } from '@playwright/test'
import { seedDueReviewBank } from './helpers/seedDueReviewBank.js'

const MULTI_Q = {
  id: 'e2e-multi-bum',
  type: 'multi',
  difficulty: 'medium',
  skill: 'design',
  concept: 'frame flooding',
  question: 'Which frame types does a switch flood? (Choose 3.) Select all that apply.',
  choices: [
    'Unknown unicast',
    'Broadcast',
    'Multicast',
    'Known unicast with a CAM hit',
  ],
  correctIndexes: [0, 1, 2],
  explanation: 'BUM traffic is flooded; known unicast is not.',
  answerReview: {
    correct: { choiceIndex: 0, explanation: 'BUM traffic is flooded.' },
    incorrect: [
      {
        choiceIndex: 3,
        explanation: 'Known unicast is forwarded to one port.',
        misconceptionTested: 'Treating known unicast like BUM',
      },
    ],
  },
}

test.describe('Multi-select smoke', () => {
  test('daily review grades select-all exact set', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
    })
    await seedDueReviewBank(page, '1.5', [MULTI_Q])

    await page.goto('/#/review')
    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible({ timeout: 15_000 })

    const group = page.locator('.multi-choices[data-multi-select="true"]')
    await expect(group).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Select all that apply/i).first()).toBeVisible()

    const boxes = group.locator('[role="checkbox"]')
    await expect(boxes).toHaveCount(4)

    // Partial set → incorrect
    await boxes.filter({ hasText: 'Unknown unicast' }).click()
    await boxes.filter({ hasText: 'Broadcast' }).click()
    await page.getByRole('button', { name: /Check answers/i }).click()
    await expect(page.getByText(/^Incorrect$/i)).toBeVisible({ timeout: 10_000 })
  })
})
