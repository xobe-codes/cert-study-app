import React, { useState, useEffect, useMemo } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import { homeCard, homePillCount, homeLinkBtn, homeBodySm } from '../../home/homeUi.js'
import HomeSectionLabel from '../../home/HomeSectionLabel.jsx'
import { buildWeakAreaRows, FIX_NEXT_CATEGORIES } from './weakAreaDashboard.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import { handoffStudyFromWeakSignal, handoffPassFocusBatch } from '../study/batchHandoff.js'
import { loadAllPlacementRecords } from '../domainPlacement/domainPlacementStorage.js'
import { resolveTrapWeakAction, executeTrapWeakAction } from '../../weaknessUtils.js'

const CATEGORY_ORDER = ['traps', 'baseline', 'domains', 'mock']

function groupRowsByCategory(rows) {
  const groups = []
  for (const key of CATEGORY_ORDER) {
    const items = rows.filter(r => r.category === key)
    if (items.length) groups.push({ key, label: FIX_NEXT_CATEGORIES[key], rows: items })
  }
  return groups
}

export default function WeakAreaDashboard({
  missed,
  readiness,
  domainPassRecords,
  placementRecords: placementRecordsProp,
  progress = {},
  onSelectObjective,
  onOpenTrapDrill,
  onOpenExamTraps,
  onOpenDomainPass,
  onOpenDomainPlacement,
  onOpenMock,
  onOpenMockInterview,
  onStudyNext,
}) {
  const [mockHistory, setMockHistory] = useState([])
  const [placementLoaded, setPlacementLoaded] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (placementRecordsProp != null) return undefined
    let cancelled = false
    ;(async () => {
      const recs = await loadAllPlacementRecords()
      if (!cancelled) setPlacementLoaded(recs || {})
    })()
    return () => { cancelled = true }
  }, [placementRecordsProp])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const hist = (await window.storage.getItem(STORAGE_KEYS.mockHistory)) || []
      if (!cancelled) setMockHistory(hist)
    })()
    return () => { cancelled = true }
  }, [])

  // Stable reference across renders — `?? {}` would create a new empty
  // object every render whenever both sources are nullish, which broke the
  // `input` useMemo below (placementRecords was always "new") and cascaded
  // into allRows/visibleRows recomputing on every render for no reason.
  const placementRecords = useMemo(() => placementRecordsProp ?? placementLoaded ?? {}, [placementRecordsProp, placementLoaded])

  const input = useMemo(
    () => ({ missed, readiness, domainPassRecords, mockHistory, placementRecords }),
    [missed, readiness, domainPassRecords, mockHistory, placementRecords],
  )

  const allRows = useMemo(() => buildWeakAreaRows(input), [input])
  const visibleRows = useMemo(
    () => (expanded ? allRows : buildWeakAreaRows(input, { limit: 3 })),
    [input, expanded, allRows],
  )
  const hiddenCount = allRows.length - Math.min(3, allRows.length)
  const groups = useMemo(() => groupRowsByCategory(visibleRows), [visibleRows])

  function handleRow(row) {
    switch (row.action) {
      case 'trapDrill': {
        const trapLabel = row.payload?.trapLabel
        if (trapLabel) {
          executeTrapWeakAction(resolveTrapWeakAction(trapLabel, missed), {
            onOpenTrapDrill,
            onOpenExamTraps,
            onStudyObjective: (objectiveId) => {
              const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Practice' })
              if (handoff) onSelectObjective?.(handoff)
            },
          })
        } else {
          onOpenTrapDrill?.(row.payload)
        }
        break
      }
      case 'domainPass':
        if (row.payload?.domainId && onOpenDomainPass) {
          handoffPassFocusBatch(row.payload.domainId, {
            missed,
            placementRecords,
            progress,
            onOpenDomainPass,
          })
        } else {
          onOpenDomainPass?.(row.payload)
        }
        break
      case 'domainPlacement':
        onOpenDomainPlacement?.(row.payload)
        break
      case 'study': {
        handoffStudyFromWeakSignal(row.payload.objectiveId, {
          missed,
          placementRecords,
          progress,
          onSelectObjective,
        })
        break
      }
      case 'mock':
        onOpenMock?.(row.payload)
        break
      case 'mockInterview':
        onOpenMockInterview?.()
        break
      default:
        break
    }
  }

  if (!allRows.length) {
    return (
      <div style={homeCard({ border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim })}>
        <HomeSectionLabel color={COLORS.mint}>FIX NEXT</HomeSectionLabel>
        <p style={{ ...homeBodySm, margin: '0 0 10px' }}>No urgent gaps</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {onOpenDomainPass && (
            <button type="button" className="ccna-hover" style={homeLinkBtn(COLORS.mint)} onClick={() => onOpenDomainPass()}>
              Domain Pass →
            </button>
          )}
          {onStudyNext && (
            <button type="button" className="ccna-hover" style={homeLinkBtn(COLORS.mint)} onClick={onStudyNext}>
              Study Next →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={homeCard({ border: `1px solid ${COLORS.roseBorder}`, background: COLORS.roseDim })}>
      <HomeSectionLabel color={COLORS.rose}>FIX NEXT</HomeSectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {groups.map((group) => (
          <div key={group.key}>
            <div style={{
              fontSize: 'var(--ccna-type-micro)',
              fontWeight: 700,
              color: COLORS.silverMid,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              padding: '6px 0 4px',
            }}>
              {group.label}
            </div>
            {group.rows.map((row, rowIdx) => (
              <div key={row.id} className="ccna-weak-area-row">
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    {row.badge && <span style={{ ...homePillCount('rose'), flexShrink: 0 }}>{row.badge}</span>}
                    <OverflowMarquee
                      text={row.label}
                      style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, fontWeight: 600, lineHeight: 1.35 }}
                    />
                  </div>
                  {row.why && (
                    <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, lineHeight: 1.3, paddingLeft: row.badge ? 36 : 0 }}>
                      {row.why}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="ccna-hover ccna-weak-area-row__cta"
                  onClick={() => handleRow(row)}
                  style={{
                    ...(rowIdx === 0 && group.key === groups[0]?.key ? styles.primaryBtn : styles.secondaryBtn),
                    width: 'auto',
                    flexShrink: 0,
                    alignSelf: 'center',
                    marginBottom: 0,
                    fontSize: 'var(--ccna-type-xs)',
                    padding: '8px 12px',
                    minHeight: 36,
                  }}
                >
                  {row.cta}
                </button>
              </div>
            ))}
          </div>
        ))}
        {!expanded && hiddenCount > 0 && (
          <button
            type="button"
            className="ccna-hover"
            onClick={() => setExpanded(true)}
            style={{
              ...homeLinkBtn(COLORS.rose),
              width: '100%',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            Show {hiddenCount} more
          </button>
        )}
      </div>
    </div>
  )
}
