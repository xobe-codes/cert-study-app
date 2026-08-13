/**
 * Budget test for wrong-answer debrief quality.
 *
 * The render-time gate in AnswerReview's WrongChoiceReview applies five
 * detectors, two of which (isGenericStructuredFeedback) no upstream gate
 * checked. Content that fails them silently loses the structured
 * "why it is wrong / what it implies" pair and falls back to the single
 * authored explanation line — no error, no log, no test.
 *
 * These budgets make that visible. They are ratchets, not targets: lower the
 * numbers as content improves, never raise them.
 */
import { describe, expect, it } from 'vitest'
import { applyAnswerReviewToQuestion } from '../answerReviewLogic.js'
import {
  hasSplicedProse,
  isFallbackExplanation,
  isGenericStructuredFeedback,
  isTemplateWhyWrongHere,
} from '../answerReview/answerReviewQuality.js'

// Measured 2026-08-13 after closing the isGenericStructuredFeedback quality-gate
// gap (legacy "matches the required behavior" / "points to a related idea"
// boilerplate was passing three separate low-quality checks uncaught) and
// adding stem-anchored SADE coverage for the highest-volume degraded topics
// in domains 3-6.
const MAX_DEGRADED_RATE = 0.245
const MAX_DEGRADED_BY_DOMAIN = { 1: 0.01, 2: 0.08, 3: 0.42, 4: 0.176, 5: 0.431, 6: 0.031 }

async function loadRuntimeBank() {
  const out = []
  for (const d of [1, 2, 3, 4, 5, 6]) {
    const mod = await import(`../data/cleanQuestions/domain-${d}.js`)
    for (const list of Object.values(mod.CLEAN_QUESTIONS || {})) {
      for (const q of list || []) out.push({ q, domain: d })
    }
  }
  return out
}

function renderOutcome(item) {
  const generic = item.genericDebrief
    || isTemplateWhyWrongHere(item.whyWrongHere)
    || isFallbackExplanation(item.whatItDoes)
    || isGenericStructuredFeedback(item.whyWrongHere)
    || isGenericStructuredFeedback(item.whatItDoes)
  const structured = Boolean(item.whatItDoes && item.whyWrongHere && !generic)
  const specificExplanation = Boolean(
    item.explanation
    && !isFallbackExplanation(item.explanation)
    && !isTemplateWhyWrongHere(item.explanation),
  )
  return { structured, specificExplanation }
}

describe('wrong-answer debrief quality budget', () => {
  it('ships no cross-topic spliced prose', async () => {
    const bank = await loadRuntimeBank()
    const offenders = []
    for (const { q } of bank) {
      const reviewed = applyAnswerReviewToQuestion(q)
      for (const item of reviewed.answerReview?.incorrect || []) {
        if (hasSplicedProse(item)) offenders.push(`${q.id}#${item.choiceIndex}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('always leaves the learner a specific rationale', async () => {
    const bank = await loadRuntimeBank()
    const empty = []
    for (const { q } of bank) {
      const reviewed = applyAnswerReviewToQuestion(q)
      for (const item of reviewed.answerReview?.incorrect || []) {
        const { structured, specificExplanation } = renderOutcome(item)
        if (!structured && !specificExplanation) empty.push(`${q.id}#${item.choiceIndex}`)
      }
    }
    expect(empty).toEqual([])
  })

  it('does not regress the structured-debrief rate', async () => {
    const bank = await loadRuntimeBank()
    let items = 0, degraded = 0
    const byDomain = {}
    for (const { q, domain } of bank) {
      const reviewed = applyAnswerReviewToQuestion(q)
      for (const item of reviewed.answerReview?.incorrect || []) {
        items++
        byDomain[domain] ||= { items: 0, degraded: 0 }
        byDomain[domain].items++
        if (!renderOutcome(item).structured) {
          degraded++
          byDomain[domain].degraded++
        }
      }
    }
    expect(items).toBeGreaterThan(2000)
    expect(degraded / items).toBeLessThanOrEqual(MAX_DEGRADED_RATE)
    for (const [domain, budget] of Object.entries(MAX_DEGRADED_BY_DOMAIN)) {
      const stat = byDomain[domain]
      if (!stat?.items) continue
      expect(stat.degraded / stat.items, `domain ${domain}`).toBeLessThanOrEqual(budget)
    }
  })
})
