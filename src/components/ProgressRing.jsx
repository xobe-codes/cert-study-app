import React, { useState, useEffect, useId } from 'react'
import { COLORS, accentColors } from '../ui/appTheme.js'

function clamp01(n) { return Math.max(0, Math.min(1, isFinite(n) ? n : 0)) }
function useCountUp(target, ms = 700) {
  const [n, setN] = useState(target)
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (prefersReduced) { setN(target); return }
    let raf, start
    const tick = t => {
      start ??= t
      const p = Math.min((t - start) / ms, 1)
      setN(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms, prefersReduced])
  return n
}
export default function ProgressRing({ value, size = 72, stroke = 7, accent = 'purple', caption }) {
  const pct = clamp01(value)
  const shown = useCountUp(pct, 800)
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const c = accentColors(accent)
  const gid = useId().replace(/:/g, '')
  const pctLabel = `${Math.round(shown * 100)}%`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          role="img" aria-label={caption ? `${caption}: ${pctLabel}` : pctLabel}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c.border} /><stop offset="100%" stopColor={c.text} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} opacity="0.55" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - shown)} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ filter: `drop-shadow(0 0 4px ${c.text}55)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: Math.max(11, size * 0.24), fontWeight: 700, color: COLORS.silver, lineHeight: 1 }}>{pctLabel}</span>
        </div>
      </div>
      {caption && <span style={{ fontSize: 11, color: COLORS.silverMid, textAlign: 'center', maxWidth: size + 16, lineHeight: 1.3 }}>{caption}</span>}
    </div>
  )
}
