import React from 'react'
import { SubnettingTab } from './subnetPracticeTabs.jsx'
import StudyModeHeader from '../components/StudyModeHeader.jsx'

export function SubnetPracticeHome({ onBack }) {
  return (
    <div>
      <StudyModeHeader
        title="Subnetting Drill"
        onBack={onBack}
        subtitle="Practice network/broadcast/range, binary, and wildcard (ACL/OSPF) — works offline."
      />
      <SubnettingTab />
    </div>
  )
}
