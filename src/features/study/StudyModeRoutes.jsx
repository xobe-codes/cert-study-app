import React, { lazy } from 'react'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { getLab } from '../../data/ccnaLabs.js'
import { COLORS, accentColors, styles } from '../../ui/appTheme.js'
import LazyRoute from '../../components/LazyRoute.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import McChoices from '../../components/McChoices.jsx'
import { QuestionMeta } from '../../components/QuizQuestionChrome.jsx'
import { SubnetPracticeHome } from '../../tabs/studyQuizTabs.jsx'
import DomainPassHub from '../domainPass/DomainPassHub.jsx'
import DomainPassSession from '../domainPass/DomainPassSession.jsx'
import DomainPlacementIntro from '../domainPlacement/DomainPlacementIntro.jsx'
import DomainPlacementSession from '../domainPlacement/DomainPlacementSession.jsx'
import TrapDrillSession from '../trapDrill/TrapDrillSession.jsx'

const LabsHub = lazy(() => import('../../lab/LabsHub.jsx'))
const LabView = lazy(() => import('../../lab/LabView.jsx'))
const TopicFocusStudio = lazy(() => import('../../topic/TopicFocusStudio.jsx'))
const TopicFocusSession = lazy(() => import('../../topic/TopicFocusSession.jsx'))
const CommandHubStudio = lazy(() => import('../../commands/CommandHubStudio.jsx'))
const StudyLensStudio = lazy(() => import('../../lens/StudyLensStudio.jsx'))
const ExamTrapStudyMode = lazy(() => import('../../ExamTrapStudyMode.jsx'))
const RoutingDecoderMode = lazy(() => import('../../RoutingDecoderMode.jsx'))
const ExtraStudyMode = lazy(() => import('../../ExtraStudyMode.jsx'))

