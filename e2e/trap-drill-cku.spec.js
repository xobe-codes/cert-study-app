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
  await page.getByRole('radio').first().click()
  await expect(page.locator('.ccna-answer-review').first()).toBeVisible({ timeout: 10_000 })
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
