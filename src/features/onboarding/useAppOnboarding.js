import { useState, useCallback, useEffect, useRef } from 'react'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { saveProgress } from '../../storage/appPersistence.js'
import { loadTourDone, saveTourDone } from '../../settings/settingsActions.js'
import { computeMastery } from '../../netUtils.js'
import { logEvent } from '../../eventLog.js'

/** Placement onboarding + product tour — extracted from App.jsx (P8). */
export function useAppOnboarding({ loaded, view, setView, setProgress }) {
  const onboardingReplayRef = useRef(false)
  const tourQueuedRef = useRef(false)
  const [showTour, setShowTour] = useState(false)

  const finishOnboarding = useCallback(async (results) => {
    if (!onboardingReplayRef.current) {
      setProgress(prev => {
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
        saveProgress(next)
        return next
      })
      logEvent('user_completed_onboarding', { objectivesCovered: Object.keys(results || {}).length })
    } else {
      logEvent('user_replayed_onboarding', { objectivesCovered: Object.keys(results || {}).length })
    }
    const wasReplay = onboardingReplayRef.current
    onboardingReplayRef.current = false
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    if (!wasReplay) {
      tourQueuedRef.current = true
      setShowTour(true)
    }
    setView('home')
  }, [setProgress, setView])

  const skipOnboarding = useCallback(async () => {
    onboardingReplayRef.current = false
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    logEvent('user_skipped_onboarding', {})
    setView('home')
  }, [setView])

  const replayPlacementCheck = useCallback(() => {
    onboardingReplayRef.current = true
    setView('onboarding')
  }, [setView])

  const completeTour = useCallback(async () => {
    await saveTourDone(true)
    setShowTour(false)
  }, [])

  const skipTour = useCallback(async () => {
    await saveTourDone(true)
    setShowTour(false)
  }, [])

  const showTourAgain = useCallback(() => {
    setShowTour(true)
  }, [])

  useEffect(() => {
    if (!loaded || view !== 'home' || showTour || tourQueuedRef.current) return undefined
    let cancelled = false
    ;(async () => {
      const tourDone = await loadTourDone()
      if (!cancelled && !tourDone) {
        tourQueuedRef.current = true
        setShowTour(true)
      }
    })()
    return () => { cancelled = true }
  }, [loaded, view, showTour])

  return {
    showTour,
    finishOnboarding,
    skipOnboarding,
    replayPlacementCheck,
    completeTour,
    skipTour,
    showTourAgain,
  }
}

/** First-load onboarding gate — call once after progress is loaded. */
export async function resolveOnboardingBootstrap(progress) {
  const onboardDone = await window.storage.getItem(STORAGE_KEYS.onboardDone)
  if (onboardDone) return null
  if (Object.keys(progress).length === 0) return 'onboarding'
  await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
  return null
}
