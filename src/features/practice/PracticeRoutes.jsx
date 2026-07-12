import React from 'react'
import StatsPage from '../../StatsPage.jsx'
import MetricsDashboard from '../metrics/MetricsDashboard.jsx'
import MissedReview from '../missed/MissedReview.jsx'
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
