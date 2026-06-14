/**
 * Shared helpers for clean question-bank build + validation.
 * Used by buildCleanBank.mjs, validateCleanBank.mjs, enrichAnswerReview.mjs.
 */

export const SCHEMA_VERSION = 'ccna-clean-question-bank-v1'

export const DOMAIN_4_OBJECTIVES = ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10']
export const DOMAIN_3_OBJECTIVES = ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6']
export const DOMAIN_2_OBJECTIVES = ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8']
export const DOMAIN_5_OBJECTIVES = ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10', '5.11']
export const DOMAIN_6_OBJECTIVES = ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6']
export const DOMAIN_1_OBJECTIVES = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12']

export const DOMAIN_4_SOURCE_FILES = [
  { appId: '4.1', file: 'domain4-ip-services-validation/objective-4.1-nat-inside-source-source-questions.json' },
  { appId: '4.2', file: 'domain4-ip-services-validation/objective-4.2-ntp-client-server-source-questions.json' },
  { appId: '4.3', file: 'domain4-ip-services-validation/objective-4.3-dhcp-dns-roles-source-questions.json' },
  { appId: '4.4', file: 'domain4-ip-services-validation/objective-4.4-snmp-network-operations-source-questions.json' },
  { appId: '4.5', file: 'domain4-ip-services-validation/objective-4.5-syslog-features-source-questions.json' },
  { appId: '4.6', file: 'domain4-ip-services-validation/objective-4.6-dhcp-client-relay-source-questions.json' },
  { appId: '4.7', file: 'domain4-ip-services-validation/objective-4.7-qos-phb-source-questions.json' },
  { appId: '4.8', file: 'domain4-ip-services-validation/objective-4.8-ssh-remote-access-source-questions.json' },
  { appId: '4.9', file: 'domain4-ip-services-validation/objective-4.9-tftp-ftp-source-questions.json' },
]

export const QUESTION_TYPE_MAP = {
  scenario: 'scenario',
  'output-interpretation': 'application',
  'command-analysis': 'application',
  'multiple-choice-single': 'definition',
}

export const DIFFICULTY_MAP = {
  'exam-ready': 'hard',
}

export const EXHIBIT_STEM_PATTERNS = [
  /referenced source exhibit/i,
  /following exhibit/i,
  /exhibit below/i,
  /shown in the exhibit/i,
]

export const LEAK_PATTERNS = [
  /source answer/i,
  /correct selection/i,
  /referenced source exhibit/i,
  /the source maps/i,
  /validation package/i,
  /source maps this item/i,
  /remains in the source pdf/i,
  /source exhibit identifies/i,
]

export const PLACEHOLDER_EXPLANATION_PATTERNS = [
  /^The source maps this item to answer/i,
  /^Source maps Chapter/i,
]

export function ckuToConcept(ckuId) {
  if (!ckuId) return undefined
  return ckuId.replace(/^CKU-/, '').toLowerCase().replace(/-/g, ' ')
}

export function isExhibitDependent(question) {
  const stem = question.question || question.stem || ''
  if (EXHIBIT_STEM_PATTERNS.some(re => re.test(stem))) return true
  if (question.qualityFlags?.exhibitRequired === true) return true
  return false
}

export function hasLeakText(text) {
  if (!text || typeof text !== 'string') return false
  return LEAK_PATTERNS.some(re => re.test(text))
}

export function isPlaceholderExplanation(text) {
  if (!text || typeof text !== 'string') return false
  return PLACEHOLDER_EXPLANATION_PATTERNS.some(re => re.test(text.trim()))
}

export function scrubExplanation(text) {
  if (!text || typeof text !== 'string') return ''
  let out = text.trim()
  if (isPlaceholderExplanation(out)) return ''
  if (/source answer/i.test(out)) return ''
  if (/The\s+is:/i.test(out)) return ''
  for (const re of LEAK_PATTERNS) {
    out = out.replace(re, '')
  }
  return out.trim()
}

