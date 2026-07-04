import React, { useState, useEffect } from 'react'
import { isCuratedPack, getObjectiveWhyLine } from './curatedDisplay.js'
import StudyBlockCompleteCard from './components/StudyBlockCompleteCard.jsx'
import { useStudyBlock } from './components/StudyBlockProvider.jsx'
import { useNavHint } from './components/NavHintProvider.jsx'
import { labsForObjective } from './data/ccnaLabs.js'
import ObjectiveHeader, { ObjectiveBodyIntro } from './features/objective/ObjectiveHeader.jsx'
import ObjectiveToolPanels from './features/objective/ObjectiveToolPanels.jsx'
import ObjectiveTabPanels from './features/objective/ObjectiveTabPanels.jsx'
import { mapLegacyTab, TOOL_TAB_MAP } from './features/objective/objectiveTabUtils.js'
import { useObjectiveQuizProgress } from './features/objective/useObjectiveQuizProgress.js'
import { useObjectiveSiblings, useObjectiveToolItems } from './features/objective/useObjectiveNavigation.js'
import { useObjectiveStudyBlockSwitch } from './features/objective/useObjectiveStudyBlockSwitch.js'

export default function ObjectiveScreen({
  objective, progress, apiOnline, offlineReady, packagingId, onPackage, onBack, backLabel = 'Back', onUpdateProgress, onMissed, missed, onOpenLab, onSelectObjective, onOpenMissed, onOpenTrapDrill,
  ExplainTab, VisualAidTab, QuizTab, CLIDrillTab, SubnettingTab, VLSMTab, IPv6CalcTab, ACLCalcTab,
  examMode = false,
  premiumUnlocked = false,
  onPremiumBlocked,
  SectionLabel, StatusLabel, StatusDot, ProgressBar, objectiveTabId, objectivePanelId, commandDrills,
  computeMastery, logEvent, masteryGate, enableSectionReview, bumpSessionStudy, celebrate, haptic,
  onToggleTheme,
  theme,
}) {
  const showNavHint = useNavHint()
  const { isActive, state: blockState, continueOnObjective, stop } = useStudyBlock()
  const { switchPrompt, setSwitchPrompt, handleSelectSibling, confirmSwitch } = useObjectiveStudyBlockSwitch({
    isActive, blockState, continueOnObjective, stop, onSelectObjective,
  })
  const objLabs = labsForObjective(objective.id)
  const curated = isCuratedPack(objective.id)
  const { prevObj, nextObj } = useObjectiveSiblings(objective)
  const toolItems = useObjectiveToolItems(objective.id, commandDrills)

  const legacyTab = objective.__initialTab
  const mappedMain = mapLegacyTab(legacyTab)
  const initialTool = legacyTab && TOOL_TAB_MAP[legacyTab] ? legacyTab : null
  const initialTab = mappedMain || 'Study'

  const [tab, setTab] = useState(initialTab)
  const [toolPanel, setToolPanel] = useState(initialTool)

  useEffect(() => {
    setTab(mapLegacyTab(objective.__initialTab) || 'Study')
    setToolPanel(objective.__initialTab && TOOL_TAB_MAP[objective.__initialTab] ? objective.__initialTab : null)
  }, [objective.id, objective.__initialTab])

  const status = progress[objective.id]?.status || 'unseen'
  const isOffline = offlineReady?.has(objective.id)
  const isPackaging = packagingId === objective.id
  const masteryPct = Math.round(computeMastery(progress[objective.id] || {}).score * 100)
  const whyLine = getObjectiveWhyLine(objective.id)
  const deepRead = isActive && tab === 'Study' && !toolPanel
  const showOfflineAction = !curated

  const handleScoreSaved = useObjectiveQuizProgress({
    objective,
    progress,
    status,
    nextObj,
    computeMastery,
    onUpdateProgress,
    logEvent,
    masteryGate,
    enableSectionReview,
    isOffline,
    apiOnline,
    premiumUnlocked,
    curated,
    onPackage,
    celebrate,
    haptic,
    bumpSessionStudy,
    showNavHint,
  })

  useEffect(() => {
    if (status === 'unseen') {
      onUpdateProgress(objective.id, { status: 'in_progress', lastSeen: Date.now() })
    } else {
      onUpdateProgress(objective.id, { lastSeen: Date.now() })
    }
    logEvent('user_viewed_topic', { objectiveId: objective.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  function openTool(id) {
    setToolPanel(id)
    setTab('Study')
  }

  const testedOut = !!progress[objective.id]?.testedOut
  const showPreAssess = status === 'unseen' && !testedOut

  return (
    <div className={`objective-shell${deepRead ? ' objective-shell--deep-read' : ''}`}>
      <ObjectiveHeader
        objective={objective}
        backLabel={backLabel}
        onBack={onBack}
        tab={tab}
        toolPanel={toolPanel}
        setTab={setTab}
        setToolPanel={setToolPanel}
        objectiveTabId={objectiveTabId}
        objectivePanelId={objectivePanelId}
        status={status}
        curated={curated}
        StatusLabel={StatusLabel}
        prevObj={prevObj}
        nextObj={nextObj}
        onSelectSibling={handleSelectSibling}
        objLabs={objLabs}
        onOpenLab={onOpenLab}
        isOffline={isOffline}
        isPackaging={isPackaging}
        apiOnline={apiOnline}
        premiumUnlocked={premiumUnlocked}
        onPackage={onPackage}
        onPremiumBlocked={onPremiumBlocked}
        showOfflineAction={showOfflineAction}
        toolItems={toolItems}
        onOpenTool={openTool}
        onToggleTheme={onToggleTheme}
        theme={theme}
      />

      <div className="objective-body internal-scroll">
        <ObjectiveBodyIntro
          whyLine={whyLine}
          switchPrompt={switchPrompt}
          blockState={blockState}
          confirmSwitch={confirmSwitch}
          setSwitchPrompt={setSwitchPrompt}
          tab={tab}
          toolPanel={toolPanel}
          progressEntry={progress[objective.id]}
          computeMastery={computeMastery}
          masteryPct={masteryPct}
          objective={objective}
          ProgressBar={ProgressBar}
        />
        <StudyBlockCompleteCard
          objectiveId={objective.id}
          masteryPct={masteryPct}
          onQuiz={() => { setTab('Practice'); setToolPanel(null) }}
        />
        <ObjectiveToolPanels
          toolPanel={toolPanel}
          objective={objective}
          SectionLabel={SectionLabel}
          CLIDrillTab={CLIDrillTab}
          SubnettingTab={SubnettingTab}
          VLSMTab={VLSMTab}
          IPv6CalcTab={IPv6CalcTab}
          ACLCalcTab={ACLCalcTab}
        />
        <ObjectiveTabPanels
          objective={objective}
          tab={tab}
          toolPanel={toolPanel}
          progress={progress}
          missed={missed}
          nextObj={nextObj}
          objectiveTabId={objectiveTabId}
          objectivePanelId={objectivePanelId}
          ExplainTab={ExplainTab}
          VisualAidTab={VisualAidTab}
          QuizTab={QuizTab}
          onMissed={onMissed}
          onScoreSaved={handleScoreSaved}
          onSelectObjective={onSelectObjective}
          onOpenMissed={onOpenMissed}
          onOpenTrapDrill={onOpenTrapDrill}
          onOpenLab={onOpenLab}
          onSwitchTab={(t) => setTab(t === 'Explain' ? 'Study' : t === 'Quiz' ? 'Practice' : t)}
          examMode={examMode}
          premiumUnlocked={premiumUnlocked}
          onPremiumBlocked={onPremiumBlocked}
          showPreAssessFirst={showPreAssess}
          onUpdateProgress={onUpdateProgress}
          setTab={setTab}
        />
      </div>
    </div>
  )
}
