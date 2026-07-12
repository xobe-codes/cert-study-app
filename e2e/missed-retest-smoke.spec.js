import { test, expect } from '@playwright/test'

const SEED_MISSED = [
  {
    objectiveId: '1.9',
    questionId: 'e2e-missed-q1',
    question: 'Which IPv6 address type is FE80::/10?',
    choices: ['Link-local', 'Global unicast', 'Multicast', 'Loopback'],
    correctIndex: 0,
    explanation: 'FE80::/10 is link-local.',
    type: 'definition',
    addedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    objectiveId: '2.1',
    questionId: 'e2e-missed-q2',
    question: 'What VLAN is the default on Cisco switches?',
    choices: ['VLAN 0', 'VLAN 1', 'VLAN 10', 'VLAN 99'],
    correctIndex: 1,
    explanation: 'VLAN 1 is default.',
    type: 'definition',
    addedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
]

async function seedMissed(page, entries) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async (missed) => {
    await window.storage.setItem('ccna_onboard_done_v1', true)
    await window.storage.setItem('ccna_tour_done_v1', true)
    await window.storage.setItem('ccna_missed_v1', missed)
  }, entries)
  // `missed` is loaded once into top-level React state at bootstrap
  // (useAppBootstrap.js) and threaded down as a prop — unlike ReviewSession,
  // which re-fetches its own due-question bank at mount. A hash-only
  // navigation doesn't re-run bootstrap, so a real reload is required for
  // MissedReview to see freshly-seeded storage.
  await page.reload()
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
}

test.describe('Missed Retest smoke', () => {
  test('Clear queue launches, answering correctly removes the entry from the missed bank', async ({ page }) => {
    await seedMissed(page, SEED_MISSED)
    await page.goto('/#/missed')

    await expect(page.getByRole('heading', { name: 'Missed Questions' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('2 questions saved for review.')).toBeVisible()

    await page.getByRole('button', { name: /Clear queue/i }).click()
    await expect(page.getByRole('heading', { name: 'Clear Queue' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/no score kept/i)).toBeVisible()

    // Answer the first question correctly regardless of shuffled choice order.
    const correctChoice = await page.evaluate(async () => {
      const missed = await window.storage.getItem('ccna_missed_v1')
      return missed[0].choices[missed[0].correctIndex]
    })
    await page.getByRole('radio', { name: new RegExp(correctChoice, 'i') }).click()
    await expect(page.getByText(/^Correct$/)).toBeVisible({ timeout: 10_000 })

    const missedAfter = await page.evaluate(async () => (await window.storage.getItem('ccna_missed_v1')).length)
    expect(missedAfter).toBe(1)
  })

  test('Prove it mode is locked above the unlock threshold and shows a pass badge when scored', async ({ page }) => {
    const bigBank = Array.from({ length: 31 }, (_, i) => ({
      objectiveId: '1.1',
      questionId: `e2e-bulk-q${i}`,
      question: `Sample question ${i}?`,
      choices: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Sample.',
      type: 'definition',
      addedAt: Date.now() - i * 1000,
    }))
    await seedMissed(page, bigBank)
    await page.goto('/#/missed')

    await expect(page.getByRole('button', { name: /Prove it/i })).toBeDisabled({ timeout: 15_000 })
    await expect(page.getByText(/unlocks at 30 or fewer missed/i)).toBeVisible()

    // Clear-queue session must cap at 15 even though the bank has 31.
    await page.getByRole('button', { name: /Clear queue/i }).click()
    await expect(page.getByText(/1 of 15/)).toBeVisible({ timeout: 15_000 })
  })

  test('Clear queue empties the bank and reaches an unscored empty-state', async ({ page }) => {
    await seedMissed(page, [SEED_MISSED[0]])
    await page.goto('/#/missed')
    await page.getByRole('button', { name: /Clear queue/i }).click()
    await expect(page.getByRole('heading', { name: 'Clear Queue' })).toBeVisible({ timeout: 15_000 })

    const correctChoice = await page.evaluate(async () => {
      const missed = await window.storage.getItem('ccna_missed_v1')
      return missed[0].choices[missed[0].correctIndex]
    })
    await page.getByRole('radio', { name: new RegExp(correctChoice, 'i') }).click()
    await page.getByRole('button', { name: 'Finish' }).click()

    await expect(page.getByText(/Cleared 1 of 1 — 0 left/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/%/)).not.toBeVisible()
  })
})
