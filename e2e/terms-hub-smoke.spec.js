import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

test.describe('Terms Hub smoke', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
    await page.goto('/#/termshub')
    await expect(page.getByRole('heading', { name: /Terms Hub/i })).toBeVisible({ timeout: 20_000 })
  })

  test('browse lists terms and flash mode advances', async ({ page }) => {
    await expect(page.getByText(/\d+ terms/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByPlaceholder(/Search terms/i)).toBeVisible()

    await page.getByRole('button', { name: 'Flash' }).click()
    await expect(page.getByText(/^1\/\d+$/)).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Reveal' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText(/^2\/\d+$/)).toBeVisible({ timeout: 10_000 })
  })

  test('type mode grades an answer', async ({ page }) => {
    await page.getByRole('button', { name: 'Type the term' }).click()
    await expect(page.getByLabel('Type the term')).toBeVisible({ timeout: 10_000 })
    await page.getByLabel('Type the term').fill('vlan')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/^2\/\d+$/)).toBeVisible({ timeout: 10_000 })
  })
})
