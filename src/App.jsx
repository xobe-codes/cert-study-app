import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { preloadCleanBank, getCleanBankStats } from './data/cleanQuestionAdapter.js'
import { DOMAINS, ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { useVisualViewportBottomInset } from './ui/visualViewportInset.js'
import { celebrate, haptic } from './ui/feedbackHelpers.jsx'
import { STORAGE_KEYS, TRAP_DRILL_PREFILL_EVENT } from './storageKeys.js'
import Spinner from './components/Spinner.jsx'
import { DEFAULT_QUIZ_SESSION_SIZE, clampQuizSessionSize, loadQuizSessionSize, saveQuizSessionSize } from './quizSessionConfig.js'
import { loadDueQuestions, countDueQuestions } from './quiz/srsReview.js'
import { NavHintProvider } from './components/NavHintProvider.jsx'
import StudyBlockProvider from './components/StudyBlockProvider.jsx'
import RouteShell from './components/RouteShell.jsx'
import AppShell from './features/shell/AppShell.jsx'
import AppShellStyles from './features/shell/AppShellStyles.jsx'
import {
  loadPremiumUnlocked,
  savePremiumUnlocked,
  logPremiumBlocked,
  PREMIUM_FEATURES,
  PREMIUM_COMING_SOON_LABEL,
} from './premium/premiumFeatures.js'
import BottomNav from './components/BottomNav.jsx'
import StudyModeRoutes from './features/study/StudyModeRoutes.jsx'
import AppChromeOverlays from './features/shell/AppChromeOverlays.jsx'
import CoreStudyRoutes from './features/shell/CoreStudyRoutes.jsx'
import { loadDomainPassRecords, countPassedDomains } from './features/domainPass/domainPassStorage.js'
import { warmCuratedChunksForOffline } from './offline/warmCuratedChunks.js'
import { packageObjectiveOffline, loadOfflineReadyIds } from './offline/objectivePackaging.js'
import { loadProgress, saveProgress, loadMissed, saveMissed, loadStreak, saveStreak, bumpStreak } from './storage/appPersistence.js'
import { parseAppHash, syncAppHash } from './routing/appHashRouting.js'
import { flushQuestionFlagQueue } from './quiz/questionHealthClient.js'
import { NAV_HINT_KEYS } from './ui/navHintConfig.js'
import {
  loadExamDate,
  saveExamDate,
  clearExamDate,
  loadReduceMotion,
  saveReduceMotion,
  applyReduceMotionPreference,
  clearTutorChat,
  clearAiCaches,
  resetStudyProgress,
  loadQuizSessionSizePref,
  saveQuizSessionSizePref,
  loadTourDone,
  saveTourDone,
  loadExamMode,
  saveExamMode,
} from './settings/settingsActions.js'
import { importCcnaJsonFromFile } from './features/export/importCcnaJson.js'
import { useGlobalSearchHotkey } from './features/search/useGlobalSearchHotkey.js'
import OfflineBanner from './features/shell/OfflineBanner.jsx'
import PracticeRoutes from './features/practice/PracticeRoutes.jsx'
import {
  generateSyncCode, loadSyncBundle, saveSyncBundle, mergeSyncData, pullSync, pushSync,
} from './features/sync/syncMerge.js'
import { bumpSessionStudy } from './home/sessionRecap.js'
import pkg from '../package.json'
import { checkApiReachable } from './ai/claudeClient.js'
import { computeMastery } from './netUtils.js'
import { logEvent } from './eventLog.js'

const PREMIUM_TOAST_MESSAGES = {
  [PREMIUM_FEATURES.tutor]: 'AI Tutor and Study Lens synthesis unlock with supporter access.',
  [PREMIUM_FEATURES.mock_interview]: 'Live AI exam-day interview practice unlocks with supporter access.',
  [PREMIUM_FEATURES.offline_pack]: 'Offline AI packaging is a premium feature.',
  [PREMIUM_FEATURES.ai_visual]: 'Custom AI visuals require supporter access.',
  [PREMIUM_FEATURES.ai_terms]: 'AI key-term flashcards require supporter access.',
  [PREMIUM_FEATURES.ai_explain]: 'AI-generated explanations require supporter access.',
  [PREMIUM_FEATURES.quiz_generate]: 'Generating new quiz questions is a premium feature.',
  [PREMIUM_FEATURES.donate_preview]: 'Donations are not enabled yet — thank you for your interest.',
}



/* =========================================================================
   APP ROOT
   ========================================================================= */
export default function App() {
  const [view, setView] = useState('home') // home | objective | mock | mockinterview | missed | tutor | ...
  const [returnToView, setReturnToView] = useState('home')
  const [topicFocusConfig, setTopicFocusConfig] = useState(null)
  const [examTrapPrefill, setExamTrapPrefill] = useState(null)
  const [trapDrillPrefill, setTrapDrillPrefill] = useState(null)
  const [activeDomainPassId, setActiveDomainPassId] = useState(null)
  const [domainPassPassedCount, setDomainPassPassedCount] = useState(0)
  const [domainPassRecords, setDomainPassRecords] = useState({})
  const [mockDomainPrefill, setMockDomainPrefill] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [progress, setProgress] = useState({})
  const [missed, setMissed] = useState([])
  const [streak, setStreak] = useState({ count: 0, lastStudyDate: null })
  const [apiOnline, setApiOnline] = useState(true)
  const [showExport, setShowExport] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [offlineReady, setOfflineReady] = useState(() => new Set())
  const [packagingId, setPackagingId] = useState(null) // objective id currently being packaged
  const [showSync, setShowSync] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const onboardingReplayRef = useRef(false)
  const tourQueuedRef = useRef(false)
  const [settingsExamDate, setSettingsExamDate] = useState(null)
  const [settingsQuizSize, setSettingsQuizSize] = useState(5)
  const [settingsReduceMotion, setSettingsReduceMotion] = useState(false)
  const [settingsExamMode, setSettingsExamMode] = useState(false)
  const [cleanBankStats, setCleanBankStats] = useState({ objectives: 0, questions: 0, genericExamTips: 0 })
  const importFileRef = useRef(null)
  const mainRef = useRef(null)
  const homeScrollRef = useRef(0)
  const prevViewRef = useRef('home')
  const [syncCode, setSyncCode] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [dueCount, setDueCount] = useState(0)
  const [openDomain, setOpenDomain] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [labReturn, setLabReturn] = useState('labs') // where the lab's Back goes
  const openLab = useCallback((labId, from = 'labs') => { setSelectedLab(labId); setLabReturn(from); setView('lab') }, [])
  const [theme, setTheme] = useState(() =>
    (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark')
  const [premiumUnlocked, setPremiumUnlocked] = useState(false)
  const [premiumToast, setPremiumToast] = useState(null)

  const handlePremiumBlocked = useCallback((feature, source, extra) => {
    logPremiumBlocked(feature, source, extra)
    setPremiumToast(PREMIUM_TOAST_MESSAGES[feature] || 'This coach feature will unlock with supporter access.')
  }, [])

  const handleTogglePremium = useCallback(async (on) => {
    await savePremiumUnlocked(on)
    setPremiumUnlocked(!!on)
  }, [])

  // Flip the theme: update the root attribute (re-themes instantly via CSS
  // vars) and persist the choice. Available from a fixed control at all times.
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

  // Preload clean-question chunk during idle time so first quiz/mock is instant.
  useEffect(() => {
    const run = () => { preloadCleanBank().catch(() => {}) }
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 4000 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(run, 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    (async () => {
      const [p, m, s, off, code, last, due, onboardDone, premium, examDate] = await Promise.all([
        loadProgress(), loadMissed(), loadStreak(), loadOfflineReadyIds(),
        window.storage.getItem(STORAGE_KEYS.syncCode), window.storage.getItem(STORAGE_KEYS.syncLast),
        countDueQuestions(), window.storage.getItem(STORAGE_KEYS.onboardDone),
        loadPremiumUnlocked(),
        loadExamDate(),
      ])
      setProgress(p)
      setMissed(m)
      setStreak(s)
      setOfflineReady(off)
      setSyncCode(code || null)
      setLastSynced(last || null)
      setDueCount(due)
      setPremiumUnlocked(premium)
      setSettingsExamDate(examDate)
      setLoaded(true)
      flushQuestionFlagQueue().catch(() => {})
      const reduceMotion = await loadReduceMotion()
      applyReduceMotionPreference(reduceMotion)
      setSettingsReduceMotion(reduceMotion)
      setSettingsExamMode(await loadExamMode())
      if (!onboardDone) {
        if (Object.keys(p).length === 0) {
          setView('onboarding')
        } else {
          await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
        }
      }
      if (onboardDone || Object.keys(p).length > 0) {
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
  }, [])

  // Diagnostic placement check: seed quizScores for sampled objectives, then
  // hand off to the normal dashboard.

  const finishOnboarding = useCallback(async (results) => {
    if (!onboardingReplayRef.current) {
      setProgress(prev => {
        const next = { ...prev }
        for (const [objectiveId, r] of Object.entries(results || {})) {
          const entry = next[objectiveId] || { status: 'unseen', quizScores: [] }
          const newScores = [...(entry.quizScores || []), { score: r.correct, total: r.total, date: Date.now() }]
          const { score: masteryScore, mastered } = computeMastery({ quizScores: newScores, confidenceRatings: entry.confidenceRatings || [] })
          next[objectiveId] = { ...entry, status: mastered ? 'mastered' : 'in_progress', quizScores: newScores, masteryScore, lastSeen: Date.now() }
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
  }, [])

  const skipOnboarding = useCallback(async () => {
    onboardingReplayRef.current = false
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    logEvent('user_skipped_onboarding', {})
    setView('home')
  }, [])

  const replayPlacementCheck = useCallback(() => {
    onboardingReplayRef.current = true
    setView('onboarding')
  }, [])

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
    if (!loaded || view !== 'home' || showTour || tourQueuedRef.current) return
    ;(async () => {
      const tourDone = await loadTourDone()
      if (!tourDone) {
        tourQueuedRef.current = true
        setShowTour(true)
      }
    })()
  }, [loaded, view, showTour])

  useEffect(() => {
    if (!showSettings) return
    let cancelled = false
    ;(async () => {
      const [exam, quiz, examMode] = await Promise.all([
        loadExamDate(),
        loadQuizSessionSizePref(),
        loadExamMode(),
      ])
      if (!cancelled) {
        setSettingsExamDate(exam)
        setSettingsQuizSize(quiz)
        setSettingsExamMode(examMode)
      }
      await preloadCleanBank()
      if (!cancelled) setCleanBankStats(getCleanBankStats())
    })()
    return () => { cancelled = true }
  }, [showSettings])

  const handleSaveExamDate = useCallback(async (iso) => {
    const saved = await saveExamDate(iso)
    setSettingsExamDate(saved)
  }, [])

  const handleClearExamDate = useCallback(async () => {
    await clearExamDate()
    setSettingsExamDate(null)
  }, [])

  const handleQuizSessionSizeChange = useCallback(async (size) => {
    const saved = await saveQuizSessionSizePref(size)
    setSettingsQuizSize(saved)
  }, [])

  const handleReduceMotionChange = useCallback(async (on) => {
    await saveReduceMotion(on)
    setSettingsReduceMotion(on)
  }, [])

  const handleExamModeChange = useCallback(async (on) => {
    await saveExamMode(on)
    setSettingsExamMode(on)
  }, [])

  const handleClearTutorChat = useCallback(() => clearTutorChat(), [])

  const refreshOffline = useCallback(async () => {
    setOfflineReady(await loadOfflineReadyIds())
  }, [])

  const handleClearAiCaches = useCallback(async () => {
    await clearAiCaches()
    await refreshOffline()
  }, [refreshOffline])

  const handleResetProgress = useCallback(async () => {
    await resetStudyProgress()
    setProgress({})
    setMissed([])
    setStreak({ count: 0, lastStudyDate: null })
    setDueCount(0)
    await refreshOffline()
  }, [refreshOffline])

  const refreshDue = useCallback(async () => {
    setDueCount(await countDueQuestions())
  }, [])

  // Recompute the due-review count whenever we land back on Home.
  useEffect(() => { if (view === 'home') refreshDue() }, [view, refreshDue])

  // Cmd+K / Ctrl+K opens global search (Phase 6).
  useGlobalSearchHotkey({
    enabled: loaded,
    blocked: showExport || showSync || showSettings,
    onOpen: () => setShowSearch(true),
  })

  // Preserve Home scroll position when leaving and returning (Phase 8).
  useEffect(() => {
    const prev = prevViewRef.current
    if (prev === 'home' && view !== 'home' && mainRef.current) {
      homeScrollRef.current = mainRef.current.scrollTop
    }
    if (view === 'home' && mainRef.current) {
      requestAnimationFrame(() => {
        if (mainRef.current) mainRef.current.scrollTop = homeScrollRef.current
      })
    }
    prevViewRef.current = view
  }, [view])

  useEffect(() => {
    if (!loaded) return
    syncAppHash(view, selectedObjective)
  }, [loaded, view, selectedObjective])

  useEffect(() => {
    if (!loaded) return
    function onHashChange() {
      const route = parseAppHash()
      if (route?.objective) {
        setReturnToView('home')
        setSelectedObjective(route.objective)
        setView('objective')
      } else if (route?.view) {
        setSelectedObjective(null)
        setReturnToView('home')
        setView(route.view)
      } else {
        setReturnToView('home')
        setView('home')
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [loaded])

  // Pull remote → merge with local → save → refresh UI → push merged back.
  // Deterministic and convergent, so it's safe to run on any device.
  const doSync = useCallback(async (code) => {
    const useCode = code || syncCode
    if (!useCode) return
    setSyncBusy(true); setSyncMsg('Syncing…')
    try {
      const local = await loadSyncBundle()
      const remote = await pullSync(useCode)
      const merged = mergeSyncData(local, remote || {})
      await saveSyncBundle(merged)
      setProgress(merged.progress)
      setMissed(merged.missed)
      setStreak(merged.streak)
      await pushSync(useCode, merged)
      const now = Date.now()
      await window.storage.setItem(STORAGE_KEYS.syncLast, now)
      setLastSynced(now)
      await refreshOffline()
      setSyncMsg('Synced ✓')
    } catch (e) {
      setSyncMsg(/failed to fetch/i.test(e.message) ? 'Could not reach the sync server (works on the deployed site only).' : e.message)
    } finally {
      setSyncBusy(false)
    }
  }, [syncCode, refreshOffline])

  const handleGenerateSync = useCallback(async () => {
    const code = generateSyncCode()
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleLinkSync = useCallback(async (code) => {
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleUnlinkSync = useCallback(async () => {
    await window.storage.removeItem(STORAGE_KEYS.syncCode)
    setSyncCode(null)
    setLastSynced(null)
    setSyncMsg('')
  }, [])

  // Restore a Raw Data export: merge it into local data (same safe merge as
  // sync — nothing is overwritten) and refresh the UI.
  const handleImport = useCallback(async (incoming) => {
    const local = await loadSyncBundle()
    const merged = mergeSyncData(local, incoming || {})
    await saveSyncBundle(merged)
    setProgress(merged.progress)
    setMissed(merged.missed)
    setStreak(merged.streak)
    await refreshOffline()
  }, [refreshOffline])

  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importCcnaJsonFromFile(file, handleImport)
    } catch {
      // invalid JSON — user can retry via Export modal for feedback
    } finally {
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }, [handleImport])

  const pickImportFile = useCallback(() => { importFileRef.current?.click() }, [])

  // Auto-sync once on load if this device is already linked.
  useEffect(() => {
    if (loaded && syncCode) doSync(syncCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  // Pre-fetch every AI asset for a topic so it works offline. No-op when offline.
  // Returns true on success. Used both manually and automatically on mastery.
  const packageObjective = useCallback(async (objective) => {
    if (!premiumUnlocked) {
      handlePremiumBlocked(PREMIUM_FEATURES.offline_pack, 'objective', { objectiveId: objective?.id })
      return false
    }
    if (!apiOnline || !objective) return false
    if (offlineReady.has(objective.id)) return true
    setPackagingId(objective.id)
    try {
      await packageObjectiveOffline(objective)
      await refreshOffline()
      return true
    } catch {
      return false
    } finally {
      setPackagingId(null)
    }
  }, [apiOnline, offlineReady, refreshOffline, premiumUnlocked, handlePremiumBlocked])

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

  const updateProgress = useCallback((objectiveId, patch) => {
    setProgress(prev => {
      const next = {
        ...prev,
        [objectiveId]: { status: 'unseen', quizScores: [], ...prev[objectiveId], ...patch },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const handleMissed = useCallback((entry) => {
    setMissed(prev => {
      const next = [...prev, entry]
      saveMissed(next)
      return next
    })
  }, [])

  const removeMissed = useCallback((idx) => {
    setMissed(prev => {
      const next = prev.filter((_, i) => i !== idx)
      saveMissed(next)
      return next
    })
  }, [])

  function selectObjective(obj) {
    setReturnToView(view)
    bumpSessionStudy('objective', obj.id) // #16: track objective visits for session recap
    setSelectedObjective(obj)
    setView('objective')
  }

  const navigateTo = useCallback((nextView) => {
    setReturnToView(view)
    setView(nextView)
  }, [view])

  const openExamTraps = useCallback((prefill) => {
    setExamTrapPrefill(prefill || null)
    navigateTo('examtraps')
  }, [navigateTo])

  const openTrapDrill = useCallback((prefill) => {
    setTrapDrillPrefill(prefill || null)
    navigateTo('trapdrill')
  }, [navigateTo])

  const refreshDomainPassCount = useCallback(async () => {
    const records = await loadDomainPassRecords()
    setDomainPassRecords(records)
    setDomainPassPassedCount(countPassedDomains(records, DOMAINS))
  }, [])

  const openDomainPass = useCallback((opts) => {
    setActiveDomainPassId(opts?.domainId || null)
    navigateTo('domainpass')
  }, [navigateTo])

  const openMockExam = useCallback((opts) => {
    setMockDomainPrefill(opts?.domainId || null)
    navigateTo('mock')
  }, [navigateTo])

  const clearExamTrapPrefill = useCallback(() => setExamTrapPrefill(null), [])
  const clearTrapDrillPrefill = useCallback(() => setTrapDrillPrefill(null), [])

  const consumeTrapDrillPrefill = useCallback(async () => {
    const raw = await window.storage.getItem(STORAGE_KEYS.trapDrillPrefill)
    if (!raw) return
    await window.storage.removeItem(STORAGE_KEYS.trapDrillPrefill)
    setTrapDrillPrefill(raw)
  }, [])

  useEffect(() => {
    if (!loaded) return
    const onPrefill = () => { consumeTrapDrillPrefill() }
    window.addEventListener(TRAP_DRILL_PREFILL_EVENT, onPrefill)
    return () => window.removeEventListener(TRAP_DRILL_PREFILL_EVENT, onPrefill)
  }, [loaded, consumeTrapDrillPrefill])

  useEffect(() => {
    if (!loaded || view !== 'trapdrill') return
    consumeTrapDrillPrefill()
  }, [loaded, view, consumeTrapDrillPrefill])

  useEffect(() => {
    if (!loaded) return
    if (view !== 'home' && view !== 'domainpass') return
    refreshDomainPassCount()
  }, [loaded, view, refreshDomainPassCount])

  const goBack = useCallback(() => {
    setView(returnToView)
  }, [returnToView])

  useEffect(() => {
    if (!loaded || view !== 'objective' || selectedObjective) return
    const route = parseAppHash()
    if (route?.objective) {
      setSelectedObjective(route.objective)
      setReturnToView('home')
      return
    }
    setView('home')
  }, [loaded, view, selectedObjective])

  const handleFocusBlockCompleted = useCallback(async () => {
    const next = await bumpStreak()
    setStreak(next)
  }, [])

  const chromeOverlayOpen = showExport || showSync || showSearch || showSettings || showTour
  const showBottomNav = loaded && !chromeOverlayOpen && !['onboarding', 'tutor', 'mockinterview', 'lab'].includes(view)
  useVisualViewportBottomInset(showBottomNav || view === 'objective' || view === 'tutor' || view === 'mockinterview')

  if (!loaded) {
    return (
      <NavHintProvider>
        <AppShell>
          <AppShellStyles minimal />
          <RouteShell>
            <Spinner label="Loading your progress..." />
          </RouteShell>
        </AppShell>
      </NavHintProvider>
    )
  }

  const routeScrolls = view !== 'objective' && view !== 'tutor' && view !== 'mockinterview'
  const compactTopChrome = view === 'objective' || view === 'tutor' || view === 'mockinterview'
  const showNavBack = view !== 'home' && view !== 'onboarding' && view !== 'objective'
  const objectiveBackLabel = returnToView === 'home' ? 'Topics' : 'Back'
  const bottomNavActive = showSettings ? 'more' : showSearch ? 'search' : view === 'home' ? 'home' : view === 'objective' ? 'home' : null
  const bottomNavCompact = view === 'objective'

  return (
    <NavHintProvider>
    <StudyBlockProvider onFocusBlockCompleted={handleFocusBlockCompleted}>
    <AppShell view={view} compactTopChrome={compactTopChrome} withBottomNav={showBottomNav}>
      <AppShellStyles />
      <input ref={importFileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
      {!apiOnline && (
        <div className="app-chrome-top site-column">
          <OfflineBanner />
        </div>
      )}
      <RouteShell scroll={routeScrolls} ref={mainRef} innerClassName="ccna-route-in" key={view}>
        <CoreStudyRoutes
          view={view}
          onFinishOnboarding={finishOnboarding}
          onSkipOnboarding={skipOnboarding}
          progress={progress}
          streak={streak}
          missed={missed}
          apiOnline={apiOnline}
          offlineReady={offlineReady}
          selectObjective={selectObjective}
          openMockExam={openMockExam}
          navigateTo={navigateTo}
          handlePremiumBlocked={handlePremiumBlocked}
          premiumUnlocked={premiumUnlocked}
          domainPassPassedCount={domainPassPassedCount}
          domainPassRecords={domainPassRecords}
          settingsExamDate={settingsExamDate}
          dueCount={dueCount}
          openDomain={openDomain}
          setOpenDomain={setOpenDomain}
          openExamTraps={openExamTraps}
          openTrapDrill={openTrapDrill}
          openDomainPass={openDomainPass}
          theme={theme}
          toggleTheme={toggleTheme}
          setShowSettings={setShowSettings}
          selectedObjective={selectedObjective}
          packagingId={packagingId}
          packageObjective={packageObjective}
          goBack={goBack}
          objectiveBackLabel={objectiveBackLabel}
          updateProgress={updateProgress}
          handleMissed={handleMissed}
          openLab={openLab}
          setView={setView}
          computeMastery={computeMastery}
          logEvent={logEvent}
          celebrate={celebrate}
          haptic={haptic}
          settingsExamMode={settingsExamMode}
          mockDomainPrefill={mockDomainPrefill}
          setMockDomainPrefill={setMockDomainPrefill}
        />
        <PracticeRoutes
          view={view}
          progress={progress}
          streak={streak}
          missed={missed}
          dueCount={dueCount}
          onBack={goBack}
          onMissed={handleMissed}
          onDone={refreshDue}
          onOpenSection={selectObjective}
          onOpenMetrics={() => navigateTo('metrics')}
          onOpenStats={() => navigateTo('stats')}
          onOpenReview={() => navigateTo('review')}
          onOpenExamTraps={openExamTraps}
          onOpenTrapDrill={openTrapDrill}
          onRemoveMissed={removeMissed}
          onSelectObjective={selectObjective}
        />
        <StudyModeRoutes
          view={view}
          selectedLab={selectedLab}
          labReturn={labReturn}
          topicFocusConfig={topicFocusConfig}
          setTopicFocusConfig={setTopicFocusConfig}
          examTrapPrefill={examTrapPrefill}
          clearExamTrapPrefill={clearExamTrapPrefill}
          trapDrillPrefill={trapDrillPrefill}
          clearTrapDrillPrefill={clearTrapDrillPrefill}
          activeDomainPassId={activeDomainPassId}
          setActiveDomainPassId={setActiveDomainPassId}
          settingsExamMode={settingsExamMode}
          missed={missed}
          onBack={goBack}
          onNavigate={setView}
          onOpenLab={openLab}
          onOpenMockExam={openMockExam}
          onOpenTrapDrill={openTrapDrill}
          onSelectObjective={selectObjective}
          onRefreshDomainPassCount={refreshDomainPassCount}
          onMissed={handleMissed}
          onDone={refreshDue}
          onOpenSettings={() => setShowSettings(true)}
          celebrate={celebrate}
          haptic={haptic}
          premiumUnlocked={premiumUnlocked}
          onPremiumBlocked={handlePremiumBlocked}
        />
      </RouteShell>
      {showBottomNav && (
        <div className="app-chrome-bottom app-chrome-bottom--dock site-column">
          <BottomNav
            active={bottomNavActive}
            compact={bottomNavCompact}
            homeLabel={showNavBack ? 'Back' : 'Home'}
            homeIcon={showNavBack ? 'back' : 'home'}
            onHome={showNavBack ? goBack : () => setView('home')}
            onSearch={() => setShowSearch(true)}
            onMore={() => setShowSettings(true)}
          />
        </div>
      )}
      <AppChromeOverlays
        showExport={showExport}
        showSearch={showSearch}
        showSync={showSync}
        showSettings={showSettings}
        showTour={showTour}
        progress={progress}
        missed={missed}
        streak={streak}
        onImport={handleImport}
        onCloseExport={() => setShowExport(false)}
        onSelectObjective={selectObjective}
        onCloseSearch={() => setShowSearch(false)}
        sync={{
          syncCode,
          lastSynced,
          busy: syncBusy,
          msg: syncMsg,
          online: apiOnline,
          onGenerate: handleGenerateSync,
          onLink: handleLinkSync,
          onSyncNow: () => doSync(),
          onUnlink: handleUnlinkSync,
        }}
        onCloseSync={() => setShowSync(false)}
        settings={{
          onClose: () => setShowSettings(false),
          theme,
          onToggleTheme: toggleTheme,
          examDate: settingsExamDate,
          onSaveExamDate: handleSaveExamDate,
          onClearExamDate: handleClearExamDate,
          quizSessionSize: settingsQuizSize,
          onQuizSessionSizeChange: handleQuizSessionSizeChange,
          reduceMotion: settingsReduceMotion,
          onReduceMotionChange: handleReduceMotionChange,
          examMode: settingsExamMode,
          onExamModeChange: handleExamModeChange,
          cleanBankGenericExamTips: cleanBankStats.genericExamTips,
          onReplayPlacement: replayPlacementCheck,
          onShowTour: showTourAgain,
          onOpenSync: () => setShowSync(true),
          onOpenExport: () => setShowExport(true),
          onImportPick: pickImportFile,
          onClearTutorChat: handleClearTutorChat,
          onClearAiCaches: handleClearAiCaches,
          onResetProgress: handleResetProgress,
          offlineReadyCount: offlineReady.size,
          objectiveCount: ALL_OBJECTIVES.length,
          cleanBankObjectives: cleanBankStats.objectives,
          cleanBankQuestions: cleanBankStats.questions,
          appVersion: pkg.version,
          onDonatePreview: () => handlePremiumBlocked(PREMIUM_FEATURES.donate_preview, 'settings'),
          premiumUnlocked,
          onTogglePremium: handleTogglePremium,
        }}
        premiumToast={premiumToast}
        onDismissPremiumToast={() => setPremiumToast(null)}
        onCompleteTour={completeTour}
        onSkipTour={skipTour}
      />
    </AppShell>
    </StudyBlockProvider>
    </NavHintProvider>
  )
}
