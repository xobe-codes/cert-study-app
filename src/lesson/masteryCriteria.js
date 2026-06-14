import { RATING_CONFIDENCE, computeMastery } from '../netUtils.js'

/** Checklist rows for objective mastery (matches computeMastery thresholds). */
export function getMasteryChecklist(entry) {
  const scores = entry?.quizScores || []
  const ratings = entry?.confidenceRatings || []
  const recent = scores.slice(-3)
  const acc = recent.length
    ? recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
    : 0
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0
  const fullSession = recent.some(r => r.total >= 3)
  const { mastered } = computeMastery(entry || {})

  return [
    { id: 'accuracy', label: '≥80% accuracy (last 3 sessions)', met: acc >= 0.8, detail: recent.length ? `${Math.round(acc * 100)}%` : '—' },
    { id: 'confidence', label: '≥50% confidence rating', met: conf >= 0.5, detail: ratings.length ? `${Math.round(conf * 100)}%` : '—' },
    { id: 'session', label: 'Full quiz session (3+ questions)', met: fullSession, detail: fullSession ? '✓' : '—' },
    { id: 'mastered', label: 'Topic marked mastered', met: mastered, detail: mastered ? '✓' : '—' },
  ]
}
