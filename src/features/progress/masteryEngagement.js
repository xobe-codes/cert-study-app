import { computeMastery, masteryScoreSessions, RATING_CONFIDENCE } from '../../netUtils.js'

export { computeMastery, masteryScoreSessions }

export const ENGAGEMENT_KINDS = {
  QUIZ: 'quiz',
  REVIEW: 'review',
  TRAP_DRILL: 'trap_drill',
  EXAM_TRAP: 'exam_trap',
  LAB: 'lab',
  CLI_DRILL: 'cli_drill',
  COMMAND_SPRINT: 'command_sprint',
  MOCK: 'mock',
  DOMAIN_PASS: 'domain_pass',
  DOMAIN_PLACEMENT: 'domain_placement',
  FOCUS: 'focus',
  TOPIC_FOCUS: 'topic_focus',
  TERMS: 'terms',
  MISSED_RETEST: 'missed_retest',
  ROUTING_DECODER: 'routing_decoder',
  COMMAND_DRILL: 'command_drill',
}

export const ENGAGEMENT_KIND_LABELS = {
  [ENGAGEMENT_KINDS.QUIZ]: 'Quiz',
  [ENGAGEMENT_KINDS.REVIEW]: 'Review',
  [ENGAGEMENT_KINDS.TRAP_DRILL]: 'Trap drill',
  [ENGAGEMENT_KINDS.EXAM_TRAP]: 'Exam traps',
  [ENGAGEMENT_KINDS.LAB]: 'Lab',
  [ENGAGEMENT_KINDS.CLI_DRILL]: 'CLI drill',
  [ENGAGEMENT_KINDS.COMMAND_SPRINT]: 'Command Sprint',
  [ENGAGEMENT_KINDS.MOCK]: 'Mock exam',
  [ENGAGEMENT_KINDS.DOMAIN_PASS]: 'Domain pass',
  [ENGAGEMENT_KINDS.DOMAIN_PLACEMENT]: 'Placement',
  [ENGAGEMENT_KINDS.FOCUS]: 'Weak areas',
  [ENGAGEMENT_KINDS.TOPIC_FOCUS]: 'Topic focus',
  [ENGAGEMENT_KINDS.TERMS]: 'Terms Hub',
  [ENGAGEMENT_KINDS.MISSED_RETEST]: 'Missed retest',
  [ENGAGEMENT_KINDS.ROUTING_DECODER]: 'Routing Table Decoder',
  [ENGAGEMENT_KINDS.COMMAND_DRILL]: 'Command Drill',
}

const MAX_ENGAGEMENT = 40

export function buildEngagementScore({ kind, correct, total, date = Date.now() }) {
  const score = Math.max(0, Number(correct) || 0)
  const denom = Math.max(1, Number(total) || 1)
  return { kind, score, total: denom, date }
}

export function buildEngagementProgressPatch(entry, activity) {
  const engagementScores = [
    ...(entry?.engagementScores || []),
    buildEngagementScore(activity),
  ].slice(-MAX_ENGAGEMENT)

  const merged = {
    ...entry,
    engagementScores,
    lastSeen: Date.now(),
  }

  if (activity.kind === ENGAGEMENT_KINDS.LAB) merged.labCompleted = true
  if (activity.kind === ENGAGEMENT_KINDS.EXAM_TRAP) {
    merged.examTrapsViewed = (merged.examTrapsViewed || 0) + 1
  }
  if (activity.kind === ENGAGEMENT_KINDS.CLI_DRILL) merged.cliDrillCompleted = true
  if (activity.kind === ENGAGEMENT_KINDS.COMMAND_SPRINT) merged.commandSprintCompleted = true

  const prevMastered = computeMastery(entry || {}).mastered
  const { score: masteryScore, mastered } = computeMastery(merged)
  const hadActivity = masteryScoreSessions(merged).length > 0

  return {
    engagementScores,
    lastSeen: merged.lastSeen,
    labCompleted: merged.labCompleted,
    examTrapsViewed: merged.examTrapsViewed,
    cliDrillCompleted: merged.cliDrillCompleted,
    commandSprintCompleted: merged.commandSprintCompleted,
    masteryScore,
    status: mastered ? 'mastered' : (hadActivity ? 'in_progress' : (entry?.status || 'unseen')),
    justMastered: mastered && !prevMastered,
  }
}

/** Aggregate per-objective scores from a multi-question session. */
export function aggregateSessionByObjective(questions, responses, kind, isCorrectFn) {
  const byObj = {}
  questions.forEach((q, i) => {
    const objectiveId = q?.objectiveId
    if (!objectiveId) return
    if (!byObj[objectiveId]) byObj[objectiveId] = { correct: 0, total: 0 }
    byObj[objectiveId].total += 1
    if (isCorrectFn(q, responses[i], i)) byObj[objectiveId].correct += 1
  })
  return Object.entries(byObj).map(([objectiveId, { correct, total }]) => ({
    objectiveId,
    activity: { kind, correct, total },
  }))
}

export function getEngagementSources(entry) {
  const sources = new Set()
  if ((entry?.quizScores || []).length) sources.add(ENGAGEMENT_KINDS.QUIZ)
  for (const s of entry?.engagementScores || []) {
    if (s.kind) sources.add(s.kind)
  }
  return [...sources].map(k => ENGAGEMENT_KIND_LABELS[k] || k)
}

export function hasMasteryActivity(entry) {
  return masteryScoreSessions(entry).length > 0
}

export { RATING_CONFIDENCE }
