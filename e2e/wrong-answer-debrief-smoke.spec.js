import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

const DEBRIEF_HEADING = /YOUR ANSWER:|WHY [A-F] IS WRONG/

test.describe('Wrong-answer debrief smoke', () => {
  test('MC practice shows structured wrong-choice debrief after incorrect pick', async ({ page }) => {
    await seedOnboarding(page, {
      ccna_progress_v1: {
        '1.5': { status: 'in_progress', quizScores: [], lastSeen: Date.now(), studySectionsViewed: true },
      },
    })

    await page.goto('/#/objective/1.5/Practice')
    await expect(page.locator('.ccna-quiz-idle')).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /(?:Practice \d+ questions?|Start practice)/i }).click({ timeout: 20_000 })

    let debriefFound = false
    for (let attempt = 0; attempt < 12 && !debriefFound; attempt++) {
      const stem = page.locator('[role="radiogroup"]').first()
      await expect(stem).toBeVisible({ timeout: 10_000 })

      const radios = page.getByRole('radio')
      const count = await radios.count()
      for (let c = 0; c < count && !debriefFound; c++) {
        await radios.nth(c).click()
        if (await page.getByText(DEBRIEF_HEADING).count()) {
          debriefFound = true
          break
        }
        if (await page.getByText(/Correct|Incorrect/i).count()) break
      }

      if (!debriefFound) {
        const next = page.getByRole('button', { name: /Next question/i })
        if (await next.isVisible()) await next.click()
        else break
      }
    }

    expect(debriefFound).toBe(true)
    await expect(page.getByText(DEBRIEF_HEADING).first()).toBeVisible()
    const review = page.locator('.ccna-answer-review').first()
    await expect(review).toBeVisible()
    await expect(review.getByText(/Why it is wrong here/i).first()).toBeVisible()
    await expect(review.getByText(/What this choice implies/i).first()).toBeVisible()
    // Family chip (Trap:) when misconception label is present
    const trapChip = review.getByRole('button', { name: /Trap:/i })
    if (await trapChip.count()) {
      await expect(trapChip.first()).toBeVisible()
    }
  })
})
