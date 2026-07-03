import { expect } from '@playwright/test'

/** Seed onboarding complete via window.storage (shared e2e helper). */
export async function seedOnboarding(page, extra = {}) {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.storage?.getItem === 'function')
  await page.evaluate(async (payload) => {
    await window.storage.setItem('ccna_onboard_done_v1', true)
    await window.storage.setItem('ccna_tour_done_v1', true)
    for (const [key, value] of Object.entries(payload)) {
      await window.storage.setItem(key, value)
    }
  }, extra)
}

/** Home loaded: non-blank root and Welcome / Topics / bottom nav. */
export async function assertHomeLoaded(page) {
  const root = page.locator('#root')
  const innerText = await root.innerText()
  const innerHTML = await root.innerHTML()
  expect(innerHTML.length).toBeGreaterThan(1000)
  const hasWelcome = /Welcome/i.test(innerText)
  const hasTopics = /Topics/i.test(innerText)
  const navVisible = await page.locator('.app-bottom-nav').isVisible().catch(() => false)
  expect(hasWelcome || hasTopics || navVisible).toBe(true)
}
