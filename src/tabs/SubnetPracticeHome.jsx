import React from 'react'
import { styles } from '../ui/appTheme.js'
import { SubnettingTab } from './subnetPracticeTabs.jsx'
import StudyModeHeader from '../components/StudyModeHeader.jsx'

export function SubnetPracticeHome({ onBack }) {
  return (
    <div>
      <StudyModeHeader
        title="Subnetting Drill"
        onBack={onBack}
        subtitle="Practice network/broadcast/range calculations — works offline."
      />
      <SubnettingTab />
    </div>
  )
}
