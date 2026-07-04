import { test, expect } from '@playwright/test'

async function seedOnboarding(page) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async () => {
    await window.storage.setItem('ccna_onboard_done_v1', true)
  })
}

test.describe('Domain placement smoke', () => {
  test('hub lists 6 domains and session answers one question', async ({ page }) => {
    await seedOnboarding(page)

    await page.goto('/#/domainplacement')
    await expect(page.getByRole('heading', { name: /Domain Placement/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/Baselines recorded:/i)).toBeVisible({ timeout: 10_000 })

    const securityCard = page.getByRole('button', { name: /Security Fundamentals/i }).first()
    await expect(securityCard).toBeVisible({ timeout: 10_000 })
    await securityCard.click()

    await expect(page.getByText(/Placement/i).first()).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 15_000 })
    await page.getByRole('radio').first().click()

    await expect(
      page.getByText(/Correct|Incorrect/).first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})
