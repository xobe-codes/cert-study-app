import { RATING_CONFIDENCE, computeMastery } from '../netUtils.js'

function readComplete(entry) {
  if (entry?.studySectionsViewed) return true
  if (entry?.testedOut) return true
  if (entry?.lastSeen && entry?.readingTier) return true
  if (entry?.lastSeen && entry?.preAssessPct != null) return true
  return false
}

/** 3-step checklist: read → practice pass → mastered. */
export function getMasteryChecklist(entry) {
  const scores = entry?.quizScores || []
  const recent = scores.slice(-3)
  const acc = recent.length
    ? recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
    : 0
  const fullSession = recent.some(r => r.total >= 3)
  const practicePass = acc >= 0.8 && fullSession
  const { mastered } = computeMastery(entry || {})

  return [
    { id: 'read', label: 'Complete reading', met: readComplete(entry), detail: readComplete(entry) ? '✓' : '—' },
    { id: 'practice', label: 'Pass practice (≥80%)', met: practicePass, detail: recent.length ? `${Math.round(acc * 100)}%` : '—' },
    { id: 'mastered', label: 'Topic mastered', met: mastered, detail: mastered ? '✓' : '—' },
  ]
}
