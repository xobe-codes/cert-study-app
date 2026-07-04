import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { getInterpretAlternate, isConfigLab } from '../data/labTierStrategy.js'
import { getLab } from '../data/ccnaLabs.js'

export function LabTierBadge({ lab }) {
  if (lab.interpretOnly) {
    return <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-micro)' }}>INTERPRET</span>
  }
  if (isConfigLab(lab)) {
    return <span style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)' }}>CONFIG</span>
  }
  return null
}

export function LabConfigBanner({ labId, onOpenLab }) {
  const alternateId = getInterpretAlternate(labId)
  const alternate = alternateId ? getLab(alternateId)?.lab : null
  if (!alternate) return null

  return (
    <div className="ccna-lab-tier-banner" style={{ ...styles.card, background: COLORS.amberDim, border: `1px solid ${COLORS.amberBorder}`, marginBottom: 12 }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 4 }}>ADVANCED CONFIG LAB</div>
      <p style={{ ...styles.small, margin: '0 0 8px', lineHeight: 1.45 }}>
        This lab expects full IOS config entry (<code>conf t</code>, interface commands). For exam prep, try the interpret-only lab first — read <code>show</code> output without typing config.
      </p>
      <button type="button" style={styles.secondaryBtn} onClick={() => onOpenLab?.(alternateId)}>
        Open interpret lab: {alternate.title}
      </button>
    </div>
  )
}
