import { test, expect } from '@playwright/test'

test.describe('Mock exam history — no duplicate entries on re-render', () => {
  test('completing an exam records exactly one ccna_mock_history_v1 entry, even after a re-render', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
    })

    await page.goto('/#/mock')
    await page.getByRole('button', { name: /Start Mock Exam/i }).click({ timeout: 20_000 })

    // Full exam is long — submit immediately via the always-available shortcut
    // rather than answering every question, same effect on the history write.
    await page.getByRole('button', { name: /Submit exam now/i }).click({ timeout: 20_000 })
    await expect(page.getByText(/\d+\s*\/\s*\d+ correct/i)).toBeVisible({ timeout: 20_000 })

    const countEntries = () => page.evaluate(async () => {
      const hist = await window.storage.getItem('ccna_mock_history_v1')
      return Array.isArray(hist) ? hist.length : 0
    })

    await expect.poll(countEntries, { timeout: 5_000 }).toBe(1)

    // "Review all answers" sets phase to 'review'; the review screen's back
    // button ("Results") sets it back to 'done'. `phase` is itself a
    // dependency of the report useMemo, so this round trip forces it to
    // recompute from scratch — which is what previously re-fired the history
    // write for the same completed attempt.
    await page.getByRole('button', { name: /Review all answers/i }).click()
    await expect(page.getByRole('heading', { name: /Answer review/i })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /Results/i }).click()
    await expect(page.getByText(/\d+\s*\/\s*\d+ correct/i)).toBeVisible({ timeout: 10_000 })

    expect(await countEntries()).toBe(1)

    // The guard must not get stuck: a genuine new attempt should still record.
    await page.getByRole('button', { name: /Retake mock exam/i }).click()
    await page.getByRole('button', { name: /Submit exam now/i }).click({ timeout: 20_000 })
    await expect(page.getByText(/\d+\s*\/\s*\d+ correct/i)).toBeVisible({ timeout: 20_000 })
    await expect.poll(countEntries, { timeout: 5_000 }).toBe(2)
  })
})
