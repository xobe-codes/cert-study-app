import React from 'react'
import StudyBlockCompleteCard from '../../components/StudyBlockCompleteCard.jsx'
import { ObjectiveBodyIntro } from './ObjectiveHeader.jsx'
import ObjectiveToolPanels from './ObjectiveToolPanels.jsx'
import ObjectiveTabPanels from './ObjectiveTabPanels.jsx'

/**
 * Scrollable body of the objective screen: why-line intro, study-block
 * completion card, tool calculators, and the main tab panels. Extracted from
 * ObjectiveScreen so the screen file stays a thin orchestration layer.
 */
export default function ObjectiveBody({
  objective, progress, missed, nextObj, tab, toolPanel, setTab, setToolPanel,
  whyLine, switchPrompt, blockState, confirmSwitch, setSwitchPrompt,
  computeMastery, masteryPct, ProgressBar, SectionLabel,
  objectiveTabId, objectivePanelId,
  ExplainTab, VisualAidTab, QuizTab, CLIDrillTab, SubnettingTab, VLSMTab, IPv6CalcTab, ACLCalcTab,
  onMissed, onScoreSaved, onSelectObjective, onOpenMissed, onOpenTrapDrill, onOpenLab,
  examMode, premiumUnlocked, onPremiumBlocked, showPreAssess, onUpdateProgress,
}) {
  return (
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
        onScoreSaved={onScoreSaved}
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
  )
}
