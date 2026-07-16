import { test, expect } from '@playwright/test'
import { seedOnboarding } from './helpers/seedOnboarding.js'

const RESUME_KEY = 'ccna_domain_pass_debrief_resume_v1'

async function seedDomainPassResultsResume(page) {
  await page.evaluate((key) => {
    const questions = [
      {
        id: 'e2e-dp-1',
        objectiveId: '1.1',
        question: 'E2E domain pass resume stem?',
        choices: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
      },
      {
        id: 'e2e-dp-2',
        objectiveId: '1.2',
        question: 'E2E second stem?',
        choices: ['A', 'B', 'C', 'D'],
        correctIndex: 1,
      },
    ]
    const responses = { 0: 1, 1: 1 }
    window.sessionStorage.setItem(key, JSON.stringify({
      domainId: 'fundamentals',
      savedAt: Date.now(),
      report: {
        correct: 1,
        total: 2,
        byDomain: {
          fundamentals: { name: 'Network Fundamentals', correct: 1, total: 2 },
        },
        trapDebrief: [],
      },
      questions,
      responses,
    }))
  }, RESUME_KEY)
}

async function openDomainPassResults(page) {
  await seedOnboarding(page)
  await seedDomainPassResultsResume(page)
  await page.goto('/#/domainpass')
  await expect(page.getByRole('heading', { name: /Domain Pass/i })).toBeVisible({ timeout: 20_000 })
  await page.getByRole('button', { name: /Network Fundamentals/i }).first().click()
  await expect(page.getByRole('heading', { name: /Network Fundamentals — Results/i })).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('FAIL', { exact: true })).toBeVisible()
  await expect(page.getByText(/1 \/ 2 correct/i)).toBeVisible()
}

async function expandMoreOptions(page) {
  await page.getByRole('button', { name: /More options/i }).click()
}

async function backToDomainPassResults(page) {
  const bottomBack = page.getByRole('navigation', { name: /main navigation/i }).getByRole('button', { name: 'Back', exact: true })
  await expect(bottomBack).toBeVisible({ timeout: 10_000 })
  await bottomBack.click()
  await expect(page.getByRole('heading', { name: /Network Fundamentals — Results/i })).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('FAIL', { exact: true })).toBeVisible()
  await expect(page.getByText(/1 \/ 2 correct/i)).toBeVisible()
  await expect(page.getByText(/Question 1 \//i)).toHaveCount(0)
}

test.describe('Domain pass side-trip resume smoke', () => {
  test('trap drill from results returns to Domain Pass results on Back', async ({ page }) => {
    await openDomainPassResults(page)
    await expandMoreOptions(page)
    await page.getByRole('button', { name: /Trap drill \(this domain\)/i }).click()
    await expect(page.getByRole('heading', { name: /Trap Drill/i })).toBeVisible({ timeout: 20_000 })
    await backToDomainPassResults(page)
  })

  test('Command Hub from results returns to Domain Pass results on Back', async ({ page }) => {
    await openDomainPassResults(page)
    await expandMoreOptions(page)
    await page.getByRole('button', { name: /^Command Hub/i }).click()
    await expect(page.getByRole('heading', { name: /Command Hub/i })).toBeVisible({ timeout: 20_000 })
    await backToDomainPassResults(page)
  })
})
