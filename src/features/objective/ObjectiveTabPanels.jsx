import React from 'react'

export default function ObjectiveTabPanels({
  objective,
  tab,
  toolPanel,
  progress,
  missed,
  nextObj,
  objectiveTabId,
  objectivePanelId,
  ExplainTab,
  VisualAidTab,
  QuizTab,
  onMissed,
  onScoreSaved,
  onSelectObjective,
  onOpenMissed,
  onOpenTrapDrill,
  onOpenLab,
  onSwitchTab,
  examMode,
  premiumUnlocked,
  onPremiumBlocked,
  showPreAssessFirst,
  onUpdateProgress,
  setTab,
}) {
  if (toolPanel) return null

  if (tab === 'Study') {
    return (
      <div className="objective-tab-panel objective-reading-prose" role="tabpanel" id={objectivePanelId(objective.id, 'Study')} aria-labelledby={objectiveTabId(objective.id, 'Study')}>
        <ExplainTab
          objective={objective}
          progress={progress}
          onUpdateProgress={onUpdateProgress}
          layout="study"
          VisualAidTab={VisualAidTab}
          premiumUnlocked={premiumUnlocked}
          onPremiumBlocked={onPremiumBlocked}
          onStartPractice={() => setTab('Practice')}
          onOpenLab={onOpenLab}
        />
      </div>
    )
  }

  if (tab === 'Practice') {
    return (
      <div className="objective-tab-panel" role="tabpanel" id={objectivePanelId(objective.id, 'Practice')} aria-labelledby={objectiveTabId(objective.id, 'Practice')}>
        <QuizTab
          objective={objective}
          progress={progress}
          missed={missed}
          onMissed={onMissed}
          onScoreSaved={onScoreSaved}
          nextObjective={nextObj}
          onSelectObjective={onSelectObjective}
          onOpenMissed={onOpenMissed}
          onOpenTrapDrill={onOpenTrapDrill}
          onOpenLab={onOpenLab}
          onSwitchTab={(t) => onSwitchTab(t)}
          examMode={examMode}
          premiumUnlocked={premiumUnlocked}
          onPremiumBlocked={onPremiumBlocked}
          showPreAssessFirst={showPreAssessFirst}
          onUpdateProgress={onUpdateProgress}
        />
      </div>
    )
  }

  return null
}
