import { commandMatches, commandMatchesAbbrev } from './cliProcess.js'
import { resolveIosAbbreviationForGrading } from './iosAbbrev.js'
import { normalizeIosCli } from './iosShorthand.js'

/** Grade free-text IOS input against one or more accepted command strings (shorthand-aware). */
export function gradeCliAnswerList(input, answers, extraAccept = []) {
  const raw = String(input || '').trim()
  if (!raw) return false
  const abbrev = resolveIosAbbreviationForGrading(raw)
  const resolved = abbrev.error ? raw : abbrev.resolved
  const normalized = normalizeIosCli(resolved)
  const accepted = [
    ...(Array.isArray(answers) ? answers : answers != null ? [answers] : []),
    ...(extraAccept || []),
  ].filter(Boolean)
  return accepted.some(exp => commandMatches(normalized, exp) || commandMatchesAbbrev(normalized, exp, 'config'))
}

/** Alias used by routing decoder and interface free-text fields. */
export function answersMatchShorthand(input, expected, extraAccept = []) {
  return gradeCliAnswerList(input, expected, extraAccept)
}

/** Compare two CLI strings (optional alternates) — ordering steps, lab progress, etc. */
export function cliStringsEquivalent(a, b, alternates = []) {
  return gradeCliAnswerList(a, b, alternates)
}
