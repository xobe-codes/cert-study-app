import { RATING_CONFIDENCE, computeMastery, masteryScoreSessions } from '../netUtils.js'

/** Separate accuracy vs confidence (for quadrant charts and review set picking). */
export function masteryBreakdown(entry) {
  const scores = masteryScoreSessions(entry)
  if (scores.length === 0) return { acc: 0, conf: 0, has: false }
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  return { acc, conf, has: true }
}

function readComplete(entry) {
  if (entry?.studySectionsViewed) return true
  if (entry?.testedOut) return true
  if (entry?.examTrapsViewed > 0) return true
  if (entry?.labCompleted) return true
  if (entry?.lastSeen && entry?.readingTier) return true
  if (entry?.lastSeen && entry?.preAssessPct != null) return true
  return false
}

/** Checklist: read → practice → (lab/sprint when done) → mastered. */
export function getMasteryChecklist(entry) {
  const scores = masteryScoreSessions(entry)
  const recent = scores.slice(-3)
  const acc = recent.length
    ? recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
    : 0
  const fullSession = recent.some(r => r.total >= 3)
  const practicePass = acc >= 0.8 && fullSession
  const { mastered } = computeMastery(entry || {})

  const rows = [
    { id: 'read', label: 'Complete reading', met: readComplete(entry), detail: readComplete(entry) ? '✓' : '—' },
    { id: 'practice', label: 'Pass practice (≥80%)', met: practicePass, detail: recent.length ? `${Math.round(acc * 100)}%` : '—' },
  ]
  // Surface completed lab/sprint only — avoid empty circles on every objective.
  if (entry?.labCompleted) {
    rows.push({ id: 'lab', label: 'Complete a lab', met: true, detail: '✓' })
  }
  if (entry?.commandSprintCompleted) {
    rows.push({ id: 'sprint', label: 'Command sprint', met: true, detail: '✓' })
  }
  // Confidence gate is invisible without this row — surface it only once there's activity to rate.
  if (scores.length > 0) {
    const ratings = entry?.confidenceRatings || []
    const conf = ratings.length
      ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
      : 0.6
    rows.push({ id: 'confidence', label: 'Rate answers confidently', met: conf >= 0.5, detail: ratings.length ? `${Math.round(conf * 100)}%` : '—' })
  }
  rows.push({ id: 'mastered', label: 'Topic mastered', met: mastered, detail: mastered ? '✓' : '—' })
  return rows
}
