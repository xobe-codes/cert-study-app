import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'
import { seedDueReviewBank } from './helpers/seedDueReviewBank.js'

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
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
    })
    await seedDueReviewBank(page, '3.5', [SEED_Q])

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

  test('meta distractors stay pinned at bottom when shuffled', async ({ page }) => {
    const META_Q = {
      id: 'shuffle-smoke-meta-q1',
      question: 'Which are valid HSRP states?',
      choices: ['Init', 'Listen', 'Speak', 'All of the above'],
      correctIndex: 3,
      explanation: 'All listed states are valid HSRP states.',
      type: 'definition',
      difficulty: 'easy',
      concept: 'hsrp states',
    }

    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
    })
    await seedDueReviewBank(page, '3.5', [META_Q])

    await page.goto('/#/review')
    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible({ timeout: 15_000 })

    const group = page.locator('.mc-choices[data-choice-shuffle="on"]')
    await expect(group).toBeVisible({ timeout: 10_000 })

    const labels = await group.locator('[role="radio"]').allTextContents()
    expect(labels[labels.length - 1]).toMatch(/all of the above/i)

    await page.getByRole('radio', { name: /all of the above/i }).click()
    await expect(page.getByText(/Correct/i).first()).toBeVisible({ timeout: 5000 })

    const metaRadio = page.getByRole('radio', { name: /all of the above/i })
    const metaLetter = await metaRadio.locator('span').first().textContent()
    const letterMatch = metaLetter?.match(/([A-D])\./)
    expect(letterMatch).toBeTruthy()
    await expect(page.getByText(new RegExp(`CORRECT ANSWER:\\s*${letterMatch[1]}`, 'i'))).toBeVisible()
  })
})
