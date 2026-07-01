import { test, expect } from '@playwright/test'

test.describe('Study Practice smoke', () => {
  test('objective 1.5 Practice quiz shows AnswerReview after wrong pick', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/objective/1.5/Practice')
    await page.getByRole('button', { name: /Practice \d+ question/i }).click({ timeout: 20_000 })

    let reviewVisible = false
    for (let attempt = 0; attempt < 12 && !reviewVisible; attempt++) {
      await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 10_000 })

      const radios = page.getByRole('radio')
      const count = await radios.count()
      for (let c = 0; c < count; c++) {
        await radios.nth(c).click()
        const incorrect = page.getByText(/^Incorrect$/).first()
        const review = page.locator('.ccna-answer-review').first()
        if (await incorrect.isVisible().catch(() => false) && await review.isVisible().catch(() => false)) {
          reviewVisible = true
          break
        }
        const correct = page.getByText(/^Correct$/).first()
        if (await correct.isVisible().catch(() => false)) break
      }
      if (!reviewVisible) {
        const next = page.getByRole('button', { name: /Next question/i })
        if (await next.isVisible()) await next.click()
        else break
      }
    }

    expect(reviewVisible).toBe(true)
    await expect(page.locator('.ccna-answer-review').first()).toBeVisible()
  })
})
