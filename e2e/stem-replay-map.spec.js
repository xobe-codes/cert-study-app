import { test, expect } from '@playwright/test'

test.describe('Stem replay map', () => {
  test('exposes 50+ verified question→lab mappings via dev hooks', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof window.__ccnaTestHooks?.stemReplaySize === 'function')

    const size = await page.evaluate(() => window.__ccnaTestHooks.stemReplaySize())
    expect(size).toBeGreaterThanOrEqual(80)

    const aclLab = await page.evaluate(() => window.__ccnaTestHooks.stemReplayLab('5.5-c-q1'))
    expect(aclLab).toBe('LAB-ACL-CONFIG')

    const trunk = await page.evaluate(() => window.__ccnaTestHooks.hasStemReplayLab('2.2-c-q1'))
    expect(trunk).toBe(true)
  })
})
