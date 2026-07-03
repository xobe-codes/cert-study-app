import React, { useState, useEffect, useCallback } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../../ui/appTheme.js'
import {
  domainPassStatus,
  domainPassBadgeLabel,
} from './domainPassConfig.js'
import {
  loadDomainRecords,
  loadTimerEnabled,
  setTimerEnabled,
  countPassedDomains,
} from './domainPassStorage.js'
import DomainPassCompleteCard from './DomainPassCompleteCard.jsx'
import {
  homeCard,
  homeSectionLabel,
  homePill,
  homeBodySm,
  HOME_SECTION_GAP,
} from '../../home/homeUi.js'

function formatAttemptDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Hub for per-domain CCNA pass attempts — progress meter, timer toggle, domain cards.
 */
export default function DomainPassHub({ onExit, onStartDomain, onStartMockExam, onOpenSettings }) {
  const [records, setRecords] = useState({})
  const [timerOn, setTimerOn] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [recs, timer] = await Promise.all([loadDomainRecords(), loadTimerEnabled()])
      if (cancelled) return
      setRecords(recs)
      setTimerOn(timer)
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [])

  const passedCount = countPassedDomains(records, DOMAINS)
  const progressPct = Math.round((passedCount / DOMAINS.length) * 100)
  const allPassed = passedCount === DOMAINS.length

  const toggleTimer = useCallback(async () => {
    const next = !timerOn
    setTimerOn(next)
    await setTimerEnabled(next)
  }, [timerOn])

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onExit}>‹ Back</button>
      <h1 style={styles.h1}>Domain Pass</h1>

      <div style={homeCard({ border: `1px solid ${COLORS.purpleBorder}`, background: COLORS.purpleDim })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={homeSectionLabel(COLORS.purple)}>DOMAIN PASS: {passedCount}/{DOMAINS.length}</div>
          <span style={{ ...homePill('purple'), fontSize: 'var(--ccna-type-xs)' }}>{progressPct}% complete</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              borderRadius: 999,
              background: COLORS.purple,
              transition: 'width .3s ease',
            }}
          />
        </div>
        <p style={{ ...homeBodySm, marginTop: 10, marginBottom: 0 }}>
          Pass each domain at 80%+ to complete your blueprint. Tap a domain to start or retake.
        </p>
      </div>

      {allPassed && <DomainPassCompleteCard onStartMockExam={onStartMockExam} onOpenSettings={onOpenSettings} />}

      <div style={homeCard()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={homeSectionLabel()}>EXAM TIMER</div>
            <p style={{ ...homeBodySm, margin: 0 }}>
              {timerOn ? 'Countdown on — exam-faithful pacing' : 'Untimed — study at your pace'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={timerOn}
            onClick={toggleTimer}
            style={{
              ...styles.tabBtn(timerOn),
              flexShrink: 0,
              minWidth: 52,
              padding: '8px 14px',
              fontSize: 'var(--ccna-type-sm)',
            }}
          >
            {timerOn ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div role="group" aria-label="Domain pass cards">
        {DOMAINS.map(domain => {
          const record = records[domain.id]
          const status = domainPassStatus(record)
          const badge = domainPassBadgeLabel(status)
          const accent = accentColors(domain.accent)
          const badgeAccent = status === 'passed' ? 'mint' : status === 'retake' ? 'amber' : 'silver'
          const actionLabel = status === 'not_started' ? 'Start' : 'Retake'

          return (
            <button
              key={domain.id}
              type="button"
              className="ccna-hover"
              disabled={!loaded}
              onClick={() => onStartDomain?.(domain.id)}
              aria-label={`${domain.name} — ${badge} — ${actionLabel}`}
              style={{
                ...homeCard({ marginBottom: HOME_SECTION_GAP, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }),
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
                  Best: {record?.bestPct != null ? `${record.bestPct}%` : '—'}
                  {' · '}
                  Last: {formatAttemptDate(record?.lastAt ?? record?.lastAttemptAt)}
                </div>
                <span style={{ ...styles.small, color: accent.text, fontWeight: 600 }}>{actionLabel} →</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
