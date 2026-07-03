import { useState, useEffect, useCallback } from 'react'
import { preloadCleanBank } from '../../data/cleanQuestionAdapter.js'
import { loadProgress, loadMissed, loadStreak, bumpStreak } from '../../storage/appPersistence.js'
import { loadOfflineReadyIds } from '../../offline/objectivePackaging.js'
import { countDueQuestions } from '../../quiz/srsReview.js'
import { loadPremiumUnlocked } from '../../premium/premiumFeatures.js'
import {
  loadReduceMotion,
  applyReduceMotionPreference,
} from '../../settings/settingsActions.js'
import { flushQuestionFlagQueue } from '../../quiz/questionHealthClient.js'
import { warmCuratedChunksForOffline } from '../../offline/warmCuratedChunks.js'
import { parseAppHash } from '../../routing/appHashRouting.js'
import { resolveOnboardingBootstrap } from '../onboarding/useAppOnboarding.js'
import { checkApiReachable } from '../../ai/claudeClient.js'
import { STORAGE_KEYS } from '../../storageKeys.js'

/**
 * App bootstrap — initial data load, preload, theme init, API health polling.
 * Extracted from App.jsx to keep the root component focused on rendering.
 */
export function useAppBootstrap({
  setView,
  setReturnToView,
  setSelectedObjective,
}) {
  const [progress, setProgress] = useState({})
  const [missed, setMissed] = useState([])
  const [streak, setStreak] = useState({ count: 0, lastStudyDate: null })
  const [loaded, setLoaded] = useState(false)
  const [offlineReady, setOfflineReady] = useState(() => new Set())
  const [dueCount, setDueCount] = useState(0)
  const [premiumUnlocked, setPremiumUnlocked] = useState(false)
  const [apiOnline, setApiOnline] = useState(true)
  const [theme, setTheme] = useState(() =>
    (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark')

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', next === 'dark' ? '#2a1229' : '#f5f0f8')
      window.storage.setItem(STORAGE_KEYS.theme, next)
      return next
    })
  }, [])

  const refreshOffline = useCallback(async () => {
    setOfflineReady(await loadOfflineReadyIds())
  }, [])

  const refreshDue = useCallback(async () => {
    setDueCount(await countDueQuestions())
  }, [])

  // Preload clean-question chunk during idle time
  useEffect(() => {
    const run = () => { preloadCleanBank().catch(() => {}) }
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 4000 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(run, 1500)
    return () => clearTimeout(t)
  }, [])

  // Main bootstrap — load all persisted state
  useEffect(() => {
    (async () => {
      const [p, m, s, off, due, premium] = await Promise.all([
        loadProgress(), loadMissed(), loadStreak(), loadOfflineReadyIds(),
        countDueQuestions(), loadPremiumUnlocked(),
      ])
      setProgress(p)
      setMissed(m)
      setStreak(s)
      setOfflineReady(off)
      setDueCount(due)
      setPremiumUnlocked(premium)
      setLoaded(true)
      flushQuestionFlagQueue().catch(() => {})
      const reduceMotion = await loadReduceMotion()
      applyReduceMotionPreference(reduceMotion)
      const onboardingView = await resolveOnboardingBootstrap(p)
      if (onboardingView) {
        setView(onboardingView)
      } else if (Object.keys(p).length > 0) {
        const hashRoute = parseAppHash()
        if (hashRoute?.objective) {
          setReturnToView('home')
          setSelectedObjective(hashRoute.objective)
          setView('objective')
        } else if (hashRoute?.view) {
          setReturnToView('home')
          setView(hashRoute.view)
        }
      }
      const updatedStreak = await bumpStreak()
      setStreak(updatedStreak)
      warmCuratedChunksForOffline()
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Periodically check API reachability for the offline banner
  useEffect(() => {
    let cancelled = false
    async function check() {
      const online = await checkApiReachable()
      if (!cancelled) setApiOnline(online)
    }
    check()
    const id = setInterval(check, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return {
    progress,
    setProgress,
    missed,
    setMissed,
    streak,
    setStreak,
    loaded,
    offlineReady,
    dueCount,
    setDueCount,
    premiumUnlocked,
    setPremiumUnlocked,
    apiOnline,
    theme,
    toggleTheme,
    refreshOffline,
    refreshDue,
  }
}
