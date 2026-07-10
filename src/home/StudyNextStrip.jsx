import React from 'react'
import { COLORS, accentColors } from '../ui/appTheme.js'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import { homeAccentStrip, homePill } from './homeUi.js'

export default function StudyNextStrip({ next, onSelectObjective, onOpenReview, onOpenDomainPlacement, sticky = false }) {
  if (!next) return null
  const c = accentColors(next.accent)
  const onClick = next.kind === 'review'
    ? onOpenReview
    : (next.kind === 'baseline' || next.kind === 'baselineRemap')
      ? () => onOpenDomainPlacement?.({ domainId: next.domainId, expandOnReturn: true })
      : () => onSelectObjective?.({ ...next.objective, __initialTab: next.tab })
  return (
    <button
      type="button"
      className="ccna-hover"
      onClick={onClick}
      style={{
        ...homeAccentStrip(next.accent),
        marginBottom: sticky ? 0 : undefined,
        flexDirection: next.why ? 'column' : undefined,
        alignItems: next.why ? 'stretch' : undefined,
        gap: next.why ? 4 : 8,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, width: '100%' }}>
        <span style={{ ...homePill(next.accent), flexShrink: 0 }}>STUDY NEXT</span>
        <OverflowMarquee
          text={next.shortTitle}
          style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, lineHeight: 1.35, flex: 1, minWidth: 0 }}
        />
        <span style={{ color: c.text, fontSize: 'var(--ccna-type-lg)', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">›</span>
      </span>
      {next.why && (
        <span style={{
          fontSize: 'var(--ccna-type-micro)',
          color: COLORS.silverMid,
          lineHeight: 1.3,
          paddingLeft: 2,
        }}>
          {next.why}
        </span>
      )}
    </button>
  )
}
