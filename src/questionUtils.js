/** Shared question-type helpers — MC, ordering (drag-drop), CLI syntax, skill coverage. */

import { gradeCliAnswerList, cliStringsEquivalent } from './lab/cliGrading.js'

export const TYPE_LABEL = {
  definition: 'Definition',
  scenario: 'Scenario',
  application: 'Application',
  'true-false': 'True / False',
  troubleshooting: 'Troubleshooting',
  ordering: 'Put in order',
  cli: 'Type command',
}

export const SKILL_LABEL = {
  design: 'Design',
  implement: 'Implement',
  troubleshoot: 'Troubleshoot',
}

export function isOrderingQuestion(q) {
  return q?.type === 'ordering' && Array.isArray(q.orderItems) && q.orderItems.length >= 3
}

export function isCliQuestion(q) {
  if (q?.type !== 'cli') return false
  const answers = q.answers || (q.answer ? [q.answer] : [])
  return answers.length > 0 && String(answers[0] || '').trim().length > 0
}

export function isMcQuestion(q) {
  if (isOrderingQuestion(q) || isCliQuestion(q)) return false
  if (!Array.isArray(q?.choices) || q.choices.length < 2) return false
  if (typeof q.correctIndex !== 'number') return false
  return q.correctIndex >= 0 && q.correctIndex < q.choices.length
}

export function inferSkill(q) {
  if (q?.skill && SKILL_LABEL[q.skill]) return q.skill
  if (q?.type === 'cli' || q?.type === 'ordering') return 'implement'
  if (q?.type === 'troubleshooting') return 'troubleshoot'
  if (q?.type === 'application') return 'implement'
  if (q?.type === 'scenario') return 'troubleshoot'
  if (q?.type === 'definition') return 'design'
  return 'design'
}

function orderStepMatches(got, expected, alternates) {
  return cliStringsEquivalent(got, expected, alternates)
}

export function gradeQuestion(q, answer) {
  if (isCliQuestion(q)) {
    return gradeCliAnswerList(answer, q.answers || q.answer, q.accept || [])
  }
  if (isOrderingQuestion(q)) {
    const expected = q.orderItems
    const given = answer?.order || answer
    if (!Array.isArray(given) || given.length !== expected.length) return false
    const alts = q.orderAccept || []
    return given.every((item, i) => orderStepMatches(item, expected[i], alts[i]))
  }
  return answer === q.correctIndex
}

export function correctAnswerLabel(q) {
  if (isCliQuestion(q)) {
    const primary = (q.answers || [q.answer]).filter(Boolean)[0]
    return primary || ''
  }
  if (isOrderingQuestion(q)) return q.orderItems.map((s, i) => `${i + 1}. ${s}`).join(' → ')
  if (isMcQuestion(q)) return q.choices[q.correctIndex]
  return ''
}

/** Shape for missed-question bank entries (includes CKU linkage when present). */
export function buildMissedEntry(objectiveId, q, extra = {}) {
  return {
    objectiveId,
    ...(q.id ? { questionId: q.id } : {}),
    question: q.question,
    choices: q.choices,
    correctIndex: q.correctIndex,
    orderItems: q.orderItems,
    answers: q.answers,
    answer: q.answer,
    accept: q.accept,
    hint: q.hint,
    explanation: q.explanation,
    concept: q.concept,
    type: q.type,
    skill: q.skill || inferSkill(q),
    ...(q.cliMode ? { cliMode: q.cliMode } : {}),
    ...(q.cliPrompt ? { cliPrompt: q.cliPrompt } : {}),
    ...(q.cliHostname ? { cliHostname: q.cliHostname } : {}),
    ...(q.cliInterface ? { cliInterface: q.cliInterface } : {}),
    ...(q.cliModeBlurb ? { cliModeBlurb: q.cliModeBlurb } : {}),
    ...(q.answerScope ? { answerScope: q.answerScope } : {}),
    ...(q.ckuIds?.length ? { ckuIds: q.ckuIds } : {}),
    ...(q.answerReview ? { answerReview: q.answerReview } : {}),
    addedAt: Date.now(),
    ...extra,
  }
}

export function shuffleArrayCopy(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Randomize presentation order for a question list (new array, input unchanged). */
export function randomizeQuestionOrder(questions) {
  return shuffleArrayCopy(questions || [])
}

export function computeBankMix(questions) {
  const types = {}
  const skills = {}
  for (const q of questions || []) {
    const t = q.type || 'untagged'
    types[t] = (types[t] || 0) + 1
    const s = inferSkill(q)
    skills[s] = (skills[s] || 0) + 1
  }
  return { types, skills, total: (questions || []).length }
}

export function normalizeQuestionForBank(q, objectiveId, counter) {
  const base = {
    id: q.id || `${objectiveId}-skill-${counter}`,
    question: q.question,
    explanation: q.explanation || '',
    type: q.type,
    difficulty: q.difficulty,
    concept: q.concept,
    skill: q.skill || inferSkill(q),
    ratings: q.ratings || [],
    attempts: q.attempts || [],
    ...(q.ckuIds?.length ? { ckuIds: q.ckuIds } : {}),
    ...(q.answerReview ? { answerReview: q.answerReview } : {}),
  }
  if (isOrderingQuestion(q)) {
    return { ...base, orderItems: [...q.orderItems], ...(q.orderAccept ? { orderAccept: q.orderAccept } : {}) }
  }
  if (isCliQuestion(q)) {
    return {
      ...base,
      answers: q.answers || [q.answer],
      ...(q.accept?.length ? { accept: q.accept } : {}),
      ...(q.hint ? { hint: q.hint } : {}),
    }
  }
  return {
    ...base,
    choices: q.choices,
    correctIndex: q.correctIndex,
  }
}
