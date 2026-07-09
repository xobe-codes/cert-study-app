import React, { useState, useEffect, useMemo } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import { homeCard, homePillCount } from '../../home/homeUi.js'
import HomeSectionLabel from '../../home/HomeSectionLabel.jsx'
import { buildWeakAreaRows } from './weakAreaDashboard.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import { loadAllPlacementRecords } from '../domainPlacement/domainPlacementStorage.js'

export default function WeakAreaDashboard({
  missed,
  readiness,
  domainPassRecords,
  onSelectObjective,
  onOpenTrapDrill,
  onOpenDomainPass,
  onOpenDomainPlacement,
  onOpenMock,
  onOpenMockInterview,
}) {
  const [mockHistory, setMockHistory] = useState([])
  const [placementRecords, setPlacementRecords] = useState({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const hist = (await window.storage.getItem(STORAGE_KEYS.mockHistory)) || []
      const recs = await loadAllPlacementRecords()
      if (!cancelled) {
        setMockHistory(hist)
        setPlacementRecords(recs || {})
      }
    })()
    return () => { cancelled = true }
  }, [])

  const rows = useMemo(
    () => buildWeakAreaRows({ missed, readiness, domainPassRecords, mockHistory, placementRecords }),
    [missed, readiness, domainPassRecords, mockHistory, placementRecords],
  )

  if (!rows.length) return null

  function handleRow(row) {
    switch (row.action) {
      case 'trapDrill':
        onOpenTrapDrill?.(row.payload)
        break
      case 'domainPass':
        onOpenDomainPass?.(row.payload)
        break
      case 'domainPlacement':
        onOpenDomainPlacement?.(row.payload)
        break
      case 'study': {
        const handoff = buildStudyObjectiveHandoff(row.payload.objectiveId, { tab: 'Practice' })
        if (handoff) onSelectObjective?.(handoff)
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

  return (
    <div style={homeCard({ border: `1px solid ${COLORS.roseBorder}`, background: COLORS.roseDim })}>
      <HomeSectionLabel color={COLORS.rose}>WEAK AREAS</HomeSectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((row) => (
          <div key={row.id} className="ccna-weak-area-row">
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                {row.badge && <span style={{ ...homePillCount('rose'), flexShrink: 0 }}>{row.badge}</span>}
                <OverflowMarquee
                  text={row.label}
                  style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, fontWeight: 600, lineHeight: 1.35 }}
                />
              </div>
            </div>
            <button
              type="button"
              className="ccna-hover"
              onClick={() => handleRow(row)}
              style={{
                ...styles.secondaryBtn,
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
    </div>
  )
}
