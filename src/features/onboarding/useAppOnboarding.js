import { useState, useCallback, useEffect, useRef } from 'react'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { saveProgress } from '../../storage/appPersistence.js'
import { loadTourDone, saveTourDone } from '../../settings/settingsActions.js'
import { logEvent } from '../../eventLog.js'
import { mergeOnboardingResultsIntoProgress } from './onboardingProgressMerge.js'
import { loadAllPlacementRecords } from '../domainPlacement/domainPlacementStorage.js'
import { getNextUncheckedBaselineDomain } from '../domainPlacement/domainBaselineStudyPlan.js'

/** Placement onboarding + product tour — extracted from App.jsx (P8). */
export function useAppOnboarding({ loaded, view, setView, setProgress }) {
  const onboardingReplayRef = useRef(false)
  const tourQueuedRef = useRef(false)
  const [showTour, setShowTour] = useState(false)

  const finishOnboarding = useCallback(async (results) => {
    const wasReplay = onboardingReplayRef.current
    // Recording the quiz results is not first-time-only setup — a replay is a
    // real retake and its answers must update mastery the same way the first
    // pass does. Onboarding.jsx's completion screen tells the learner their
    // progress was saved regardless of replay status, so this used to make
    // that claim false: retaking silently discarded every answer.
    setProgress(prev => {
      const next = mergeOnboardingResultsIntoProgress(prev, results)
      saveProgress(next)
      return next
    })
    logEvent(wasReplay ? 'user_replayed_onboarding' : 'user_completed_onboarding', {
      objectivesCovered: Object.keys(results || {}).length,
    })
    onboardingReplayRef.current = false
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    if (!wasReplay) {
      tourQueuedRef.current = true
      setShowTour(true)
      const records = await loadAllPlacementRecords()
      const nextDomain = getNextUncheckedBaselineDomain(records)
      if (nextDomain) {
        await window.storage.setItem(STORAGE_KEYS.baselineHandoff, {
          domainId: nextDomain.id,
          at: Date.now(),
        })
      }
    }
    setView('home')
  }, [setProgress, setView])

  const skipOnboarding = useCallback(async () => {
    onboardingReplayRef.current = false
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    logEvent('user_skipped_onboarding', {})
    const records = await loadAllPlacementRecords()
    const nextDomain = getNextUncheckedBaselineDomain(records)
    if (nextDomain) {
      await window.storage.setItem(STORAGE_KEYS.baselineHandoff, {
        domainId: nextDomain.id,
        at: Date.now(),
      })
    }
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
