import React from 'react'
import { COLORS } from '../../ui/appTheme.js'
import { homePill } from '../../home/homeUi.js'
import { BASELINE_STATUS_META } from './domainBaselineProfile.js'

/** Compact status chip — symbol + label for strong / weak / building / not checked. */
export default function DomainBaselineStatusPill({ status, compact = false, showLabel = true }) {
  const meta = BASELINE_STATUS_META[status] || BASELINE_STATUS_META.not_checked
  const label = compact ? meta.symbol : (showLabel ? `${meta.symbol} ${meta.label}` : meta.symbol)

  return (
    <span
      className={`ccna-baseline-pill ccna-baseline-pill--${status}`}
      style={{
        ...homePill(meta.accent),
        flexShrink: 0,
        fontWeight: 700,
        letterSpacing: compact ? 0 : undefined,
      }}
      title={meta.label}
      aria-label={meta.label}
    >
      {label}
    </span>
  )
}

/** Inline dot + symbol for objective rows (no pill background). */
export function DomainBaselineStatusMark({ status }) {
  const meta = BASELINE_STATUS_META[status] || BASELINE_STATUS_META.not_checked
  return (
    <span
      className={`ccna-baseline-mark ccna-baseline-mark--${status}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: 999,
        flexShrink: 0,
        fontSize: 'var(--ccna-type-micro)',
        fontWeight: 800,
        color: COLORS[meta.accent],
        background: COLORS[`${meta.accent}Dim`] || COLORS.surface,
        border: `1px solid ${COLORS[`${meta.accent}Border`] || COLORS.border}`,
      }}
      title={meta.label}
      aria-hidden
    >
      {meta.symbol}
    </span>
  )
}
