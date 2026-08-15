import { test, expect } from '@playwright/test'
import { seedDueReviewBank } from './helpers/seedDueReviewBank.js'

const SEED_Q = {
  id: 'kb-focus-smoke-q1',
  question: 'What is the default HSRP priority?',
  choices: ['100', '255', '1', '50'],
  correctIndex: 0,
  explanation: 'Default HSRP priority is 100.',
  type: 'definition',
  difficulty: 'easy',
  concept: 'hsrp priority',
}

test.describe('McChoices keyboard focus', () => {
  test('Tab reaches an individual choice with a visible focus ring, and a digit-key selection moves real DOM focus to that choice', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
    })
    await seedDueReviewBank(page, '3.5', [SEED_Q])

    await page.goto('/#/review')
    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible({ timeout: 15_000 })

    const group = page.locator('.mc-choices').first()
    await expect(group).toBeVisible({ timeout: 10_000 })
    const radios = group.locator('[role="radio"]')
    await expect(radios.first()).toBeVisible()

    // Tab through everything before the group, landing on the group itself
    // used to be the only stop (no per-choice focus at all). Assert Tab
    // reaches an actual [role="radio"] button, not the group container.
    let landedOnRadio = false
    for (let i = 0; i < 25 && !landedOnRadio; i++) {
      await page.keyboard.press('Tab')
      landedOnRadio = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'radio')
    }
    expect(landedOnRadio).toBe(true)

    // A visible focus ring must actually be there (outline or box-shadow),
    // not suppressed with nothing to replace it.
    const outlineStyle = await page.evaluate(() => {
      const cs = getComputedStyle(document.activeElement)
      return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle }
    })
    expect(outlineStyle.outlineStyle).not.toBe('none')
    expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0)

    // Every quiz surface in this app reveals on selection (no separate
    // submit step for MC), so the meaningful thing to verify is that a
    // specific digit-key selection moves real DOM focus to that exact
    // choice — not that it silently stays wherever Tab first landed.
    const choiceCTexts = await radios.allTextContents()
    expect(choiceCTexts[2]).toMatch(/^[○●]?\s*C\./)
    await page.keyboard.press('3')

    const after = await page.evaluate(() => ({
      role: document.activeElement?.getAttribute('role'),
      label: document.activeElement?.getAttribute('aria-label'),
      checked: document.activeElement?.getAttribute('aria-checked'),
    }))
    expect(after.role).toBe('radio')
    expect(after.label).toMatch(/^Choice C:/)
    expect(after.checked).toBe('true')

    // And it graded correctly end to end.
    await expect(page.getByText(/Correct|Incorrect/i).first()).toBeVisible({ timeout: 5000 })
  })
})
