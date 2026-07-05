import React, { useState, useEffect } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { COLORS, styles, accentColors } from '../../ui/appTheme.js'
import { PLACEMENT_QUESTION_COUNT } from './domainPlacementConfig.js'
import { placementDomainIds } from './placementBlueprints.js'
import { loadAllPlacementRecords } from './domainPlacementStorage.js'
import { placementReadyBand } from './domainPlacementConfig.js'
import { PLACEMENT_BASELINE_REFRESH_EVENT } from '../../storageKeys.js'
import {
  homeCard,
  homeSectionLabel,
  homePill,
  homeBodySm,
  HOME_SECTION_GAP,
} from '../../home/homeUi.js'

function formatDate(ts) {
  if (!ts) return 'Never'
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Hub — pick a domain for fixed-set placement (all 6 CCNA domains). */
export default function DomainPlacementIntro({ onExit, onStart }) {
  const [records, setRecords] = useState({})
  const [loaded, setLoaded] = useState(false)

  const placementDomains = placementDomainIds()
    .map(id => DOMAINS.find(d => d.id === id))
    .filter(Boolean)

  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      loadAllPlacementRecords().then(rec => {
        if (!cancelled) {
          setRecords(rec || {})
          setLoaded(true)
        }
      })
    }
    refresh()
    window.addEventListener(PLACEMENT_BASELINE_REFRESH_EVENT, refresh)
    return () => {
      cancelled = true
      window.removeEventListener(PLACEMENT_BASELINE_REFRESH_EVENT, refresh)
    }
  }, [])

  const checkedCount = placementDomains.filter(d => records[d.id]?.lastAttempt).length

  return (
    <div className="ccna-placement-intro">
      <button type="button" style={styles.backBtn} onClick={onExit}>‹ Back</button>
      <h1 style={styles.h1}>Domain baseline</h1>

      <div style={homeCard({ border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim })}>
        <div style={homeSectionLabel(COLORS.sky)}>MAP STRONG VS WEAK</div>
        <p style={{ ...homeBodySm, margin: 0 }}>
          {PLACEMENT_QUESTION_COUNT}-question check per domain — test out whole domains at 80%+, mark strong subsections complete, highlight weak ones so you study faster.
          Untimed · instant feedback · one recommended next step.
        </p>
        {loaded && (
          <p style={{ ...homeBodySm, margin: '8px 0 0', color: COLORS.silverMid }}>
            Baselines recorded: {checkedCount}/{placementDomains.length}
          </p>
        )}
      </div>

      <div role="group" aria-label="Domain placement cards">
        {placementDomains.map(domain => {
          const record = records[domain.id]
          const last = record?.lastAttempt
          const band = last ? placementReadyBand(last.pct) : null
          const testedOut = last?.testedOut
          const accent = accentColors(domain.accent)
          const badgeAccent = testedOut ? 'mint' : last ? band.accent : 'silver'
          const badge = testedOut ? '✓ Tested out' : last ? `${last.pct}%` : 'Not started'
          const actionLabel = last ? 'Retake' : 'Start'

          return (
            <button
              key={domain.id}
              type="button"
              className="ccna-hover"
              disabled={!loaded}
              onClick={() => onStart?.(domain.id)}
              aria-label={`${domain.name} placement — ${badge} — ${actionLabel}`}
              style={{
                ...homeCard({
                  marginBottom: HOME_SECTION_GAP,
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }),
                border: `1px solid ${accent.border}`,
                background: accent.dim,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, lineHeight: 1.35, marginBottom: 4 }}>
                    {domain.name}
                  </div>
                  <span style={homePill(domain.accent)}>{domain.weight}% exam weight</span>
                </div>
                <span style={homePill(badgeAccent)}>{badge}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ ...homeBodySm, margin: 0 }}>
                  {last
                    ? `Last: ${formatDate(last.at)} · ${last.correct}/${last.total}${last.trapPct != null ? ` · Traps ${last.trapPct}%` : ''}`
                    : 'Establish your baseline for this domain'}
                </div>
                <span style={{ ...styles.small, color: accent.text, fontWeight: 600 }}>{actionLabel} →</span>
              </div>
              {last?.weakObjectives?.length > 0 && (
                <div style={{ ...styles.small, marginTop: 8, color: COLORS.purple }}>
                  Retake adapts — weak objectives first: {last.weakObjectives.slice(0, 3).join(', ')}
                  {last.weakObjectives.length > 3 ? '…' : ''}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <p style={{ ...styles.small, marginTop: 4, color: COLORS.silverMid }}>
        Domain Pass tests pass/fail at 80%. Baseline maps strong vs weak and tests out whole domains when ready.
      </p>
    </div>
  )
}
