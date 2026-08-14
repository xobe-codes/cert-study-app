import { expect } from '@playwright/test'

/**
 * Shared, dependency-free accessibility assertions — not a WCAG audit (that
 * needs a real engine like axe-core, which isn't currently a project
 * dependency), but a systematic sweep of the checks a screen-reader user
 * actually hits first: does every interactive control announce a name, does
 * every image have alt text, is there a heading to orient by. Reused across
 * many routes in a11y-smoke.spec.js instead of duplicating the loop per test.
 */
export async function assertA11yBasics(page, label) {
  // Every button must expose an accessible name (text content or aria-label).
  const buttons = page.getByRole('button')
  const buttonCount = await buttons.count()
  const unnamedButtons = []
  for (let i = 0; i < buttonCount; i++) {
    const btn = buttons.nth(i)
    const name = (await btn.getAttribute('aria-label')) || (await btn.innerText()).trim()
    if (!name) unnamedButtons.push(i)
  }
  expect(unnamedButtons, `[${label}] ${unnamedButtons.length} button(s) with no accessible name`).toEqual([])

  // Every image needs an alt attribute (empty string is fine for decorative images).
  const imgs = page.locator('img')
  const imgCount = await imgs.count()
  for (let i = 0; i < imgCount; i++) {
    const alt = await imgs.nth(i).getAttribute('alt')
    expect(alt, `[${label}] img #${i} is missing an alt attribute`).not.toBeNull()
  }

  // Every text-ish input needs a name — via aria-label, aria-labelledby, or an associated <label>.
  // Hidden inputs (display:none file-picker triggers behind a styled button,
  // etc.) are excluded: a screen reader never reaches an invisible native
  // control directly, so it isn't the thing that needs the accessible name.
  const allFields = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, select')
  const allFieldCount = await allFields.count()
  const fields = []
  for (let i = 0; i < allFieldCount; i++) {
    if (await allFields.nth(i).isVisible()) fields.push(allFields.nth(i))
  }
  const fieldCount = fields.length
  for (let i = 0; i < fieldCount; i++) {
    const field = fields[i]
    const ariaLabel = await field.getAttribute('aria-label')
    const ariaLabelledby = await field.getAttribute('aria-labelledby')
    const id = await field.getAttribute('id')
    const hasLabelFor = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false
    const placeholder = await field.getAttribute('placeholder')
    const named = !!(ariaLabel || ariaLabelledby || hasLabelFor || placeholder)
    expect(named, `[${label}] form field #${i} has no accessible name (aria-label/label/placeholder)`).toBe(true)
  }

  // Links (real <a> elements, not button-styled spans) need visible or aria text.
  const links = page.getByRole('link')
  const linkCount = await links.count()
  for (let i = 0; i < linkCount; i++) {
    const link = links.nth(i)
    const name = (await link.getAttribute('aria-label')) || (await link.innerText()).trim()
    expect(name, `[${label}] link #${i} has no accessible name`).toBeTruthy()
  }

  return { buttonCount, imgCount, fieldCount, linkCount }
}

/** A screen should give a screen-reader user at least one heading to orient by. */
export async function assertHasHeading(page, label) {
  const headingCount = await page.getByRole('heading').count()
  expect(headingCount, `[${label}] expected at least one heading`).toBeGreaterThan(0)
}
