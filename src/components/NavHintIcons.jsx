import React from 'react'
import { COLORS } from '../ui/appTheme.js'

const stroke = 'currentColor'

export function NavHintIcon({ name, accent = 'mint', size = 44 }) {
  const color = {
    mint: COLORS.mint,
    sky: COLORS.sky,
    amber: COLORS.amber,
    rose: COLORS.rose,
    purple: COLORS.purpleGlow,
  }[accent] || COLORS.mint

  const common = { width: size, height: size, color, flexShrink: 0 }

  if (name === 'retry') {
    return (
      <svg className="nav-hint-icon nav-hint-icon--retry" viewBox="0 0 48 48" fill="none" aria-hidden style={common}>
        <path className="nav-hint-retry-arrow" d="M30 14H18v8" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path className="nav-hint-retry-ring" d="M18 22a14 14 0 1 0 4.1-9.9" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'next') {
    return (
      <svg className="nav-hint-icon nav-hint-icon--next" viewBox="0 0 48 48" fill="none" aria-hidden style={common}>
        <path className="nav-hint-next-line" d="M14 24h16" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        <path className="nav-hint-next-head" d="M26 18l8 6-8 6" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className="nav-hint-icon nav-hint-icon--check" viewBox="0 0 48 48" fill="none" aria-hidden style={common}>
      <circle className="nav-hint-check-ring" cx="24" cy="24" r="18" stroke={stroke} strokeWidth="2" opacity="0.35" />
      <path className="nav-hint-check-mark" d="M15 24.5l6.5 6.5L33 18" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
