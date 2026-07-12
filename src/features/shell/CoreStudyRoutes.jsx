import React, { lazy } from 'react'
import { AppNavigationProvider } from '../../context/AppNavigationContext.jsx'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COMMAND_DRILLS } from '../../lab/commandDrills.js'
import CLIDrillTab from '../../lab/CLIDrillTab.jsx'
import { SubnettingTab, VLSMTab, IPv6CalcTab, ACLWildcardTab } from '../../tabs/subnetPracticeTabs.jsx'
import { ExplainTab, QuizTab, objectiveTabId, objectivePanelId } from '../../tabs/studyQuizTabs.jsx'
import VisualAidTab from '../visual/VisualAidTab.jsx'
import HomeScreen from '../../HomeScreen.jsx'
import ObjectiveScreen from '../../ObjectiveScreen.jsx'
import Onboarding from '../onboarding/Onboarding.jsx'
import MockInterview from '../mockExam/MockInterview.jsx'
import TutorChat from '../tutor/TutorChat.jsx'
import LazyRoute from '../../components/LazyRoute.jsx'
import Spinner from '../../components/Spinner.jsx'
import TabSectionLabel from '../../components/TabSectionLabel.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import StatusLabel from '../../components/StatusLabel.jsx'
import StatusDot from '../../components/StatusDot.jsx'
import { PremiumBlockedShell } from '../../components/PremiumPreview.jsx'
import { MASTERY_GATE, enableSectionReview } from '../../quiz/quizBankStorage.js'
import { bumpSessionStudy } from '../../home/sessionRecap.js'

const MockExamRoute = lazy(() => import('../mockExam/MockExamRoute.jsx'))

