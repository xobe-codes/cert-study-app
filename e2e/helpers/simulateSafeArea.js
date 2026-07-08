/** Inject simulated notch / home-indicator insets for safe-area e2e. */
import { expect } from '@playwright/test'

export async function simulateSafeArea(page, insets = { top: 47, right: 44, bottom: 34, left: 44 }) {
  await page.addStyleTag({
    content: `
      :root {
        --ccna-safe-top: ${insets.top}px !important;
        --ccna-safe-right: ${insets.right}px !important;
        --ccna-safe-bottom: ${insets.bottom}px !important;
        --ccna-safe-left: ${insets.left}px !important;
      }
    `,
  })
}

/** Assert a back control sits below the simulated notch (safe-area top). */
export async function assertBackClearsNotch(page, locator, insets = { top: 47 }) {
  await expect(locator).toBeVisible()
  const box = await locator.boundingBox()
  expect(box).toBeTruthy()
  expect(box.y).toBeGreaterThanOrEqual(insets.top - 2)
}

/** Assert no horizontal overflow on the document shell. */
export async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    return doc.scrollWidth > doc.clientWidth + 1
  })
  if (overflow) {
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    throw new Error(`Horizontal overflow: ${JSON.stringify(widths)}`)
  }
}
