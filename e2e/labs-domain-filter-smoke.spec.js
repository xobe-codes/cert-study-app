import { test, expect } from '@playwright/test'

test.describe('Labs hub domain filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
    })
    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })
  })

  test('shows domain filter tabs and automation domain labs', async ({ page }) => {
    const domainTabs = page.getByRole('tablist', { name: /Filter labs by exam domain/i })
    await expect(domainTabs).toBeVisible()
    await expect(page.getByRole('tab', { name: /^All ·/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /D6 Automation/i })).toBeVisible()

    await page.getByRole('tab', { name: /D6 Automation/i }).click()
    await expect(page.getByText(/Interpret Automation Impact/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/DOMAIN 6/i)).toBeVisible()
    await expect(page.getByText(/DOMAIN 1/i)).toHaveCount(0)
  })

  test('all tab restores every domain section', async ({ page }) => {
    await page.getByRole('tab', { name: /D6 Automation/i }).click()
    await page.getByRole('tab', { name: /^All ·/ }).click()
    await expect(page.getByText(/DOMAIN 1/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/DOMAIN 6/i)).toBeVisible()
  })

  test('home domain panel opens labs filtered to that domain', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
    })
    await page.goto('/')
    await page.getByRole('button', { name: /Network Access/i }).click()
    await page.getByRole('button', { name: /Domain labs/i }).click()
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('tab', { name: /D2 Access/i })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText(/DOMAIN 2/i)).toBeVisible()
    await expect(page.getByText(/DOMAIN 1/i)).toHaveCount(0)
  })
})
