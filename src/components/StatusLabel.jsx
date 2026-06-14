import React from 'react'
import { COLORS } from '../ui/appTheme.js'

export default function StatusLabel({ status }) {
  const map = { mastered: 'Mastered', in_progress: 'In Progress', unseen: 'Not Started' }
  const color = status === 'mastered' ? COLORS.mint : status === 'in_progress' ? COLORS.purpleGlow : COLORS.silverMid
  return <span style={{ fontSize: 'var(--ccna-type-xs)', color, fontWeight: 600 }}>{map[status] || 'Not Started'}</span>
}
