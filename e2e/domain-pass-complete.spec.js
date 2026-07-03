import { test, expect } from '@playwright/test'

const DOMAIN_IDS = ['fundamentals', 'access', 'connectivity', 'services', 'security', 'automation']

async function seedAllDomainsPassed(page) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async (ids) => {
    const records = {}
    for (const id of ids) {
      records[id] = { passed: true, bestPct: 85, lastAt: Date.now(), attempts: 1 }
    }
    await window.storage.setItem('ccna_onboard_done_v1', true)
    await window.storage.setItem('ccna_domain_pass_v1', records)
    await window.storage.removeItem('ccna_domain_pass_celebrated_v1')
  }, DOMAIN_IDS)
}

test.describe('Domain pass complete', () => {
  test('hub shows blueprint complete card when 6/6 passed', async ({ page }) => {
    await seedAllDomainsPassed(page)

    await page.goto('/#/domainpass')
    await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/BLUEPRINT COMPLETE/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/You passed every domain/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /Copy share text/i })).toBeVisible({ timeout: 10_000 })
  })
})
