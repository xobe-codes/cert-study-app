import React from 'react'
import { styles } from '../ui/appTheme.js'
import { SubnettingTab } from './subnetPracticeTabs.jsx'

export function SubnetPracticeHome({ onBack }) {
  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Subnetting Drill</h1>
      <div style={styles.small}>Practice network/broadcast/range calculations — works offline.</div>
      <SubnettingTab />
    </div>
  )
}
