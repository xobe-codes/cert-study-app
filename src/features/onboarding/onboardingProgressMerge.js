import { computeMastery } from '../../netUtils.js'

/**
 * Merge placement-check results into progress, same for a first pass or a
 * replay — a retake is a real answer set and must update mastery like any
 * other quiz result. Pulled out of useAppOnboarding's finishOnboarding so the
 * merge (once silently skipped on replay) is directly testable without
 * React hook machinery, which this repo has no rendering harness for.
 */
export function mergeOnboardingResultsIntoProgress(prev, results) {
  const next = { ...prev }
  for (const [objectiveId, r] of Object.entries(results || {})) {
    const entry = next[objectiveId] || { status: 'unseen', quizScores: [] }
    const newScores = [...(entry.quizScores || []), { score: r.correct, total: r.total, date: Date.now() }]
    const { score: masteryScore, mastered } = computeMastery({
      quizScores: newScores,
      confidenceRatings: entry.confidenceRatings || [],
    })
    next[objectiveId] = {
      ...entry,
      status: mastered ? 'mastered' : 'in_progress',
      quizScores: newScores,
      masteryScore,
      lastSeen: Date.now(),
    }
  }
  return next
}
