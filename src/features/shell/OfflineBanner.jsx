import React from 'react'
import { COLORS } from '../../ui/appTheme.js'

export default function OfflineBanner() {
  return (
    <div style={{ background: COLORS.roseDim, borderBottom: `1px solid ${COLORS.roseBorder}`, color: COLORS.rose, fontSize: 'var(--ccna-type-sm)', textAlign: 'center', padding: '8px 12px' }}>
      Offline or API unreachable — AI explanations, quizzes & tutor chat won't work, but CLI drills and subnetting/VLSM practice still will.
    </div>
  )
}
