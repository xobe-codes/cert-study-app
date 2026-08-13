import { test, expect } from '@playwright/test'

test.describe('AnswerReview mobile debrief (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('shows structured wrong-choice sections after an incorrect pick', async ({ page }) => {
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

    let found = false
    for (let attempt = 0; attempt < 12 && !found; attempt++) {
      const stem = page.locator('[role="radiogroup"]').first()
      await expect(stem).toBeVisible({ timeout: 10_000 })

      const radios = page.getByRole('radio')
      const count = await radios.count()
      for (let c = 0; c < count; c++) {
        await radios.nth(c).click()
        const wrongHeading = page.getByText(/YOUR ANSWER: [A-F]|WHY [A-F] IS WRONG/)
        if (await wrongHeading.count()) {
          found = true
          break
        }
      }
      if (!found) {
        const next = page.getByRole('button', { name: /Next question/i })
        if (await next.isVisible()) await next.click()
        else break
      }
    }

    expect(found).toBe(true)
    // A revealed question can show a structured debrief for more than one
    // wrong choice at once (accordion / multi-select), so more than one
    // heading is legitimate — assert the first is visible, not that there's
    // exactly one.
    await expect(page.getByText(/What this choice implies/i).first()).toBeVisible()
    await expect(page.getByText(/Why it is wrong here/i).first()).toBeVisible()

    const reviewRoot = page.locator('.ccna-answer-review').first()
    await expect(reviewRoot).toBeVisible()
    const box = await reviewRoot.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(390)
  })
})
