import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'

export const LEARNING_EVENT_SCHEMA_VERSION = 2

const DOMAIN_BY_OBJECTIVE = new Map(ALL_OBJECTIVES.map(o => [o.id, o.domainId]))

function unique(values = []) {
  return [...new Set(values.filter(Boolean))]
}

export function normalizeLearningEvent(raw = {}, index = 0) {
  const at = Number(raw.at || raw.timestamp || 0)
  const objectiveId = raw.objectiveId || raw.metadata?.objectiveId
  const contentId = raw.questionId || raw.labId || raw.lessonAnchor || raw.targetId
  return {
    ...raw,
    eventId: raw.eventId || raw.id || `legacy-${at}-${raw.type || 'event'}-${contentId || index}`,
    schemaVersion: Number(raw.schemaVersion || 1),
    at,
    surface: raw.surface || raw.source || 'legacy',
    domainId: raw.domainId || DOMAIN_BY_OBJECTIVE.get(objectiveId),
    objectiveId,
    ckuIds: unique(raw.ckuIds || (raw.ckuId ? [raw.ckuId] : [])),
    contentVersion: raw.contentVersion || 'legacy',
  }
}

export function dedupeLearningEvents(events = []) {
  const seen = new Set()
  return events.map(normalizeLearningEvent).filter(event => {
    if (seen.has(event.eventId)) return false
    seen.add(event.eventId)
    return true
  })
}

function percent(numerator, denominator) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : null
}

function isExcluded(event) {
  return event.quarantined === true || event.invalid === true || event.synced === false
}

export function reconcileLearningMetrics(rawEvents = []) {
  const events = dedupeLearningEvents(rawEvents)
  const eligible = events.filter(event => !isExcluded(event))
  const questionAttempts = eligible.filter(event => event.type === 'user_answered_question' && !event.unknown)
  const firstByQuestion = new Map()
  for (const event of questionAttempts) {
    const key = `${event.surface}:${event.questionId}`
    if (!firstByQuestion.has(key)) firstByQuestion.set(key, event)
  }
  const firstAttempts = [...firstByQuestion.values()]
  const labStarts = eligible.filter(event => event.type === 'user_started_lab')
  const labAttempts = eligible.filter(event => event.type === 'user_attempted_lab_checkpoint')
  const labCompletions = eligible.filter(event => event.type === 'user_completed_lab')
  const startedLabIds = new Set(labStarts.map(event => event.labId).filter(Boolean))
  const completedLabIds = new Set(labCompletions.map(event => event.labId).filter(Boolean))
  const lessonViews = eligible.filter(event => event.type === 'user_viewed_lesson_section')
  const remediationOpens = eligible.filter(event => event.type === 'user_opened_lesson_remediation' || event.type === 'user_opened_lab_remediation')

  const perDomain = {}
  for (const event of questionAttempts) {
    if (!event.domainId) continue
    const row = perDomain[event.domainId] || { attempts: 0, correct: 0 }
    row.attempts += 1
    row.correct += event.correct ? 1 : 0
    perDomain[event.domainId] = row
  }
  for (const row of Object.values(perDomain)) row.accuracy = percent(row.correct, row.attempts)

  return {
    schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
    sourceEvents: rawEvents.length,
    uniqueEvents: events.length,
    excludedEvents: events.length - eligible.length,
    questions: {
      attempts: questionAttempts.length,
      correct: questionAttempts.filter(event => event.correct).length,
      accuracy: percent(questionAttempts.filter(event => event.correct).length, questionAttempts.length),
      firstTryCorrect: firstAttempts.filter(event => event.correct).length,
      firstTryAccuracy: percent(firstAttempts.filter(event => event.correct).length, firstAttempts.length),
      unknown: eligible.filter(event => event.type === 'user_answered_question' && event.unknown).length,
    },
    labs: {
      starts: labStarts.length,
      checkpointAttempts: labAttempts.length,
      checkpointSuccesses: labAttempts.filter(event => event.accepted).length,
      checkpointAccuracy: percent(labAttempts.filter(event => event.accepted).length, labAttempts.length),
      completions: labCompletions.length,
      completionRate: percent([...completedLabIds].filter(id => startedLabIds.has(id)).length, startedLabIds.size),
    },
    lessons: {
      sectionViews: lessonViews.length,
      uniqueAnchorsViewed: new Set(lessonViews.map(event => event.lessonAnchor).filter(Boolean)).size,
    },
    remediation: { opens: remediationOpens.length },
    perDomain,
  }
}
