import { test, expect } from '@playwright/test'

test.describe('CLI skill question smoke', () => {
  test('daily review grades IOS shorthand CLI answers', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
    await page.evaluate(async () => {
      await window.storage.setItem('ccna_onboard_done_v1', true)
      await window.storage.setItem('ccna_tour_done_v1', true)
      await window.storage.setItem('ccna_quiz_bank_v1', {
        '2.1': [{
          id: '2.1-cli-e2e',
          type: 'cli',
          skill: 'implement',
          question: 'Create VLAN 20',
          answers: ['vlan 20'],
          explanation: 'Global config: **vlan** `<id>`.',
          srs: { due: 0, interval: 1, ease: 2.5, lapses: 0 },
          attempts: [{ correct: false, at: Date.now() }],
          ratings: [],
        }],
      })
    })

    await page.goto('/#/review')
    await expect(page.getByRole('heading', { name: /Daily Review/i })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('textbox', { name: /IOS command answer/i }).fill('vlan 20')
    await page.getByRole('button', { name: /Check command/i }).click()
    await expect(page.getByText(/^Correct$/).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/CORRECT COMMAND/i)).toBeVisible()
  })
})
