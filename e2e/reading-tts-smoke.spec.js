import { test, expect } from '@playwright/test'

test.describe('Reading TTS smoke', () => {
  test('curated study lesson shows read-aloud controls', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
      await window.storage.setItem('ccna_progress_v1', {
        '1.5': { status: 'in_progress', quizScores: [], lastSeen: Date.now(), studySectionsViewed: true },
      })
    })

    await page.goto('/#/objective/1.5/Study')
    await expect(page.getByRole('group', { name: /Read lesson aloud/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Read aloud off/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Listen to this lesson now/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Listen to this section/i }).first()).toBeVisible()
  })
})
