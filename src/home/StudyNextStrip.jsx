import React from 'react'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'

export default function StudyNextStrip({ next, onSelectObjective, onOpenReview, sticky = false }) {
  if (!next) return null
  const c = accentColors(next.accent)
  const onClick = next.kind === 'review'
    ? onOpenReview
    : () => onSelectObjective?.({ ...next.objective, __initialTab: next.tab })
  return (
    <button
      type="button"
      className="ccna-hover"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
        cursor: 'pointer', fontFamily: 'inherit',
        background: c.dim, border: `1px solid ${c.border}`, borderRadius: 12,
        padding: '10px 12px', marginBottom: sticky ? 0 : 10,
      }}
    >
      <span style={{ ...styles.pill(next.accent), fontSize: 10, flexShrink: 0 }}>STUDY NEXT</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: COLORS.silver, lineHeight: 1.35 }}>{next.shortTitle}</span>
      <span style={{ color: c.text, fontSize: 16, lineHeight: 1 }} aria-hidden="true">›</span>
    </button>
  )
}
