import { useCallback } from 'react'
import { NAV_HINT_KEYS } from '../../ui/navHintConfig.js'

export function useObjectiveQuizProgress({
  objective,
  progress,
  status,
  nextObj,
  computeMastery,
  onUpdateProgress,
  logEvent,
  masteryGate,
  enableSectionReview,
  isOffline,
  apiOnline,
  premiumUnlocked,
  curated,
  onPackage,
  celebrate,
  haptic,
  bumpSessionStudy,
  showNavHint,
}) {
  return useCallback((stats) => {
    const entry = progress[objective.id] || {}
    const newScores = [...(entry.quizScores || []), { score: stats.correct, total: stats.total, date: Date.now() }]
    const newRatings = [...(entry.confidenceRatings || []), ...(stats.ratings || [])].slice(-30)
    const { score: masteryScore, mastered } = computeMastery({ quizScores: newScores, confidenceRatings: newRatings })
    onUpdateProgress(objective.id, {
      status: mastered ? 'mastered' : 'in_progress',
      quizScores: newScores,
      confidenceRatings: newRatings,
      masteryScore,
      lastSeen: Date.now(),
    })
    logEvent('user_completed_quiz', { objectiveId: objective.id, correct: stats.correct, total: stats.total, masteryScore })
    const sessionAcc = stats.total ? stats.correct / stats.total : 0
    if (sessionAcc >= masteryGate && !entry.reviewEligible) {
      enableSectionReview(objective.id)
      onUpdateProgress(objective.id, { reviewEligible: true })
    }
    const justMastered = mastered && status !== 'mastered'
    if (justMastered) {
      celebrate()
      haptic([12, 40, 12, 40, 18])
      bumpSessionStudy('mastered', objective.id)
      showNavHint(NAV_HINT_KEYS.QUIZ_MASTERED, { nextId: nextObj?.id })
    }
    if (mastered && !isOffline && apiOnline && premiumUnlocked && !curated) onPackage?.(objective)
    return justMastered
  }, [
    objective,
    progress,
    status,
    nextObj,
    computeMastery,
    onUpdateProgress,
    logEvent,
    masteryGate,
    enableSectionReview,
    isOffline,
    apiOnline,
    premiumUnlocked,
    curated,
    onPackage,
    celebrate,
    haptic,
    bumpSessionStudy,
    showNavHint,
  ])
}
