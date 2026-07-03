import React from 'react'
import { COLORS } from '../ui/appTheme.js'

/** Small icon+label header used on objective tabs and study panels. */
export default function TabSectionLabel({ icon, label }) {
  return (
    <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, letterSpacing: 0.9, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
      <span>{icon}</span><span>{label}</span>
    </div>
  )
}
