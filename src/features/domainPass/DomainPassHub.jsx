import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { getCuratedQuestions } from '../../data/ccnaCurated.js'
import { isChoiceQuestion } from '../../questionUtils.js'
import { COLORS, accentColors, styles } from '../../ui/appTheme.js'
import {
  domainPassStatus,
  domainPassBadgeLabel,
  sortDomainPassHubDomains,
} from './domainPassConfig.js'
import {
  loadDomainRecords,
  loadTimerEnabled,
  setTimerEnabled,
  countPassedDomains,
} from './domainPassStorage.js'
import { loadAllPlacementRecords } from '../domainPlacement/domainPlacementStorage.js'
import DomainPassCompleteCard from './DomainPassCompleteCard.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import { useDomainCardLongPress } from './useDomainCardLongPress.js'
import { collectDomainQuestionIds } from './buildDomainPassPool.js'
import {
  getDomainSeenMap,
  getExposureStats,
  loadDomainQuestionExposure,
} from './domainQuestionExposure.js'
import {
  homeCard,
  homeSectionLabel,
  homePill,
  homeBodySm,
  HOME_SECTION_GAP,
} from '../../home/homeUi.js'
import { isPlacementDomain } from '../domainPlacement/placementBlueprints.js'
import { DOMAIN_LEARNING_TAGLINE, domainDisplayTitle } from '../domainPlacement/domainLearningCopy.js'
import { PLACEMENT_BASELINE_REFRESH_EVENT } from '../../storageKeys.js'

function formatAttemptDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatBaselineLine(placementRecord) {
  const last = placementRecord?.lastAttempt
  if (!last) return 'Baseline: not set'
  if (last.testedOut) return `Baseline: ${last.pct}% tested out`
  return `Baseline: ${last.pct}%`
}

/**
 * Hub for per-domain CCNA pass attempts — progress meter, timer toggle, domain cards.
 */
