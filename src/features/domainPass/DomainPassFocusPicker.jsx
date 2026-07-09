import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../../ui/appTheme.js'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import {
  homeCard,
  homeSectionLabel,
  homePill,
  homeBodySm,
  HOME_SECTION_GAP,
} from '../../home/homeUi.js'
import { domainPassFocusQuestionCount } from './domainPassConfig.js'
import { loadDomainRecords } from './domainPassStorage.js'
import { loadAllPlacementRecords } from '../domainPlacement/domainPlacementStorage.js'
import { buildDomainBaselineSummary } from '../domainPlacement/domainBaselineProfile.js'

/**
 * Pick objectives within a domain for a focus pass — checkbox list with weak-only chip.
 */
export default function DomainPassFocusPicker({ domainId, onBack, onStart }) {
  const domain = useMemo(() => DOMAINS.find(d => d.id === domainId), [domainId])
  const [selected, setSelected] = useState(() => new Set())
  const [weakOnly, setWeakOnly] = useState(false)
  const [weakIds, setWeakIds] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [records, placement] = await Promise.all([
        loadDomainRecords(),
        loadAllPlacementRecords(),
      ])
      if (cancelled || !domain) return
      const passWeak = records?.[domain.id]?.weakObjectives || []
      const placementSummary = buildDomainBaselineSummary({
        domain,
        lastAttempt: placement?.[domain.id]?.lastAttempt,
      })
      const placementWeak = placementSummary?.weakObjectives || []
      const merged = [...new Set([...placementWeak, ...passWeak])]
        .filter(id => domain.objectives.some(o => o.id === id))
      setWeakIds(merged)
    })()
    return () => { cancelled = true }
  }, [domain])

  const visibleObjectives = useMemo(() => {
    if (!domain) return []
    if (!weakOnly) return domain.objectives
    const weakSet = new Set(weakIds)
    return domain.objectives.filter(o => weakSet.has(o.id))
  }, [domain, weakOnly, weakIds])

  const selectedIds = useMemo(() => [...selected], [selected])
  const questionEstimate = domainPassFocusQuestionCount(selectedIds.length)

  const toggleObjective = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAllVisible = useCallback(() => {
    setSelected(new Set(visibleObjectives.map(o => o.id)))
  }, [visibleObjectives])

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  const applyWeakOnly = useCallback(() => {
    const next = !weakOnly
    setWeakOnly(next)
    if (next && weakIds.length) {
      setSelected(new Set(weakIds))
    }
  }, [weakOnly, weakIds])

  const canStart = selectedIds.length > 0

  if (!domain) {
    return (
      <div>
        <StudyModeHeader title="Focus topics" onBack={onBack} />
        <div style={homeCard()}>Unknown domain.</div>
      </div>
    )
  }

  const accent = accentColors(domain.accent)

  return (
    <div>
      <StudyModeHeader title={`${domain.name} — Focus`} onBack={onBack} backLabel="Domain Pass" />

      <div style={homeCard({ border: `1px solid ${accent.border}`, background: accent.dim })}>
        <div style={homeSectionLabel(domain.accent)}>FOCUS PASS</div>
        <p style={{ ...homeBodySm, margin: '0 0 10px' }}>
          Pick 1+ objectives to practice. Focus sessions do not replace your full domain pass record.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button type="button" style={{ ...styles.secondaryBtn, marginBottom: 0, fontSize: 'var(--ccna-type-xs)', padding: '6px 10px', minHeight: 32 }} onClick={selectAllVisible}>
            Select all
          </button>
          <button type="button" style={{ ...styles.secondaryBtn, marginBottom: 0, fontSize: 'var(--ccna-type-xs)', padding: '6px 10px', minHeight: 32 }} onClick={clearSelection}>
            Clear
          </button>
          {weakIds.length > 0 && (
            <button
              type="button"
              style={{
                ...styles.pill(weakOnly ? 'rose' : 'silver'),
                border: weakOnly ? 'none' : `1px solid ${COLORS.border}`,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'var(--ccna-type-xs)',
                padding: '6px 10px',
              }}
              onClick={applyWeakOnly}
            >
              Weak only ({weakIds.length})
            </button>
          )}
          <span style={homePill(domain.accent)}>~{questionEstimate} questions</span>
        </div>
      </div>

      <div role="group" aria-label="Domain objectives">
        {visibleObjectives.length === 0 && (
          <div style={{ ...homeCard(), color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)' }}>
            No weak objectives flagged yet. Turn off weak-only or set a placement baseline.
          </div>
        )}
        {visibleObjectives.map(o => {
          const checked = selected.has(o.id)
          const isWeak = weakIds.includes(o.id)
          return (
            <div
              key={o.id}
              style={{
                ...homeCard({ marginBottom: HOME_SECTION_GAP, padding: '10px 12px' }),
                border: checked ? `1px solid ${accent.border}` : `1px solid ${COLORS.border}`,
                background: checked ? accent.dim : COLORS.surface,
              }}
            >
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleObjective(o.id)}
                  aria-label={`Select ${o.id}`}
                  style={{ marginTop: 4, width: 18, height: 18, flexShrink: 0 }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={homePill(domain.accent)}>{o.id}</span>
                    {isWeak && <span style={homePill('rose')}>weak</span>}
                  </span>
                  <span style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, lineHeight: 1.4, color: COLORS.silver }}>
                    {o.title}
                  </span>
                </span>
              </label>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        style={{ ...styles.primaryBtn, opacity: canStart ? 1 : 0.5 }}
        disabled={!canStart}
        onClick={() => onStart?.({ domainId: domain.id, objectiveIds: selectedIds })}
      >
        Start focus pass ({selectedIds.length} objective{selectedIds.length === 1 ? '' : 's'}) →
      </button>
    </div>
  )
}
