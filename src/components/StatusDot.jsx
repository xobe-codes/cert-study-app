import React from 'react'
import { COLORS } from '../ui/appTheme.js'

export default function StatusDot({ status }) {
  const color = status === 'mastered' ? COLORS.mint : status === 'in_progress' ? COLORS.purpleGlow : COLORS.silverDim
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: color, marginRight: 8, flexShrink: 0 }} />
}
