import React from 'react'
import { ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { useVisualViewportBottomInset } from './ui/visualViewportInset.js'
import { celebrate, haptic } from './ui/feedbackHelpers.jsx'
import Spinner from './components/Spinner.jsx'
import { NavHintProvider } from './components/NavHintProvider.jsx'
import StudyBlockProvider from './components/StudyBlockProvider.jsx'
import RouteShell from './components/RouteShell.jsx'
import AppShell from './features/shell/AppShell.jsx'
import AppShellStyles from './features/shell/AppShellStyles.jsx'
import { useAppChrome } from './features/shell/useAppChrome.js'
import { PREMIUM_FEATURES } from './premium/premiumFeatures.js'
import BottomNav from './components/BottomNav.jsx'
import StudyModeRoutes from './features/study/StudyModeRoutes.jsx'
import AppChromeOverlays from './features/shell/AppChromeOverlays.jsx'
import CoreStudyRoutes from './features/shell/CoreStudyRoutes.jsx'
import { useGlobalSearchHotkey } from './features/search/useGlobalSearchHotkey.js'
import { useAppSync } from './features/sync/useAppSync.js'
import { useAppOnboarding } from './features/onboarding/useAppOnboarding.js'
import { useAppBootstrap } from './features/bootstrap/useAppBootstrap.js'
import { useAppSettings } from './features/settings/useAppSettings.js'
import {
  useAppNavigation,
  AppNavigationLifecycle,
  bottomNavState,
} from './features/navigation/useAppNavigation.js'
import { useAppPremium } from './features/premium/useAppPremium.js'
import { useAppProgress } from './features/progress/useAppProgress.js'
import { useAppStudyBlock } from './features/study/useAppStudyBlock.js'
import OfflineBanner from './features/shell/OfflineBanner.jsx'
import PracticeRoutes from './features/practice/PracticeRoutes.jsx'
import pkg from '../package.json'
import { computeMastery } from './netUtils.js'
import { logEvent } from './eventLog.js'

export default function App() {
  const nav = useAppNavigation()
  const {
    view,
    setView,
    topicFocusConfig,
    setTopicFocusConfig,
    examTrapPrefill,
    trapDrillPrefill,
    activeDomainPassId,
    setActiveDomainPassId,
    domainPassPassedCount,
    domainPassRecords,
    mockDomainPrefill,
    setMockDomainPrefill,
    selectedObjective,
    openDomain,
    setOpenDomain,
    selectedLab,
    labReturn,
    openLab,
    mainRef,
    selectObjective,
    navigateTo,
    openExamTraps,
    openTrapDrill,
    openDomainPass,
    openMockExam,
    clearExamTrapPrefill,
    clearTrapDrillPrefill,
    refreshDomainPassCount,
    goBack,
    routeScrolls,
    compactTopChrome,
    showNavBack,
    objectiveBackLabel,
  } = nav

  const {
    showExport,
    showSync,
    showSearch,
    showSettings,
    closeExport,
    closeSync,
    closeSearch,
    closeSettings,
    openSearch,
    openSync,
    openExport,
    openSettings,
    panelOverlayOpen,
    hotkeyBlocked,
    setShowSettings,
  } = useAppChrome()

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
  } = useAppBootstrap({
    setView: nav.setView,
    setReturnToView: nav.setReturnToView,
    setSelectedObjective: nav.setSelectedObjective,
  })

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

  const {
    premiumToast,
    packagingId,
    handlePremiumBlocked,
    handleTogglePremium,
    dismissPremiumToast,
    packageObjective,
  } = useAppPremium({ premiumUnlocked, setPremiumUnlocked, apiOnline, offlineReady, refreshOffline })

  const { updateProgress, handleMissed, removeMissed } = useAppProgress({ setProgress, setMissed })

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

  useGlobalSearchHotkey({
    enabled: loaded,
    blocked: hotkeyBlocked,
    onOpen: openSearch,
  })

  const { handleFocusBlockCompleted } = useAppStudyBlock({ setStreak })

  const chromeOverlayOpen = panelOverlayOpen || showTour
  const showBottomNav = loaded && !chromeOverlayOpen && !['onboarding', 'tutor', 'mockinterview', 'lab'].includes(view)
  useVisualViewportBottomInset(showBottomNav || view === 'objective' || view === 'tutor' || view === 'mockinterview')
  const { active: bottomNavActive, compact: bottomNavCompact } = bottomNavState({ view, showSettings, showSearch, showNavBack })

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

  return (
    <NavHintProvider>
    <StudyBlockProvider onFocusBlockCompleted={handleFocusBlockCompleted}>
    <AppNavigationLifecycle nav={nav} loaded={loaded} refreshDue={refreshDue} />
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
          onOpenSettings={openSettings}
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
            onSearch={openSearch}
            onMore={openSettings}
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
        onCloseExport={closeExport}
        onSelectObjective={selectObjective}
        onCloseSearch={closeSearch}
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
        onCloseSync={closeSync}
        settings={{
          onClose: closeSettings,
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
          onOpenSync: openSync,
          onOpenExport: openExport,
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
        onDismissPremiumToast={dismissPremiumToast}
        onCompleteTour={completeTour}
        onSkipTour={skipTour}
      />
    </AppShell>
    </StudyBlockProvider>
    </NavHintProvider>
  )
}