export default function DomainPassHub({ onExit, onStartDomain, onOpenFocusPicker, onStartMockExam, onOpenSettings, onOpenDomainPlacement }) {
  const [records, setRecords] = useState({})
  const [placementRecords, setPlacementRecords] = useState({})
  const [exposureStore, setExposureStore] = useState({})
  const [timerOn, setTimerOn] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const getMcForObjective = useCallback((objectiveId) => (
    getCuratedQuestions(objectiveId).filter(isChoiceQuestion)
  ), [])

  const domainBankStats = useMemo(() => {
    const stats = {}
    for (const domain of DOMAINS) {
      const bankIds = collectDomainQuestionIds(domain, getMcForObjective)
      const seenById = getDomainSeenMap(exposureStore, domain.id)
      stats[domain.id] = {
        bankCount: bankIds.length,
        ...getExposureStats(domain.id, bankIds, seenById),
      }
    }
    return stats
  }, [exposureStore, getMcForObjective])

  const longPress = useDomainCardLongPress(onOpenFocusPicker)

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      const [recs, placement, timer, exposure] = await Promise.all([
        loadDomainRecords(),
        loadAllPlacementRecords(),
        loadTimerEnabled(),
        loadDomainQuestionExposure(),
      ])
      if (cancelled) return
      setRecords(recs)
      setPlacementRecords(placement || {})
      setExposureStore(exposure || {})
      setTimerOn(timer)
      setLoaded(true)
    }
    refresh()
    window.addEventListener(PLACEMENT_BASELINE_REFRESH_EVENT, refresh)
    return () => {
      cancelled = true
      window.removeEventListener(PLACEMENT_BASELINE_REFRESH_EVENT, refresh)
    }
  }, [])

  const sortedDomains = useMemo(
    () => sortDomainPassHubDomains(DOMAINS, { placementRecords, passRecords: records }),
    [placementRecords, records],
  )

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
      <StudyModeHeader title="Domain Pass" onBack={onExit} />

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
          {DOMAIN_LEARNING_TAGLINE}
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
        {sortedDomains.map(domain => {
          const record = records[domain.id]
          const placementRecord = placementRecords[domain.id]
          const bankStats = domainBankStats[domain.id]
          const hasExposureRecord = Boolean(record) || (bankStats?.seenCount ?? 0) > 0
          const hasBaseline = Boolean(placementRecord?.lastAttempt)
          const status = domainPassStatus(record)
          const badge = domainPassBadgeLabel(status)
          const accent = accentColors(domain.accent)
          const badgeAccent = status === 'passed' ? 'mint' : status === 'retake' ? 'amber' : 'silver'
          const actionLabel = status === 'not_started' ? 'Start' : 'Retake'
          const title = domainDisplayTitle(domain)

          return (
            <div
              key={domain.id}
              className="ccna-hover"
              onPointerDown={() => longPress.onPointerDown(domain.id)}
              onPointerUp={() => longPress.onPointerUp()}
              onPointerLeave={longPress.onPointerLeave}
              onPointerCancel={longPress.onPointerLeave}
              style={{
                ...homeCard({ marginBottom: HOME_SECTION_GAP, width: '100%', textAlign: 'left', fontFamily: 'inherit' }),
                border: `1px solid ${accent.border}`,
                background: accent.dim,
                touchAction: 'manipulation',
              }}
            >
              <button
                type="button"
                disabled={!loaded}
                onClick={() => onStartDomain?.(domain.id)}
                aria-label={`${title} — ${badge} — ${actionLabel}`}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, lineHeight: 1.35, marginBottom: 4 }}>
                      {title}
                    </div>
                    <span style={homePill(domain.accent)}>{domain.weight}% exam weight</span>
                  </div>
                  <span style={homePill(badgeAccent)}>{badge}</span>
                  {record?.skippedQuestionIds?.length > 0 && (
                    <span style={{ ...homePill('amber'), marginLeft: 6 }}>
                      {record.skippedQuestionIds.length} unfinished
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ ...homeBodySm, margin: 0 }}>
                    {formatBaselineLine(placementRecord)}
                    {' · '}
                    Best: {record?.bestPct != null ? `${record.bestPct}%` : '—'}
                    {' · '}
                    Last: {formatAttemptDate(record?.lastAt ?? record?.lastAttemptAt)}
                    {record?.focusAttempts?.length ? ` · ${record.focusAttempts.length} focus` : ''}
                  </div>
                  <span style={{ ...styles.small, color: accent.text, fontWeight: 600 }}>{actionLabel} →</span>
                </div>
                {hasExposureRecord && bankStats?.bankCount > 0 && (
                  <div style={{ ...homeBodySm, marginTop: 6, marginBottom: 0, color: COLORS.silverMid }}>
                    {bankStats.bankCount} in bank · {bankStats.seenCount} seen
                  </div>
                )}
              </button>
              {onOpenFocusPicker && (
                <button
                  type="button"
                  className="ccna-hover"
                  onClick={() => onOpenFocusPicker(domain.id)}
                  style={{
                    ...styles.secondaryBtn,
                    marginTop: 10,
                    marginBottom: 0,
                    width: '100%',
                    fontSize: 'var(--ccna-type-xs)',
                    padding: '8px 12px',
                    minHeight: 36,
                  }}
                >
                  Focus topics →
                </button>
              )}
              {isPlacementDomain(domain.id) && onOpenDomainPlacement && !hasBaseline && (
                <button
                  type="button"
                  className="ccna-hover"
                  onClick={() => onOpenDomainPlacement({ domainId: domain.id })}
                  style={{
                    ...styles.primaryBtn,
                    marginTop: 10,
                    marginBottom: 0,
                    width: '100%',
                    fontSize: 'var(--ccna-type-xs)',
                    padding: '8px 12px',
                    minHeight: 36,
                  }}
                >
                  Set baseline first →
                </button>
              )}
              {isPlacementDomain(domain.id) && onOpenDomainPlacement && hasBaseline && (
                <button
                  type="button"
                  className="ccna-hover"
                  onClick={() => onOpenDomainPlacement({ domainId: domain.id })}
                  style={{
                    ...styles.secondaryBtn,
                    marginTop: 10,
                    marginBottom: 0,
                    width: '100%',
                    fontSize: 'var(--ccna-type-xs)',
                    padding: '8px 12px',
                    minHeight: 36,
                  }}
                >
                  Check my level (placement) →
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
