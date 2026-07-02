import { test, expect } from '@playwright/test'

async function seedOnboarding(page) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_onboard_done_v1', true)
  })
}

/** Pick a wrong answer in study mode (instant reveal). */
async function pickWrongAnswer(page) {
  await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 15_000 })
  const radios = page.getByRole('radio')
  const count = await radios.count()
  for (let c = 0; c < count; c++) {
    await radios.nth(c).click()
    if (await page.getByText('✗ Incorrect').isVisible().catch(() => false)) return
    if (await page.getByText('✓ Correct!').isVisible().catch(() => false)) break
  }
}

test.describe('Mock debrief navigation', () => {
  test('domain study debrief shows Next steps and CTA navigates', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })

    await page.getByRole('button', { name: /Study by domain/i }).click()
    await expect(page.getByText('Domains', { exact: true })).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: /Network Fundamentals/i }).click()
    await page.getByRole('button', { name: /^10$/ }).click()

    const startBtn = page.getByRole('button', { name: /Start study session/i })
    await expect(startBtn).toBeEnabled({ timeout: 20_000 })
    await startBtn.click()

    await expect(page.getByText(/Question 1 \/ 10/i)).toBeVisible({ timeout: 30_000 })

    await pickWrongAnswer(page)
    await page.getByRole('button', { name: /Next/i }).click()
    await expect(page.getByText(/Question 2 \/ 10/i)).toBeVisible({ timeout: 10_000 })
    await pickWrongAnswer(page)

    await page.getByRole('button', { name: /Finish session now/i }).click()

    await expect(page.getByRole('heading', { name: /Study Results/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Next steps' })).toBeVisible()

    const studyCta = page.getByRole('button', { name: /Study Network Fundamentals/i })
    const trapCta = page.getByRole('button', { name: /Trap drill/i })
    const labCta = page.getByRole('button', { name: /Lab replay/i })

    const hasStudy = await studyCta.count()
    const hasTrap = await trapCta.count()
    const hasLab = await labCta.count()
    expect(hasStudy + hasTrap + hasLab).toBeGreaterThan(0)

    if (hasStudy) {
      await studyCta.first().click()
      await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 10_000 })
      await expect(page.getByRole('button', { name: /Start study session/i })).toBeVisible()
      return
    }

    if (hasTrap) {
      await trapCta.first().click()
      await expect(page).toHaveURL(/#\/trapdrill/, { timeout: 15_000 })
      await expect(page.getByText(/high-frequency exam traps/i)).toBeVisible({ timeout: 15_000 })
      return
    }

    await labCta.first().click()
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20_000 })
    expect(page.url()).not.toMatch(/#\/mock/)
  })

  test('mock exam domain study tab is reachable', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /Study by domain/i }).click()
    await expect(page.getByText('Domains', { exact: true })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /Start study session/i })).toBeVisible({ timeout: 10_000 })
  })
})
