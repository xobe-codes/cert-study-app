import { test, expect } from '@playwright/test'

test.describe('Study Practice smoke', () => {
  test('session size field allows clear-and-retype before practice', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_progress_v1', {
        '1.5': { status: 'in_progress', quizScores: [], lastSeen: Date.now(), studySectionsViewed: true },
      })
    })

    await page.goto('/#/objective/1.5/Practice')
    await expect(page.locator('.ccna-quiz-idle')).toBeVisible({ timeout: 20_000 })

    const input = page.locator('#quiz-session-size-1\\.5')
    await expect(input).toBeVisible()
    await input.click()
    await input.fill('')
    await expect(input).toHaveValue('')
    await expect(page.getByRole('button', { name: /Start practice/i })).toBeDisabled()

    await input.fill('3')
    await expect(input).toHaveValue('3')
    await expect(page.getByRole('button', { name: /Start practice/i })).toBeEnabled()

    await input.blur()
    await expect(input).toHaveValue('3')
  })

  test('objective 1.5 Practice quiz shows AnswerReview after wrong pick', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_progress_v1', {
        '1.5': { status: 'in_progress', quizScores: [], lastSeen: Date.now(), studySectionsViewed: true },
      })
    })

    await page.goto('/#/objective/1.5/Practice')
    await expect(page.locator('.ccna-quiz-idle')).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /(?:Practice \d+ questions?|Start practice)/i }).click({ timeout: 20_000 })

    let reviewVisible = false
    for (let attempt = 0; attempt < 12 && !reviewVisible; attempt++) {
      await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 10_000 })

      const radios = page.getByRole('radio')
      const count = await radios.count()
      for (let c = 0; c < count; c++) {
        await radios.nth(c).click()
        const wrongHeading = page.getByText(/WHY [A-F] IS WRONG/)
        const review = page.locator('.ccna-answer-review').first()
        if (await wrongHeading.count() && await review.isVisible().catch(() => false)) {
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
    await expect(page.getByText(/What this choice implies/i)).toBeVisible()
  })
})
