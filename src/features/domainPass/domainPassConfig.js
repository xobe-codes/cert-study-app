/** Domain Pass sizing, scoring, timer, and progress helpers. */

export const DOMAIN_PASS_PASS_PCT = 80
export const DOMAIN_PASS_BASE_POOL = 50
export const DOMAIN_PASS_MIN_QUESTIONS = 12
export const DOMAIN_PASS_TOTAL_DOMAINS = 6
/** ~1.5 min per question when timer uses per-question pacing fallback. */
export const DOMAIN_PASS_SEC_PER_QUESTION = 90

/** Blueprint-weighted question count for a single domain pass attempt. */
export function domainPassQuestionCount(domain) {
  const weight = domain?.weight ?? 0
  const scaled = Math.round((weight / 100) * DOMAIN_PASS_BASE_POOL)
  return Math.max(DOMAIN_PASS_MIN_QUESTIONS, scaled)
}

/** Timer minutes proportional to a full 30-question / 120-minute mock. */
export function domainPassTimerMinutes(questionCount) {
  return Math.round((questionCount / 30) * 120)
}

/** Countdown seconds for a domain when timer is enabled (exam-faithful mock ratio). */
export function domainPassDurationSec(domain, timerEnabled = true) {
  if (!timerEnabled) return 0
  return domainPassTimerMinutes(domainPassQuestionCount(domain)) * 60
}

export function isDomainPassPassed(pct) {
  return pct >= DOMAIN_PASS_PASS_PCT
}

/** Score a domain pass attempt. needsDebrief when at least one answer was wrong. */
export function evaluateDomainPass({ correct, total }) {
  const safeTotal = Math.max(0, total ?? 0)
  const safeCorrect = Math.min(Math.max(0, correct ?? 0), safeTotal)
  const pct = safeTotal > 0 ? Math.round((safeCorrect / safeTotal) * 100) : 0
  const passed = isDomainPassPassed(pct)
  const needsDebrief = safeCorrect < safeTotal
  return { passed, pct, needsDebrief }
}

/** Count domains with a persisted pass record. */
export function countDomainsPassed(records) {
  if (!records || typeof records !== 'object') return 0
  return Object.values(records).filter(r => r?.passed).length
}

/** @returns {'passed' | 'retake' | 'not_started'} */
export function domainPassStatus(record) {
  if (!record) return 'not_started'
  const attemptCount = Array.isArray(record.attempts)
    ? record.attempts.length
    : (typeof record.attempts === 'number' ? record.attempts : 0)
  const lastAt = record.lastAt ?? record.lastAttemptAt
  if (attemptCount === 0 && !lastAt) return 'not_started'
  if (record.passed) return 'passed'
  return 'retake'
}

export function domainPassBadgeLabel(status) {
  if (status === 'passed') return '✓ Passed'
  if (status === 'retake') return 'Retake'
  return 'Not started'
}
