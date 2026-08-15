import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Shared accessibility assertions for e2e specs.
 *
 * assertA11yBasics/assertHasHeading are a fast, dependency-light sweep of
 * the checks a screen-reader user hits first — accessible names, alt text,
 * a heading to orient by. assertNoAxeViolations runs the real axe-core WCAG
 * engine (@axe-core/playwright) for everything those hand-rolled checks
 * can't see: color contrast, ARIA misuse, duplicate IDs, landmark structure,
 * heading order, and the rest of the ~90 rules axe ships with. Both layers
 * are worth keeping — axe is authoritative but only reports what it can
 * statically detect on the DOM as rendered; the hand-rolled checks stay
 * useful as a fast, explicit regression net for the properties this app's
 * own components are most likely to regress (a raw {choice} render losing
 * its aria-label, an <img> losing its alt).
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

/**
 * Run the real axe-core WCAG 2.1 AA ruleset against the current page state
 * and fail with a readable summary (rule id, impact, and up to 3 offending
 * selectors per violation) if anything is flagged.
 *
 * @param {string[]} disableRules — rule IDs to skip for this call, for a
 *   documented, reviewed exception (not a silent blanket disable) — pass
 *   the rule id and explain why in a comment at the call site.
 */
export async function assertNoAxeViolations(page, label, { disableRules = [] } = {}) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  if (disableRules.length) builder.disableRules(disableRules)
  const results = await builder.analyze()

  if (results.violations.length) {
    const summary = results.violations.map(v => {
      const nodes = v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')
      const more = v.nodes.length > 3 ? ` (+${v.nodes.length - 3} more)` : ''
      return `  - [${v.impact}] ${v.id}: ${v.help} — ${nodes}${more}`
    }).join('\n')
    expect(results.violations, `[${label}] axe found ${results.violations.length} violation type(s):\n${summary}`).toEqual([])
  }
}
