/** Shared question-type helpers — MC, ordering (drag-drop), skill coverage. */

export const TYPE_LABEL = {
  definition: 'Definition',
  scenario: 'Scenario',
  application: 'Application',
  'true-false': 'True / False',
  troubleshooting: 'Troubleshooting',
  ordering: 'Put in order',
}

export const SKILL_LABEL = {
  design: 'Design',
  implement: 'Implement',
  troubleshoot: 'Troubleshoot',
}

export function isOrderingQuestion(q) {
  return q?.type === 'ordering' && Array.isArray(q.orderItems) && q.orderItems.length >= 3
}

export function isMcQuestion(q) {
  return !isOrderingQuestion(q) && Array.isArray(q?.choices) && typeof q.correctIndex === 'number'
}

export function inferSkill(q) {
  if (q?.skill && SKILL_LABEL[q.skill]) return q.skill
  if (q?.type === 'ordering') return 'implement'
  if (q?.type === 'troubleshooting') return 'troubleshoot'
  if (q?.type === 'application') return 'implement'
  if (q?.type === 'scenario') return 'troubleshoot'
  if (q?.type === 'definition') return 'design'
  return 'design'
}

export function gradeQuestion(q, answer) {
  if (isOrderingQuestion(q)) {
    const expected = q.orderItems
    const given = answer?.order || answer
    if (!Array.isArray(given) || given.length !== expected.length) return false
    return given.every((item, i) => item === expected[i])
  }
  return answer === q.correctIndex
}

export function correctAnswerLabel(q) {
  if (isOrderingQuestion(q)) return q.orderItems.map((s, i) => `${i + 1}. ${s}`).join(' → ')
  if (isMcQuestion(q)) return q.choices[q.correctIndex]
  return ''
}

export function shuffleArrayCopy(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
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
  }
  if (isOrderingQuestion(q)) {
    return { ...base, orderItems: [...q.orderItems] }
  }
  return {
    ...base,
    choices: q.choices,
    correctIndex: q.correctIndex,
  }
}
