import React, { useState } from 'react'
import StatsPage from '../../StatsPage.jsx'
import MetricsDashboard from '../metrics/MetricsDashboard.jsx'
import MissedReview from '../missed/MissedReview.jsx'
import MissedRetestSession from '../missed/MissedRetestSession.jsx'
import { buildMissedRetestPool, dedupeMissedByQuestionId } from '../missed/missedRetestPool.js'
import ReviewSession from '../review/ReviewSession.jsx'
import FocusModeSession from '../focus/FocusModeSession.jsx'

/** Practice / review / analytics routes extracted from App.jsx. */
export default function PracticeRoutes({
  view,
  progress,
  streak,
  missed,
  dueCount,
  onBack,
  onMissed,
  onDone,
  onOpenSection,
  onOpenMetrics,
  onOpenStats,
  onOpenReview,
  onOpenExamTraps,
  onOpenTrapDrill,
  onRemoveMissed,
  onSelectObjective,
  onOpenLab,
}) {
  const [retestConfig, setRetestConfig] = useState(null) // { mode: 'clear' | 'prove', trapFilter: string | null } | null

  if (view === 'missed' && retestConfig) {
    const pool = buildMissedRetestPool({
      missed,
      mode: retestConfig.mode,
      trapFilter: retestConfig.trapFilter,
      count: retestConfig.mode === 'prove' ? null : undefined,
    })
    return (
      <MissedRetestSession
        mode={retestConfig.mode}
        pool={pool}
        missedBankTotal={dedupeMissedByQuestionId(missed).length}
        onExit={() => setRetestConfig(null)}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenLab={onOpenLab}
        onSelectObjective={onSelectObjective}
      />
    )
  }
  if (view === 'missed') {
    return (
      <MissedReview
        missed={missed}
        onBack={onBack}
        onRemove={onRemoveMissed}
        onOpenExamTraps={onOpenExamTraps}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenLab={onOpenLab}
        onSelectObjective={onSelectObjective}
        onStartRetest={(mode, trapFilter) => setRetestConfig({ mode, trapFilter })}
        progress={progress}
      />
    )
  }
  if (view === 'review') {
    return (
      <ReviewSession
        onBack={onBack}
        onMissed={onMissed}
        onDone={onDone}
        onOpenSection={onOpenSection}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenLab={onOpenLab}
      />
    )
  }
  if (view === 'focus') {
    return (
      <FocusModeSession
        progress={progress}
        onBack={onBack}
        onMissed={onMissed}
        onDone={onDone}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenLab={onOpenLab}
      />
    )
  }
  if (view === 'stats') {
    return (
      <StatsPage
        progress={progress}
        streak={streak}
        onBack={onBack}
        onOpenMetrics={onOpenMetrics}
      />
    )
  }
  if (view === 'metrics') {
    return (
      <MetricsDashboard
        progress={progress}
        missed={missed}
        dueCount={dueCount}
        onBack={onBack}
        onSelectObjective={onSelectObjective}
        onOpenReview={onOpenReview}
        onOpenStats={onOpenStats}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenExamTraps={onOpenExamTraps}
      />
    )
  }
  return null
}
