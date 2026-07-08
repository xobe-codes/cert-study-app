import { test, expect } from '@playwright/test'

const SEED_Q = {
  id: 'shuffle-smoke-q1',
  question: 'What is the default HSRP priority?',
  choices: ['100', '255', '1', '50'],
  correctIndex: 0,
  explanation: 'Default HSRP priority is 100.',
  type: 'definition',
  difficulty: 'easy',
  concept: 'hsrp priority',
}

test.describe('MC choice shuffle smoke', () => {
  test('daily review shuffles MC choices and still grades correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async (q) => {
      const { seedDueReviewBank } = await import('/src/quiz/srsReview.js')
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
      await seedDueReviewBank('3.5', [q])
    }, SEED_Q)

    await page.goto('/#/review')
    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible({ timeout: 15_000 })

    const group = page.locator('.mc-choices[data-choice-shuffle="on"]')
    await expect(group).toBeVisible({ timeout: 10_000 })

    let lastOrder = null
    let sawDifferentOrder = false
    for (let i = 0; i < 5; i++) {
      if (i > 0) await page.reload()
      await expect(group).toBeVisible({ timeout: 10_000 })
      const order = await group.locator('[role="radio"]').allTextContents()
      if (lastOrder && order.join('|') !== lastOrder.join('|')) sawDifferentOrder = true
      lastOrder = order
    }
    expect(sawDifferentOrder).toBe(true)

    await page.getByRole('radio', { name: /100/ }).first().click()
    await expect(page.getByText(/Correct/i).first()).toBeVisible({ timeout: 5000 })
  })
})