/** Home, objective, mock, tutor, and onboarding routes extracted from App.jsx. */
export default function CoreStudyRoutes({
  view,
  // onboarding
  onFinishOnboarding,
  onSkipOnboarding,
  // home
  progress,
  streak,
  missed,
  apiOnline,
  offlineReady,
  selectObjective,
  openMockExam,
  navigateTo,
  openLabs,
  openCommandHub,
  openTermsHub,
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
  // objective
  selectedObjective,
  packagingId,
  packageObjective,
  goBack,
  objectiveBackLabel,
  updateProgress,
  handleMissed,
  openLab,
  setView,
  computeMastery,
  logEvent,
  celebrate,
  haptic,
  settingsExamMode,
  // mock
  labsDomainPrefill,
  mockDomainPrefill,
  setMockDomainPrefill,
  mockModePrefill,
  setMockModePrefill,
}) {
  if (view === 'onboarding') {
    return <Onboarding onComplete={onFinishOnboarding} onSkip={onSkipOnboarding} />
  }

  if (view === 'home') {
    const homeNavCallbacks = {
      onSelectObjective: selectObjective,
      onOpenMock: openMockExam,
      onOpenMockInterview: () => navigateTo('mockinterview'),
      onOpenMissed: () => navigateTo('missed'),
      onOpenTutor: () => navigateTo('tutor'),
      onPremiumBlocked: handlePremiumBlocked,
      onOpenMetrics: () => navigateTo('metrics'),
      onOpenStats: () => navigateTo('stats'),
      onOpenSettings: () => setShowSettings(true),
      onOpenLabs: openLabs || (() => navigateTo('labs')),
      onOpenReview: () => navigateTo('review'),
      onOpenFocus: () => navigateTo('focus'),
      onOpenTopicFocus: () => navigateTo('topicfocus'),
      onOpenCommandHub: openCommandHub,
      onOpenTermsHub: openTermsHub,
      onOpenStudyLens: () => navigateTo('studylens'),
      onOpenExamTraps: openExamTraps,
      onOpenTrapDrill: openTrapDrill,
      onOpenDomainPass: openDomainPass,
      onOpenDomainPlacement: openDomainPlacement,
      onOpenSubnet: () => navigateTo('subnet'),
      onOpenRouting: () => navigateTo('routing'),
      onOpenExtraStudy: () => navigateTo('extrastudy'),
      onOpenDomain: setOpenDomain,
      onToggleTheme: toggleTheme,
    }
    return (
      <AppNavigationProvider callbacks={homeNavCallbacks}>
        <HomeScreen
          progress={progress}
          streak={streak}
          missed={missed}
          missedCount={missed.length}
          apiOnline={apiOnline}
          offlineReady={offlineReady}
          premiumUnlocked={premiumUnlocked}
          domainPassPassedCount={domainPassPassedCount}
          domainPassRecords={domainPassRecords}
          placementBaselineCount={placementBaselineCount}
          placementTestedOutCount={placementTestedOutCount}
          placementRecords={placementRecords}
          examDate={settingsExamDate}
          dueCount={dueCount}
          openDomain={openDomain}
          commandDrills={COMMAND_DRILLS}
          theme={theme}
        />
      </AppNavigationProvider>
    )
  }

  if (view === 'objective' && !selectedObjective) {
    return <Spinner label="Loading topic…" />
  }

  if (view === 'objective' && selectedObjective) {
    return (
      <ObjectiveScreen
        objective={selectedObjective}
        progress={progress}
        apiOnline={apiOnline}
        offlineReady={offlineReady}
        packagingId={packagingId}
        onPackage={packageObjective}
        onBack={goBack}
        backLabel={objectiveBackLabel}
        onUpdateProgress={updateProgress}
        onMissed={handleMissed}
        missed={missed}
        onOpenLab={(id) => openLab(id, 'objective')}
        onSelectObjective={selectObjective}
        onOpenMissed={() => setView('missed')}
        onOpenTrapDrill={openTrapDrill}
        onOpenSubnet={() => navigateTo('subnet')}
        ExplainTab={ExplainTab}
        VisualAidTab={VisualAidTab}
        QuizTab={QuizTab}
        CLIDrillTab={CLIDrillTab}
        SubnettingTab={SubnettingTab}
        VLSMTab={VLSMTab}
        IPv6CalcTab={IPv6CalcTab}
        ACLCalcTab={ACLWildcardTab}
        SectionLabel={TabSectionLabel}
        StatusLabel={StatusLabel}
        StatusDot={StatusDot}
        ProgressBar={ProgressBar}
        objectiveTabId={objectiveTabId}
        objectivePanelId={objectivePanelId}
        commandDrills={COMMAND_DRILLS}
        computeMastery={computeMastery}
        logEvent={logEvent}
        masteryGate={MASTERY_GATE}
        enableSectionReview={enableSectionReview}
        bumpSessionStudy={bumpSessionStudy}
        celebrate={celebrate}
        haptic={haptic}
        examMode={settingsExamMode}
        premiumUnlocked={premiumUnlocked}
        onPremiumBlocked={handlePremiumBlocked}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
    )
  }

  if (view === 'mock') {
    return (
      <LazyRoute label="Loading mock exam…">
        <MockExamRoute
          onExit={() => { setMockDomainPrefill(null); setMockModePrefill?.(null); goBack() }}
          examMode={settingsExamMode}
          missed={missed}
          initialDomainId={mockDomainPrefill}
          initialMode={mockModePrefill?.mode || null}
          initialMissOnly={Boolean(mockModePrefill?.missOnly)}
          onOpenLab={(id) => openLab(id, 'mock')}
          onOpenTrapDrill={(prefill) => openTrapDrill(typeof prefill === 'string' ? { ckuId: prefill } : prefill)}
          onSelectObjective={(idOrObj) => {
            if (idOrObj && typeof idOrObj === 'object') {
              selectObjective(idOrObj)
              return
            }
            const obj = ALL_OBJECTIVES.find(o => o.id === idOrObj)
            if (obj) selectObjective(obj)
          }}
          onOpenMockInterview={() => navigateTo('mockinterview')}
          onOpenDomainPass={openDomainPass}
        />
      </LazyRoute>
    )
  }

  if (view === 'mockinterview') {
    return (
      <MockInterview
        progress={progress}
        missed={missed}
        premiumUnlocked={premiumUnlocked}
        onBack={goBack}
        onPremiumBlocked={handlePremiumBlocked}
      />
    )
  }

  if (view === 'tutor') {
    return premiumUnlocked
      ? <TutorChat progress={progress} missed={missed} onBack={goBack} />
      : <PremiumBlockedShell title="AI Tutor" onBack={goBack} />
  }

  return null
}