export function convertSourceQuestion(q, objectiveId) {
  const correctId = q.correctChoiceIds?.[0]
  const correctIndex = q.choices.findIndex(c => c.id === correctId || c.isCorrect)
  const explanation = scrubExplanation(q.explanation || q.sourceAnswerText || '')
  return {
    id: q.id || `${objectiveId}-q-${correctIndex}`,
    question: q.stem,
    choices: q.choices.map(c => c.text),
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation,
    type: QUESTION_TYPE_MAP[q.questionType] || q.questionType || 'definition',
    difficulty: DIFFICULTY_MAP[q.difficulty] || q.difficulty || 'medium',
    concept: ckuToConcept(q.ckuIds?.[0]),
    ckuIds: q.ckuIds || [],
    ...(q.answerReview ? { answerReview: q.answerReview } : {}),
    ...(explanation === '' ? { needsExplanationReview: true } : {}),
  }
}

/** Normalize an app-shaped question (e.g. from ccnaCurated) into clean-bank shape. */
export function cleanAppQuestion(q, objectiveId) {
  const explanation = scrubExplanation(q.explanation || '')
  const clean = {
    id: q.id || `${objectiveId}-q-unknown`,
    question: q.question,
    choices: q.choices,
    correctIndex: q.correctIndex,
    explanation,
    type: q.type,
    difficulty: q.difficulty,
    concept: q.concept,
    ...(q.skill ? { skill: q.skill } : {}),
    ...(q.ckuIds?.length ? { ckuIds: q.ckuIds } : {}),
    ...(q.answerReview ? { answerReview: q.answerReview } : {}),
  }
  if (!explanation || isPlaceholderExplanation(q.explanation || '')) {
    clean.needsExplanationReview = true
  }
  return clean
}

export function validateCleanQuestion(q, objectiveId) {
  const errors = []
  const where = `${objectiveId}/${q.id || 'no-id'}`

  if (!q.id) errors.push(`${where}: missing id`)
  if (!q.question?.trim()) errors.push(`${where}: empty question`)
  if (!Array.isArray(q.choices) || q.choices.length < 2) errors.push(`${where}: need >= 2 choices`)
  if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= (q.choices?.length || 0)) {
    errors.push(`${where}: invalid correctIndex`)
  }

  const texts = [q.question, q.explanation, ...(q.choices || [])]
  if (q.answerReview?.correct?.explanation) texts.push(q.answerReview.correct.explanation)
  for (const item of q.answerReview?.incorrect || []) {
    if (item.explanation) texts.push(item.explanation)
    if (item.misconceptionTested) texts.push(item.misconceptionTested)
  }
  if (q.answerReview?.examTip) texts.push(q.answerReview.examTip)
  if (q.answerReview?.memoryHook) texts.push(q.answerReview.memoryHook)

  for (const text of texts) {
    if (hasLeakText(text)) errors.push(`${where}: source metadata leak in text`)
  }

  if (isExhibitDependent(q)) errors.push(`${where}: exhibit-dependent question in active clean bank`)

  if (q.answerReview) {
    const wrongIndexes = new Set(
      (q.choices || []).map((_, i) => i).filter(i => i !== q.correctIndex),
    )
    const covered = new Set((q.answerReview.incorrect || []).map(i => i.choiceIndex))
    for (const idx of wrongIndexes) {
      if (!covered.has(idx)) errors.push(`${where}: answerReview missing incorrect for choiceIndex ${idx}`)
    }
  }

  return errors
}

export function shelvedRecord(q, objectiveId, reason, notes = '') {
  const promoteHint = reason === 'exhibit-dependent'
    ? 'Add an inline exhibit in scripts/lib/exhibitConverters.mjs, then run: npm run promote:shelved'
    : reason === 'out-of-scope'
      ? 'Confirm CCNA objective mapping, add to data/shelved-questions/approved-promotions.json, then run: npm run promote:shelved'
      : 'Review in Extra Study, then promote via script when ready'
  return {
    id: q.id,
    objectiveId,
    reason,
    notes,
    shelvedAt: new Date().toISOString().slice(0, 10),
    promoteHint,
    question: q.question,
    choices: q.choices,
    correctIndex: q.correctIndex,
    explanation: q.explanation || '',
    type: q.type,
    difficulty: q.difficulty,
    concept: q.concept,
    ...(q.ckuIds?.length ? { ckuIds: q.ckuIds } : {}),
    ...(q.skill ? { skill: q.skill } : {}),
  }
}
