import React, { lazy, Suspense } from 'react'
import Spinner from '../../components/Spinner.jsx'

const MockExam = lazy(() => import('../../MockExam.jsx'))

export default function MockExamRoute({
  onExit,
  examMode,
  missed,
  initialDomainId,
  initialMode,
  initialMissOnly,
  onOpenLab,
  onOpenTrapDrill,
  onSelectObjective,
  onOpenMockInterview,
  onOpenDomainPass,
}) {
  return (
    <Suspense fallback={<Spinner label="Loading mock exam…" />}>
      <MockExam
        onExit={onExit}
        examMode={examMode}
        missed={missed}
        initialDomainId={initialDomainId}
        initialMode={initialMode}
        initialMissOnly={initialMissOnly}
        onOpenLab={onOpenLab}
        onOpenTrapDrill={onOpenTrapDrill}
        onSelectObjective={onSelectObjective}
        onOpenMockInterview={onOpenMockInterview}
        onOpenDomainPass={onOpenDomainPass}
      />
    </Suspense>
  )
}
