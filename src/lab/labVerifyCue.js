import { normalizeCmd } from './cliEngine.js'

/** True when lab is complete or one required command away. */
export function isNearLabComplete(doneCount, total) {
  const done = Number(doneCount) || 0
  const tot = Number(total) || 0
  if (tot <= 0) return false
  return done >= tot - 1
}

/** First verification check to soft-prompt, or null. */
export function primaryVerifyPrompt(verificationChecks = []) {
  const list = Array.isArray(verificationChecks) ? verificationChecks : []
  const v = list[0]
  if (!v?.command) return null
  return {
    id: v.id,
    device: v.device || 'R1',
    command: v.command,
    expectedResult: v.expectedResult || '',
  }
}

/**
 * Soft match: user typed a verification show command (exact after normalize).
 * Does not grade — only detects attempt.
 */
export function matchVerificationCommand(raw, verificationChecks = []) {
  const n = normalizeCmd(raw)
  if (!n) return null
  const list = Array.isArray(verificationChecks) ? verificationChecks : []
  return list.find(v => normalizeCmd(v?.command) === n) || null
}
