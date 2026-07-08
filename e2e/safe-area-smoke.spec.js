import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'
import {
  simulateSafeArea,
  assertNoHorizontalOverflow,
  assertBackClearsNotch,
} from './helpers/simulateSafeArea.js'
import { STORAGE_KEYS } from '../src/storageKeys.js'

const NOTCH_INSETS = { top: 47, right: 44, bottom: 34, left: 44 }

test.describe('Safe area smoke', () => {
  test('labs hub back control clears notch on iPhone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/labs')
    await expect(page.getByRole('heading', { name: /Hands-on Labs/i })).toBeVisible({ timeout: 20_000 })

    await assertBackClearsNotch(page, page.locator('.study-mode-back-btn').first(), NOTCH_INSETS)
    await assertNoHorizontalOverflow(page)
  })

  test('mock exam intro back clears notch on iPhone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })

    await assertBackClearsNotch(page, page.locator('.study-mode-back-btn').first(), NOTCH_INSETS)
    await assertNoHorizontalOverflow(page)
  })

  test('domain pass hub back clears notch on iPhone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/domainpass')
    await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })

    await assertBackClearsNotch(page, page.locator('.study-mode-back-btn').first(), NOTCH_INSETS)
    await assertNoHorizontalOverflow(page)
  })

  test('domain placement intro back clears notch on iPhone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/domainplacement')
    await expect(page.getByRole('heading', { name: /Domain baseline/i })).toBeVisible({ timeout: 20_000 })

    await assertBackClearsNotch(page, page.locator('.study-mode-back-btn').first(), NOTCH_INSETS)
    await assertNoHorizontalOverflow(page)
  })

  test('tutor back clears notch on iPhone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page, { [STORAGE_KEYS.premiumUnlocked]: true })
    await page.reload({ waitUntil: 'networkidle' })
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/tutor')
    await expect(page.getByRole('heading', { name: /AI Tutor Chat/i })).toBeVisible({ timeout: 20_000 })

    await assertBackClearsNotch(page, page.locator('.study-mode-back-btn').first(), NOTCH_INSETS)
    await assertNoHorizontalOverflow(page)
  })

  test('curated diagram modal close control clears notch on iPhone portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/objective/1.2/Study')
    await expect(page.getByText(/Campus tier|tier/i).first()).toBeVisible({ timeout: 20_000 })

    const expandBtn = page.locator('.curated-diagram-expand-btn')
    await expect(expandBtn).toBeVisible({ timeout: 15_000 })
    await expandBtn.click()

    const closeBtn = page.getByRole('button', { name: /Close diagram/i })
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 })
    const header = page.locator('.curated-diagram-modal-header')
    const box = await header.boundingBox()
    expect(box).toBeTruthy()
    expect(box.y).toBeGreaterThanOrEqual(NOTCH_INSETS.top - 2)
    await assertBackClearsNotch(page, closeBtn, NOTCH_INSETS)
  })

  test('landscape side insets — trap drill hub fits without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/trapdrill')
    await expect(page.getByRole('heading', { name: /Trap Drill/i })).toBeVisible({ timeout: 20_000 })
    await assertNoHorizontalOverflow(page)
  })

  test('landscape side insets — mock exam intro fits without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/mock')
    await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible({ timeout: 20_000 })
    await assertNoHorizontalOverflow(page)
  })

  test('landscape side insets — domain pass hub fits without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await seedOnboarding(page)
    await simulateSafeArea(page, NOTCH_INSETS)
    await page.goto('/#/domainpass')
    await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })
    await assertNoHorizontalOverflow(page)
  })
})
