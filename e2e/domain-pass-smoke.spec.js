import { test, expect } from '@playwright/test'

async function seedOnboarding(page) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_onboard_done_v1', true)
  })
}

test.describe('Domain pass smoke', () => {
  test('hub loads, meter shows 0/6, domain session answers one question', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/domainpass')
    await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/DOMAIN PASS:\s*0\/6/i)).toBeVisible({ timeout: 10_000 })

    const firstDomain = page.getByRole('button', { name: /Network Fundamentals/i }).first()
    await expect(firstDomain).toBeVisible({ timeout: 10_000 })
    await firstDomain.click()

    await expect(page.getByText(/Question 1 \//i)).toBeVisible({ timeout: 30_000 })

    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 15_000 })
    await page.getByRole('radio').first().click()

    await expect(
      page.getByText(/✓ Correct!|✗ Incorrect/).first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})
