import React, { lazy, Suspense } from 'react'
import Spinner from '../../components/Spinner.jsx'

const LabExam = lazy(() => import('./LabExam.jsx'))

export default function LabExamRoute({
  onExit,
  onSelectObjective,
  onOpenLabs,
  haptic,
}) {
  return (
    <Suspense fallback={<Spinner label="Loading lab exam…" />}>
      <LabExam
        onExit={onExit}
        onSelectObjective={onSelectObjective}
        onOpenLabs={onOpenLabs}
        haptic={haptic}
      />
    </Suspense>
  )
}
