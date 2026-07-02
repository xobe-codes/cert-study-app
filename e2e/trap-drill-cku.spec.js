import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

const CKU_CASES = [
  {
    ckuId: 'CKU-DTP',
    trapLabel: /Expecting DTP to negotiate when.*nonegotiate/i,
  },
  {
    ckuId: 'CKU-FLEXCONNECT',
    trapLabel: /Believing all WLAN traffic must switch centrally at the WLC/i,
  },
  {
    ckuId: 'CKU-WPA3',
    trapLabel: /Choosing WPA3-Personal when enterprise 802\.1X is required/i,
  },
  {
    ckuId: 'CKU-LACP-MODE',
    trapLabel: /Mismatched LACP active\/passive modes prevent channel formation/i,
  },
  {
    ckuId: 'CKU-ROOT-GUARD',
    trapLabel: /Enabling Root Guard on the actual root bridge uplink/i,
  },
]

async function startTrapDrillCku(page, ckuId) {
  await page.goto('/#/trapdrill')
  await page.waitForFunction(() => typeof window.__ccnaTestHooks?.startTrapDrill === 'function')
  await page.evaluate(async (id) => {
    await window.__ccnaTestHooks.startTrapDrill(id)
  }, ckuId)
}

async function answerFirstTrapQuestion(page) {
  await expect(page.locator('[role="radiogroup"]').first()).toBeVisible({ timeout: 15_000 })

  const radios = page.getByRole('radio')
  const count = await radios.count()
  for (let i = 0; i < count; i++) {
    await radios.nth(i).click()
    const incorrect = page.getByText(/^✗ Incorrect$/).first()
    if (await incorrect.isVisible().catch(() => false)) {
      await expect(page.locator('.ccna-answer-review').first()).toBeVisible({ timeout: 10_000 })
      return
    }
    const correct = page.getByText(/^✓ Correct$/).first()
    if (await correct.isVisible().catch(() => false)) continue
    if (await page.getByText(/WHY [A-F] IS WRONG/i).count()) {
      await expect(page.locator('.ccna-answer-review').first()).toBeVisible({ timeout: 10_000 })
      return
    }
  }
  throw new Error('No wrong-choice debrief appeared after trying all radios')
}

test.describe('Trap drill CKU sessions', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  for (const { ckuId, trapLabel } of CKU_CASES) {
    test(`${ckuId} shows trap label and AnswerReview after one answer`, async ({ page }) => {
      await startTrapDrillCku(page, ckuId)
      await expect(page.getByText(trapLabel)).toBeVisible({ timeout: 15_000 })
      await answerFirstTrapQuestion(page)
      await expect(page.getByText(/What this choice implies/i)).toBeVisible()
      await expect(page.getByText(/Why it is wrong here/i)).toBeVisible()
    })
  }
})
