/**
 * Post-grade diagnosis for a rejected lab command.
 *
 * Pure and advisory: it never decides pass/fail, it only explains why the line
 * the learner typed is not the line the task asked for. Grading stays in
 * commandMatches/gradeCliAnswerList.
 */
import { normalizeIosCli } from './iosShorthand.js'
import { stripCliPrompt } from './cliProcess.js'

function pendingAnswers(objectives = [], completed = []) {
  const out = []
  objectives.forEach((objective, i) => {
    if (completed[i]) return
    for (const answer of objective?.answer || objective?.answers || []) {
      const norm = normalizeIosCli(stripCliPrompt(answer))
      if (norm) out.push({ objective, norm })
    }
  })
  return out
}

function sharedPrefix(a, b) {
  let n = 0
  while (n < a.length && n < b.length && a[n] === b[n]) n++
  return n
}

/**
 * @returns {{kind: string, message: string} | null} null when nothing specific
 * can be said — the caller keeps its existing generic message.
 */
export function diagnoseCliMiss(input, objectives = [], completed = []) {
  const norm = normalizeIosCli(stripCliPrompt(input))
  if (!norm) return null
  const answers = pendingAnswers(objectives, completed)
  if (!answers.length) return null

  const negatedForm = norm.startsWith('no ') ? norm.slice(3).trim() : null

  for (const { norm: expected } of answers) {
    if (negatedForm && negatedForm === expected) {
      return {
        kind: 'negation',
        message: '% "no" removes the configuration. This task asks you to apply the command, not undo it.',
      }
    }
    if (!negatedForm && expected === `no ${norm}`) {
      return {
        kind: 'missing-negation',
        message: '% This task needs the "no" form — that is what enables the setting here.',
      }
    }
  }

  const inputTokens = norm.split(' ')
  let best = null
  for (const { norm: expected } of answers) {
    const expectedTokens = expected.split(' ')
    const shared = sharedPrefix(inputTokens, expectedTokens)
    if (shared >= 2 && (!best || shared > best.shared)) best = { shared, expectedTokens }
  }
  if (!best) return null

  if (inputTokens.length > best.expectedTokens.length) {
    return {
      kind: 'extra-keywords',
      message: '% Close — that command carries extra keywords, which makes it a different command than the task asks for.',
    }
  }
  if (inputTokens.length < best.expectedTokens.length) {
    return { kind: 'incomplete', message: '% Close — the command is missing arguments.' }
  }
  return { kind: 'wrong-argument', message: '% Close — the keywords are right but an argument does not match.' }
}
