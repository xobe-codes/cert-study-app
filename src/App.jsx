import React from 'react'
import { celebrate, haptic } from './ui/feedbackHelpers.jsx'
import Spinner from './components/Spinner.jsx'
import { NavHintProvider } from './components/NavHintProvider.jsx'
import StudyBlockProvider from './components/StudyBlockProvider.jsx'
import RouteShell from './components/RouteShell.jsx'
import AppShell from './features/shell/AppShell.jsx'
import AppShellStyles from './features/shell/AppShellStyles.jsx'
import { useAppChrome } from './features/shell/useAppChrome.js'
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
import AppLoadedShell from './features/shell/AppLoadedShell.jsx'
import { computeMastery } from './netUtils.js'
import { logEvent } from './eventLog.js'

export default function App() {
  const nav = useAppNavigation()
  const chrome = useAppChrome()
  const bootstrap = useAppBootstrap({
    setView: nav.setView,
    setReturnToView: nav.setReturnToView,
    setSelectedObjective: nav.setSelectedObjective,
  })
  const settings = useAppSettings({
    showSettings: chrome.showSettings,
    loaded: bootstrap.loaded,
    setProgress: bootstrap.setProgress,
    setMissed: bootstrap.setMissed,
    setStreak: bootstrap.setStreak,
    setDueCount: bootstrap.setDueCount,
    refreshOffline: bootstrap.refreshOffline,
  })
  const premium = useAppPremium({
    premiumUnlocked: bootstrap.premiumUnlocked,
    setPremiumUnlocked: bootstrap.setPremiumUnlocked,
    apiOnline: bootstrap.apiOnline,
    offlineReady: bootstrap.offlineReady,
    refreshOffline: bootstrap.refreshOffline,
  })
  const progressApi = useAppProgress({ setProgress: bootstrap.setProgress, setMissed: bootstrap.setMissed })
  const sync = useAppSync({
    loaded: bootstrap.loaded,
    setProgress: bootstrap.setProgress,
    setMissed: bootstrap.setMissed,
    setStreak: bootstrap.setStreak,
    refreshOffline: bootstrap.refreshOffline,
  })
  const onboarding = useAppOnboarding({ loaded: bootstrap.loaded, view: nav.view, setView: nav.setView, setProgress: bootstrap.setProgress })
  useGlobalSearchHotkey({ enabled: bootstrap.loaded, blocked: chrome.hotkeyBlocked, onOpen: chrome.openSearch })
  const studyBlock = useAppStudyBlock({ setStreak: bootstrap.setStreak })

  const chromeOverlayOpen = chrome.panelOverlayOpen || onboarding.showTour
  const showBottomNav = bootstrap.loaded && !chromeOverlayOpen && !['onboarding', 'tutor', 'mockinterview', 'lab'].includes(nav.view)
  const bottomNav = bottomNavState({ view: nav.view, showSettings: chrome.showSettings, showSearch: chrome.showSearch, showNavBack: nav.showNavBack })

  if (!bootstrap.loaded) {
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
      <StudyBlockProvider onFocusBlockCompleted={studyBlock.handleFocusBlockCompleted}>
        <AppNavigationLifecycle nav={nav} loaded={bootstrap.loaded} refreshDue={bootstrap.refreshDue} />
        <AppLoadedShell
          view={nav.view}
          setView={nav.setView}
          routeScrolls={nav.routeScrolls}
          mainRef={nav.mainRef}
          compactTopChrome={nav.compactTopChrome}
          showBottomNav={showBottomNav}
          bottomNavActive={bottomNav.active}
          bottomNavCompact={bottomNav.compact}
          showNavBack={nav.showNavBack}
          apiOnline={bootstrap.apiOnline}
          importFileRef={sync.importFileRef}
          handleImportFile={sync.handleImportFile}
          progress={bootstrap.progress}
          streak={bootstrap.streak}
          missed={bootstrap.missed}
          offlineReady={bootstrap.offlineReady}
          selectObjective={nav.selectObjective}
          openMockExam={nav.openMockExam}
          navigateTo={nav.navigateTo}
          handlePremiumBlocked={premium.handlePremiumBlocked}
          premiumUnlocked={bootstrap.premiumUnlocked}
          domainPassPassedCount={nav.domainPassPassedCount}
          domainPassRecords={nav.domainPassRecords}
          placementBaselineCount={nav.placementBaselineCount}
          placementTestedOutCount={nav.placementTestedOutCount}
          placementRecords={nav.placementRecords}
          settingsExamDate={settings.settingsExamDate}
          dueCount={bootstrap.dueCount}
          openDomain={nav.openDomain}
          setOpenDomain={nav.setOpenDomain}
          openExamTraps={nav.openExamTraps}
          openTrapDrill={nav.openTrapDrill}
          openDomainPass={nav.openDomainPass}
          openDomainPlacement={nav.openDomainPlacement}
          theme={bootstrap.theme}
          toggleTheme={bootstrap.toggleTheme}
          setShowSettings={chrome.setShowSettings}
          selectedObjective={nav.selectedObjective}
          packagingId={premium.packagingId}
          packageObjective={premium.packageObjective}
          goBack={nav.goBack}
          objectiveBackLabel={nav.objectiveBackLabel}
          updateProgress={progressApi.updateProgress}
          handleMissed={progressApi.handleMissed}
          openLab={nav.openLab}
          computeMastery={computeMastery}
          logEvent={logEvent}
          celebrate={celebrate}
          haptic={haptic}
          settingsExamMode={settings.settingsExamMode}
          mockDomainPrefill={nav.mockDomainPrefill}
          setMockDomainPrefill={nav.setMockDomainPrefill}
          finishOnboarding={onboarding.finishOnboarding}
          skipOnboarding={onboarding.skipOnboarding}
          selectedLab={nav.selectedLab}
          labReturn={nav.labReturn}
          topicFocusConfig={nav.topicFocusConfig}
          setTopicFocusConfig={nav.setTopicFocusConfig}
          examTrapPrefill={nav.examTrapPrefill}
          clearExamTrapPrefill={nav.clearExamTrapPrefill}
          trapDrillPrefill={nav.trapDrillPrefill}
          clearTrapDrillPrefill={nav.clearTrapDrillPrefill}
          activeDomainPassId={nav.activeDomainPassId}
          setActiveDomainPassId={nav.setActiveDomainPassId}
          activeDomainPlacementId={nav.activeDomainPlacementId} setActiveDomainPlacementId={nav.setActiveDomainPlacementId} exitDomainPlacement={nav.exitDomainPlacement}
          refreshDomainPassCount={nav.refreshDomainPassCount}
          refreshDue={bootstrap.refreshDue}
          openSettings={chrome.openSettings}
          openSearch={chrome.openSearch}
          removeMissed={progressApi.removeMissed}
          showExport={chrome.showExport}
          showSearch={chrome.showSearch}
          showSync={chrome.showSync}
          showSettings={chrome.showSettings}
          showTour={onboarding.showTour}
          closeExport={chrome.closeExport}
          closeSearch={chrome.closeSearch}
          closeSync={chrome.closeSync}
          closeSettings={chrome.closeSettings}
          syncCode={sync.syncCode}
          lastSynced={sync.lastSynced}
          syncBusy={sync.syncBusy}
          syncMsg={sync.syncMsg}
          doSync={sync.doSync}
          handleGenerateSync={sync.handleGenerateSync}
          handleLinkSync={sync.handleLinkSync}
          handleUnlinkSync={sync.handleUnlinkSync}
          handleImport={sync.handleImport}
          pickImportFile={sync.pickImportFile}
          settingsQuizSize={settings.settingsQuizSize}
          settingsReduceMotion={settings.settingsReduceMotion}
          handleSaveExamDate={settings.handleSaveExamDate}
          handleClearExamDate={settings.handleClearExamDate}
          handleQuizSessionSizeChange={settings.handleQuizSessionSizeChange}
          handleReduceMotionChange={settings.handleReduceMotionChange}
          handleExamModeChange={settings.handleExamModeChange}
          cleanBankStats={settings.cleanBankStats}
          replayPlacementCheck={onboarding.replayPlacementCheck}
          showTourAgain={onboarding.showTourAgain}
          openSync={chrome.openSync}
          openExport={chrome.openExport}
          handleClearTutorChat={settings.handleClearTutorChat}
          handleClearAiCaches={settings.handleClearAiCaches}
          handleResetProgress={settings.handleResetProgress}
          handleTogglePremium={premium.handleTogglePremium}
          premiumToast={premium.premiumToast}
          dismissPremiumToast={premium.dismissPremiumToast}
          completeTour={onboarding.completeTour}
          skipTour={onboarding.skipTour}
        />
      </StudyBlockProvider>
    </NavHintProvider>
  )
}
