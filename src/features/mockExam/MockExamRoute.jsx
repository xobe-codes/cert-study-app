import React, { lazy, Suspense } from 'react'
import Spinner from '../../components/Spinner.jsx'

const MockExam = lazy(() => import('../../MockExam.jsx'))

export default function MockExamRoute({
  onExit,
  examMode,
  missed,
  initialDomainId,
  onOpenLab,
  onOpenTrapDrill,
  onSelectObjective,
  onOpenMockInterview,
}) {
  return (
    <Suspense fallback={<Spinner label="Loading mock exam…" />}>
      <MockExam
        onExit={onExit}
        examMode={examMode}
        missed={missed}
        initialDomainId={initialDomainId}
        onOpenLab={onOpenLab}
        onOpenTrapDrill={onOpenTrapDrill}
        onSelectObjective={onSelectObjective}
        onOpenMockInterview={onOpenMockInterview}
      />
    </Suspense>
  )
}
