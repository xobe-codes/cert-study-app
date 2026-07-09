import { test, expect } from '@playwright/test'

async function seedOnboarding(page) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_onboard_done_v1', true)
  })
}

test.describe('Domain pass focus smoke', () => {
  test('focus picker opens, selects objective, starts session', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/domainpass')
    await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })

    const focusBtn = page.getByRole('button', { name: /Focus topics/i }).first()
    await expect(focusBtn).toBeVisible({ timeout: 20_000 })
    await focusBtn.click()
    await expect(page.getByRole('heading', { name: /— Focus$/ })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('FOCUS PASS', { exact: true })).toBeVisible()

    const objective = page.getByRole('checkbox', { name: 'Select 1.1', exact: true })
    await expect(objective).toBeVisible()
    await objective.check()

    await page.getByRole('button', { name: /Start focus pass/i }).click()

    await expect(page.getByText(/Focus pass · 1\.1/i)).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(/Question 1 \//i)).toBeVisible({ timeout: 30_000 })

    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 15_000 })
    await page.getByRole('radio').first().click()
    await expect(page.getByText(/✓ Correct!|✗ Incorrect/).first()).toBeVisible({ timeout: 10_000 })
  })
})
