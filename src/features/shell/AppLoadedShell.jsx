import React from 'react'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { useVisualViewportBottomInset } from '../../ui/visualViewportInset.js'
import RouteShell from '../../components/RouteShell.jsx'
import AppShell from './AppShell.jsx'
import AppShellStyles from './AppShellStyles.jsx'
import BottomNav from '../../components/BottomNav.jsx'
import { buildRouteGestures } from './routeGestures.js'
import { useMobileGestureBlocks } from '../../ui/useMobileGestureBlocks.js'
import StudyModeRoutes from '../study/StudyModeRoutes.jsx'
import AppChromeOverlays from './AppChromeOverlays.jsx'
import { MasteryProgressProvider } from '../progress/MasteryProgressContext.jsx'
import CoreStudyRoutes from './CoreStudyRoutes.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import PracticeRoutes from '../practice/PracticeRoutes.jsx'
import { PREMIUM_FEATURES } from '../../premium/premiumFeatures.js'
import pkg from '../../../package.json'

/** Loaded app shell — routes, bottom nav, and chrome overlays (extracted from App.jsx). */
export default function AppLoadedShell({
  view,
  setView,
  routeScrolls,
  mainRef,
  compactTopChrome,
  showBottomNav,
  bottomNavActive,
  bottomNavCompact,
  showNavBack,
  apiOnline,
  importFileRef,
  handleImportFile,
  progress,
  streak,
  missed,
  offlineReady,
  selectObjective,
  openMockExam,
  openLabs,
  openCommandHub,
  openTermsHub,
  navigateTo,
  handlePremiumBlocked,
  premiumUnlocked,
  domainPassPassedCount,
  domainPassRecords,
  placementBaselineCount,
  placementTestedOutCount,
  placementRecords,
  settingsExamDate,
  dueCount,
  openDomain,
  setOpenDomain,
  openExamTraps,
  openTrapDrill,
  openDomainPass,
  openDomainPlacement,
  theme,
  toggleTheme,
  setShowSettings,
  selectedObjective,
  packagingId,
  packageObjective,
  goBack,
  navigateHome,
  replaceView,
  exitLab,
  objectiveBackLabel,
  updateProgress,
  recordEngagement,
  handleMissed,
  openLab,
  computeMastery,
  logEvent,
  celebrate,
  haptic,
  settingsExamMode,
  mockDomainPrefill,
  labsDomainPrefill,
  commandHubDomainPrefill,
  commandHubTabPrefill,
  commandHubPackPrefill,
  termsHubDomainPrefill,
  clearCommandHubLaunch,
  setMockDomainPrefill,
  finishOnboarding,
  skipOnboarding,
  selectedLab,
  labReturn,
  topicFocusConfig,
  setTopicFocusConfig,
  examTrapPrefill,
  clearExamTrapPrefill,
  trapDrillPrefill,
  clearTrapDrillPrefill,
  activeDomainPassId,
  setActiveDomainPassId,
  domainPassFocusPickerId,
  setDomainPassFocusPickerId,
  domainPassFocusConfig,
  setDomainPassFocusConfig,
  activeDomainPlacementId,
  setActiveDomainPlacementId,
  placementSessionMode,
  exitDomainPlacement,
  refreshDomainPassCount,
  refreshDue,
  openSettings,
  openSearch,
  removeMissed,
  removeMissedByQuestionIds,
  showExport,
  showSearch,
  showSync,
  showSettings,
  showTour,
  closeExport,
  closeSearch,
  closeSync,
  closeSettings,
  syncCode,
  lastSynced,
  syncBusy,
  syncMsg,
  doSync,
  handleGenerateSync,
  handleLinkSync,
  handleUnlinkSync,
  handleImport,
  pickImportFile,
  settingsQuizSize,
  settingsReduceMotion,
  handleSaveExamDate,
  handleClearExamDate,
  handleQuizSessionSizeChange,
  handleReduceMotionChange,
  handleExamModeChange,
  cleanBankStats,
  replayPlacementCheck,
  showTourAgain,
  openSync,
  openExport,
  handleClearTutorChat,
  handleClearAiCaches,
  handleResetProgress,
  handleTogglePremium,
  premiumToast,
  dismissPremiumToast,
  completeTour,
  skipTour,
  onRefreshApp,
  canPullRefresh,
  canEdgeBack,
  chromeOverlayOpen,
}) {
  const gestureBlocks = useMobileGestureBlocks()
  const routeGestures = buildRouteGestures({
    refreshApp: onRefreshApp,
    goBack,
    canPullRefresh,
    canEdgeBack,
    chromeOverlayOpen,
    gestureBlocks,
    reduceMotion: settingsReduceMotion,
  })

  useVisualViewportBottomInset(
    showBottomNav
    || view === 'objective'
    || view === 'tutor'
    || view === 'mockinterview'
    || view === 'lab'
    || view === 'labs'
    || view === 'trapdrill'
    || view === 'examtraps'
    || view === 'review'
    || view === 'focus'
    || view === 'subnet',
  )

  return (
    <AppShell view={view} compactTopChrome={compactTopChrome} withBottomNav={showBottomNav}>
      <AppShellStyles />
      <input ref={importFileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
      {!apiOnline && (
        <div className="app-chrome-top site-column">
          <OfflineBanner />
        </div>
      )}
      <RouteShell scroll={routeScrolls} ref={mainRef} innerClassName="ccna-route-in" key={view} pullRefresh={routeGestures.pullRefresh} edgeBack={routeGestures.edgeBack}>
        <MasteryProgressProvider updateProgress={updateProgress} recordEngagement={recordEngagement} removeMissedByQuestionIds={removeMissedByQuestionIds}>
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
          openLabs={openLabs}
          openCommandHub={openCommandHub}
          openTermsHub={openTermsHub}
          navigateTo={navigateTo}
          handlePremiumBlocked={handlePremiumBlocked}
          premiumUnlocked={premiumUnlocked}
          domainPassPassedCount={domainPassPassedCount}
          domainPassRecords={domainPassRecords}
          placementBaselineCount={placementBaselineCount}
          placementTestedOutCount={placementTestedOutCount}
          placementRecords={placementRecords}
          settingsExamDate={settingsExamDate}
          dueCount={dueCount}
          openDomain={openDomain}
          setOpenDomain={setOpenDomain}
          openExamTraps={openExamTraps}
          openTrapDrill={openTrapDrill}
          openDomainPass={openDomainPass}
          openDomainPlacement={openDomainPlacement}
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
          labsDomainPrefill={labsDomainPrefill}
          commandHubDomainPrefill={commandHubDomainPrefill}
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
          onOpenLab={openLab}
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
          domainPassFocusPickerId={domainPassFocusPickerId}
          setDomainPassFocusPickerId={setDomainPassFocusPickerId}
          domainPassFocusConfig={domainPassFocusConfig}
          setDomainPassFocusConfig={setDomainPassFocusConfig}
          activeDomainPlacementId={activeDomainPlacementId}
          setActiveDomainPlacementId={setActiveDomainPlacementId}
          placementSessionMode={placementSessionMode}
          exitDomainPlacement={exitDomainPlacement}
          settingsExamMode={settingsExamMode}
          missed={missed}
          onBack={goBack}
          onNavigate={replaceView}
          onExitLab={exitLab}
          onPushView={navigateTo}
          onOpenLab={openLab}
          onOpenMockExam={openMockExam}
          labsDomainPrefill={labsDomainPrefill}
          commandHubDomainPrefill={commandHubDomainPrefill}
          commandHubTabPrefill={commandHubTabPrefill}
          commandHubPackPrefill={commandHubPackPrefill}
          termsHubDomainPrefill={termsHubDomainPrefill}
          clearCommandHubLaunch={clearCommandHubLaunch}
          onOpenTrapDrill={openTrapDrill}
          onOpenExamTraps={openExamTraps}
          onOpenDomainPlacement={openDomainPlacement}
          onOpenCommandHub={openCommandHub}
          onOpenTermsHub={openTermsHub}
          onOpenLabs={openLabs}
          onOpenSubnet={() => navigateTo('subnet')}
          onSelectObjective={selectObjective}
          onRefreshDomainPassCount={refreshDomainPassCount}
          onMissed={handleMissed}
          onDone={refreshDue}
          onOpenSettings={openSettings}
          celebrate={celebrate}
          haptic={haptic}
          premiumUnlocked={premiumUnlocked}
          onPremiumBlocked={handlePremiumBlocked}
          progress={progress}
        />
        </MasteryProgressProvider>
      </RouteShell>
      {showBottomNav && (
        <div className="app-chrome-bottom app-chrome-bottom--dock site-column">
          <BottomNav
            active={bottomNavActive}
            compact={bottomNavCompact}
            homeLabel={showNavBack ? 'Back' : 'Home'}
            homeIcon={showNavBack ? 'back' : 'home'}
            onHome={showNavBack ? goBack : navigateHome}
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
          onPremiumBlocked: handlePremiumBlocked,
          apiOnline,
        }}
        premiumToast={premiumToast}
        onDismissPremiumToast={dismissPremiumToast}
        onCompleteTour={completeTour}
        onSkipTour={skipTour}
      />
    </AppShell>
  )
}