/** Labs, studios, domain pass, and supplemental study routes extracted from App.jsx. */
export default function StudyModeRoutes({
  view,
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
  activeDomainPlacementId,
  setActiveDomainPlacementId,
  placementSessionMode = null,
  exitDomainPlacement,
  settingsExamMode,
  missed,
  onBack,
  onNavigate,
  onPushView,
  onOpenLab,
  onOpenMockExam,
  labsDomainPrefill = null,
  onOpenTrapDrill,
  onOpenDomainPlacement,
  onSelectObjective,
  onRefreshDomainPassCount,
  onMissed,
  onDone,
  onOpenSettings,
  celebrate,
  haptic,
  premiumUnlocked,
  onPremiumBlocked,
}) {
  if (view === 'labs') {
    return (
      <LazyRoute label="Loading labs…">
        <LabsHub
          onBack={onBack}
          initialDomainFilter={labsDomainPrefill}
          onOpenLab={(id) => onOpenLab(id, 'labs')}
        />
      </LazyRoute>
    )
  }
  if (view === 'lab' && selectedLab) {
    return (
      <LazyRoute label="Loading lab…">
        <LabView
          bundle={getLab(selectedLab)}
          onBack={() => {
            if (labReturn === 'objective') onNavigate('objective')
            else if (labReturn === 'mock') onNavigate('mock')
            else if (labReturn === 'domainpass') onNavigate('domainpass')
            else if (labReturn === 'domainplacement') onNavigate('domainplacement')
            else onNavigate('labs')
          }}
          onOpenLab={(id) => onOpenLab(id, labReturn || 'labs')}
          celebrate={celebrate}
          haptic={haptic}
        />
      </LazyRoute>
    )
  }
  if (view === 'topicfocus') {
    return (
      <LazyRoute label="Loading topic focus…">
        <TopicFocusStudio
          missed={missed}
          haptic={haptic}
          onBack={onBack}
          onStart={(config) => { setTopicFocusConfig(config); onPushView('topicfocussession') }}
        />
      </LazyRoute>
    )
  }
  if (view === 'topicfocussession' && topicFocusConfig) {
    return (
      <LazyRoute label="Loading session…">
        <TopicFocusSession
          config={topicFocusConfig}
          onBack={onBack}
          onMissed={onMissed}
          onDone={onDone}
        />
      </LazyRoute>
    )
  }
  if (view === 'commandhub') {
    return (
      <LazyRoute label="Loading command hub…">
        <CommandHubStudio
          onBack={onBack}
          onSelectObjective={(objectiveId) => {
            const obj = ALL_OBJECTIVES.find(o => o.id === objectiveId)
            if (obj) onSelectObjective(obj)
          }}
        />
      </LazyRoute>
    )
  }
  if (view === 'studylens') {
    return (
      <LazyRoute label="Loading study lens…">
        <StudyLensStudio
          onBack={onBack}
          premiumUnlocked={premiumUnlocked}
          onPremiumBlocked={onPremiumBlocked}
          onSelectObjective={(objectiveId) => {
            const obj = ALL_OBJECTIVES.find(o => o.id === objectiveId)
            if (obj) onSelectObjective(obj)
          }}
        />
      </LazyRoute>
    )
  }
  if (view === 'examtraps') {
    return (
      <LazyRoute label="Loading exam traps…">
        <ExamTrapStudyMode
          styles={styles}
          onBack={onBack}
          prefill={examTrapPrefill}
          onPrefillConsumed={clearExamTrapPrefill}
        />
      </LazyRoute>
    )
  }
  if (view === 'trapdrill') {
    return (
      <TrapDrillSession
        key={trapDrillPrefill?.ckuId ?? 'all'}
        prefill={trapDrillPrefill}
        onBack={() => { clearTrapDrillPrefill(); onBack() }}
      />
    )
  }
  if (view === 'domainpass' && !activeDomainPassId) {
    return (
      <DomainPassHub
        onExit={onBack}
        onStartDomain={(id) => setActiveDomainPassId(id)}
        onStartMockExam={onOpenMockExam}
        onOpenSettings={onOpenSettings}
        onOpenDomainPlacement={onOpenDomainPlacement}
      />
    )
  }
  if (view === 'domainpass' && activeDomainPassId) {
    return (
      <DomainPassSession
        key={activeDomainPassId}
        domainId={activeDomainPassId}
        onExit={() => { setActiveDomainPassId(null); onRefreshDomainPassCount() }}
        onOpenMock={(id) => onOpenMockExam({ domainId: id })}
        onOpenTrapDrill={(ckuId) => onOpenTrapDrill({ ckuId })}
        onOpenLab={(id) => onOpenLab(id, 'domainpass')}
        examMode={settingsExamMode}
        missed={missed}
      />
    )
  }
  if (view === 'domainplacement' && !activeDomainPlacementId) {
    return (
      <DomainPlacementIntro
        onExit={onBack}
        onStart={(id) => setActiveDomainPlacementId(id)}
      />
    )
  }
  if (view === 'domainplacement' && activeDomainPlacementId) {
    return (
      <DomainPlacementSession
        key={`${activeDomainPlacementId}-${placementSessionMode || 'baseline'}`}
        domainId={activeDomainPlacementId}
        sessionModeHint={placementSessionMode}
        onExit={exitDomainPlacement || (() => setActiveDomainPlacementId(null))}
        onStudyObjective={(objectiveId) => {
          const obj = ALL_OBJECTIVES.find(o => o.id === objectiveId)
          if (obj) onSelectObjective(obj)
        }}
        onOpenTrapDrill={(prefill) => onOpenTrapDrill(prefill)}
        onOpenLab={(id) => onOpenLab(id, 'domainplacement')}
      />
    )
  }
  if (view === 'subnet') {
    return <SubnetPracticeHome onBack={onBack} />
  }
  if (view === 'routing') {
    return (
      <LazyRoute label="Loading routing decoder…">
        <RoutingDecoderMode styles={styles} COLORS={COLORS} onBack={onBack} />
      </LazyRoute>
    )
  }
  if (view === 'extrastudy') {
    return (
      <LazyRoute label="Loading extra study…">
        <ExtraStudyMode
          styles={styles}
          COLORS={COLORS}
          accentColors={accentColors}
          AnswerReview={AnswerReview}
          QuestionMeta={QuestionMeta}
          McChoices={McChoices}
          onBack={onBack}
        />
      </LazyRoute>
    )
  }
  return null
}
