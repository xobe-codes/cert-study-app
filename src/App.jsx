import React, { useState, useEffect, useCallback, useRef } from 'react'
import { DOMAINS, ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { useVisualViewportBottomInset } from './ui/visualViewportInset.js'
import { celebrate, haptic } from './ui/feedbackHelpers.jsx'
import { STORAGE_KEYS, TRAP_DRILL_PREFILL_EVENT } from './storageKeys.js'
import Spinner from './components/Spinner.jsx'
import { NavHintProvider } from './components/NavHintProvider.jsx'
import StudyBlockProvider from './components/StudyBlockProvider.jsx'
import RouteShell from './components/RouteShell.jsx'
import AppShell from './features/shell/AppShell.jsx'
import AppShellStyles from './features/shell/AppShellStyles.jsx'
import {
  savePremiumUnlocked,
  logPremiumBlocked,
  PREMIUM_FEATURES,
} from './premium/premiumFeatures.js'
import BottomNav from './components/BottomNav.jsx'
import StudyModeRoutes from './features/study/StudyModeRoutes.jsx'
import AppChromeOverlays from './features/shell/AppChromeOverlays.jsx'
import CoreStudyRoutes from './features/shell/CoreStudyRoutes.jsx'
import { loadDomainPassRecords, countPassedDomains } from './features/domainPass/domainPassStorage.js'
import { packageObjectiveOffline } from './offline/objectivePackaging.js'
import { saveProgress, saveMissed, bumpStreak } from './storage/appPersistence.js'
import { parseAppHash, syncAppHash } from './routing/appHashRouting.js'
import { useGlobalSearchHotkey } from './features/search/useGlobalSearchHotkey.js'
import { useAppSync } from './features/sync/useAppSync.js'
import { useAppOnboarding } from './features/onboarding/useAppOnboarding.js'
import { useAppBootstrap } from './features/bootstrap/useAppBootstrap.js'
import { useAppSettings } from './features/settings/useAppSettings.js'
import OfflineBanner from './features/shell/OfflineBanner.jsx'
import PracticeRoutes from './features/practice/PracticeRoutes.jsx'
import { bumpSessionStudy } from './home/sessionRecap.js'
import pkg from '../package.json'
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
  const [view, setView] = useState('home')
  const [returnToView, setReturnToView] = useState('home')
  const [topicFocusConfig, setTopicFocusConfig] = useState(null)
  const [examTrapPrefill, setExamTrapPrefill] = useState(null)
  const [trapDrillPrefill, setTrapDrillPrefill] = useState(null)
  const [activeDomainPassId, setActiveDomainPassId] = useState(null)
  const [domainPassPassedCount, setDomainPassPassedCount] = useState(0)
  const [domainPassRecords, setDomainPassRecords] = useState({})
  const [mockDomainPrefill, setMockDomainPrefill] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [showExport, setShowExport] = useState(false)
  const [packagingId, setPackagingId] = useState(null)
  const [showSync, setShowSync] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const mainRef = useRef(null)
  const homeScrollRef = useRef(0)
  const prevViewRef = useRef('home')
  const [openDomain, setOpenDomain] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [labReturn, setLabReturn] = useState('labs')
  const openLab = useCallback((labId, from = 'labs') => { setSelectedLab(labId); setLabReturn(from); setView('lab') }, [])
  const [premiumToast, setPremiumToast] = useState(null)

  const {
    progress, setProgress,
    missed, setMissed,
    streak, setStreak,
    loaded,
    offlineReady,
    dueCount, setDueCount,
    premiumUnlocked, setPremiumUnlocked,
    apiOnline,
    theme, toggleTheme,
    refreshOffline,
    refreshDue,
  } = useAppBootstrap({ setView, setReturnToView, setSelectedObjective })

  const {
    settingsExamDate,
    settingsQuizSize,
    settingsReduceMotion,
    settingsExamMode,
    cleanBankStats,
    handleSaveExamDate,
    handleClearExamDate,
    handleQuizSessionSizeChange,
    handleReduceMotionChange,
    handleExamModeChange,
    handleClearTutorChat,
    handleClearAiCaches,
    handleResetProgress,
  } = useAppSettings({ showSettings, loaded, setProgress, setMissed, setStreak, setDueCount, refreshOffline })

  const handlePremiumBlocked = useCallback((feature, source, extra) => {
    logPremiumBlocked(feature, source, extra)
    setPremiumToast(PREMIUM_TOAST_MESSAGES[feature] || 'This coach feature will unlock with supporter access.')
  }, [])

  const handleTogglePremium = useCallback(async (on) => {
    await savePremiumUnlocked(on)
    setPremiumUnlocked(!!on)
  }, [setPremiumUnlocked])

  const {
    syncCode,
    lastSynced,
    syncBusy,
    syncMsg,
    importFileRef,
    doSync,
    handleGenerateSync,
    handleLinkSync,
    handleUnlinkSync,
    handleImport,
    handleImportFile,
    pickImportFile,
  } = useAppSync({ loaded, setProgress, setMissed, setStreak, refreshOffline })

  const {
    showTour,
    finishOnboarding,
    skipOnboarding,
    replayPlacementCheck,
    completeTour,
    skipTour,
    showTourAgain,
  } = useAppOnboarding({ loaded, view, setView, setProgress })

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
