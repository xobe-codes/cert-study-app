import { commandMatches } from './cliProcess.js'

/** Grade free-text IOS input against one or more accepted command strings (shorthand-aware). */
export function gradeCliAnswerList(input, answers, extraAccept = []) {
  const raw = String(input || '').trim()
  if (!raw) return false
  const accepted = [
    ...(Array.isArray(answers) ? answers : answers != null ? [answers] : []),
    ...(extraAccept || []),
  ].filter(Boolean)
  return accepted.some(exp => commandMatches(raw, exp))
}

/** Alias used by routing decoder and interface free-text fields. */
export function answersMatchShorthand(input, expected, extraAccept = []) {
  return gradeCliAnswerList(input, expected, extraAccept)
}

/** Compare two CLI strings (optional alternates) — ordering steps, lab progress, etc. */
export function cliStringsEquivalent(a, b, alternates = []) {
  return gradeCliAnswerList(a, b, alternates)
}
