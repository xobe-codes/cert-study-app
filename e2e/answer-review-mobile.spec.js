import { test, expect } from '@playwright/test'

test.describe('AnswerReview mobile debrief (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('shows structured wrong-choice sections after an incorrect pick', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/objective/1.5/Practice')
    await page.getByRole('button', { name: /Practice \d+ question/i }).click({ timeout: 20_000 })

    let found = false
    for (let attempt = 0; attempt < 12 && !found; attempt++) {
      const stem = page.locator('[role="radiogroup"]').first()
      await expect(stem).toBeVisible({ timeout: 10_000 })

      const radios = page.getByRole('radio')
      const count = await radios.count()
      for (let c = 0; c < count; c++) {
        await radios.nth(c).click()
        const wrongHeading = page.getByText(/WHY [A-F] IS WRONG/)
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
    await expect(page.getByText(/What this choice implies/i)).toBeVisible()
    await expect(page.getByText(/Why it is wrong here/i)).toBeVisible()

    const reviewRoot = page.locator('.ccna-answer-review').first()
    await expect(reviewRoot).toBeVisible()
    const box = await reviewRoot.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(390)
  })
})
