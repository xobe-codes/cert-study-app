/**
 * Spec 6 — Baseline → action plan (drives domain primary CTA).
 */
import { domainPassStatus } from './domainPassConfig.js'

/**
 * @returns {{
 *   strong: string[],
 *   weak: string[],
 *   notChecked: string[],
 *   nextLessons: string[],
 *   nextMissDrill: boolean,
 *   readyForPass: boolean,
 *   primaryCta: 'baseline' | 'study' | 'fix_misses' | 'pass' | 'burn' | 'practice',
 *   primaryLabel: string,
 * }}
 */
export function buildDomainActionPlan({
  baselineSummary = null,
  missCount = 0,
  unseenCount = 0,
  passRecord = null,
  hasPlacement = true,
} = {}) {
  const strong = (baselineSummary?.strongObjectives || []).map(x => (typeof x === 'string' ? x : x?.id)).filter(Boolean)
  const weak = (baselineSummary?.weakObjectives || []).map(x => (typeof x === 'string' ? x : x?.id)).filter(Boolean)
  const notChecked = (baselineSummary?.notCheckedObjectives || []).map(x => (typeof x === 'string' ? x : x?.id)).filter(Boolean)
  const hasBaseline = baselineSummary && baselineSummary.domainStatus !== 'not_started'
  const passStatus = domainPassStatus(passRecord)

  let primaryCta = 'practice'
  let primaryLabel = 'Practice domain'

  if (hasPlacement && !hasBaseline) {
    primaryCta = 'baseline'
    primaryLabel = 'Set baseline map'
  } else if (missCount >= 3) {
    primaryCta = 'fix_misses'
    primaryLabel = `Fix misses (${missCount})`
  } else if (weak.length > 0) {
    primaryCta = 'study'
    primaryLabel = `Study weak · ${weak[0]}`
  } else if (unseenCount > 12) {
    primaryCta = 'burn'
    primaryLabel = `Burn bank · ${unseenCount} unseen`
  } else if (passStatus !== 'passed' && hasBaseline) {
    primaryCta = 'pass'
    primaryLabel = 'Domain Pass — prove it'
  } else if (passStatus === 'passed' && unseenCount > 0) {
    primaryCta = 'burn'
    primaryLabel = `Burn bank · ${unseenCount} unseen`
  }

  return {
    strong,
    weak,
    notChecked,
    nextLessons: [...weak, ...notChecked].slice(0, 5),
    nextMissDrill: missCount > 0,
    readyForPass: hasBaseline && missCount < 8,
    primaryCta,
    primaryLabel,
    passStatus,
  }
}

/** Objective ids to remap on retake: weak + notChecked (strong locked). */
export function remapObjectiveFilter(actionPlan) {
  const ids = [...(actionPlan?.weak || []), ...(actionPlan?.notChecked || [])]
  return [...new Set(ids)]
}
