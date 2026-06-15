import React from 'react'
import { COLORS, accentColors } from '../ui/appTheme.js'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import { homeAccentStrip, homePill } from './homeUi.js'

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
        ...homeAccentStrip(next.accent),
        marginBottom: sticky ? 0 : undefined,
      }}
    >
      <span style={{ ...homePill(next.accent), flexShrink: 0 }}>STUDY NEXT</span>
      <OverflowMarquee
        text={next.shortTitle}
        style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, lineHeight: 1.35 }}
      />
      <span style={{ color: c.text, fontSize: 'var(--ccna-type-lg)', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">›</span>
    </button>
  )
}
