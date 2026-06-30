import React from 'react'
import { COLORS, accentColors } from '../ui/appTheme.js'
import OverflowMarquee from './OverflowMarquee.jsx'

function clamp01(n) { return Math.max(0, Math.min(1, isFinite(n) ? n : 0)) }

export default function ProgressBar({ value, max = 1, label, sublabel, accent = 'purple', height = 8 }) {
  const pct = clamp01(max ? value / max : 0)
  const c = accentColors(accent)
  return (
    <div style={{ marginBottom: 10 }}>
      {(label || sublabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 8, minWidth: 0 }}>
          {label && <OverflowMarquee text={label} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }} />}
          {sublabel && <span style={{ fontSize: 'var(--ccna-type-xs)', color: c.text, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{sublabel}</span>}
        </div>
      )}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 999, height, overflow: 'hidden' }}>
        <div className="ccna-shimmer" style={{ width: `${pct * 100}%`, height: '100%', background: `linear-gradient(90deg, ${c.border}, ${c.text})`, borderRadius: 999, transition: 'width .5s ease' }} />
      </div>
    </div>
  )
}
