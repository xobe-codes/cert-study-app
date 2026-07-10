import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { buildWeakAreaRows } from '../features/home/weakAreaDashboard.js'
import WeakAreaDashboard from '../features/home/WeakAreaDashboard.jsx'

describe('buildWeakAreaRows', () => {
  const richInput = {
    missed: [
      { objectiveId: '5.5', misconceptionTested: 'Forgetting the implicit deny.' },
      { objectiveId: '5.5', misconceptionTested: 'Forgetting the implicit deny.' },
    ],
    readiness: {
      domainStats: [
        { id: 'security', name: 'Security Fundamentals', avg: 0.4 },
        { id: 'access', name: 'Network Access', avg: 0.9 },
      ],
    },
    domainPassRecords: {
      security: { weakObjectives: ['5.3', '5.4'] },
    },
    mockHistory: [{ date: Date.now(), pct: 62, correct: 18, total: 30, weakDomainId: 'security', weakObjectiveIds: ['5.5'] }],
    placementRecords: Object.fromEntries(
      ['fundamentals', 'access', 'connectivity', 'services', 'security', 'automation'].map(id => [
        id,
        { lastAttempt: { at: Date.now(), pct: 85, blueprintVersion: 2 } },
      ]),
    ),
  }

  it('aggregates trap groups, weak domain, and domain-pass objectives with standard CTAs', () => {
    const rows = buildWeakAreaRows(richInput)

    expect(rows.some(r => r.cta === 'Trap drill →' && r.label.includes('implicit deny'))).toBe(true)
    expect(rows.some(r => r.cta === 'Domain pass →' && r.label.includes('D5'))).toBe(true)
    expect(rows.some(r => r.cta === 'Practice →' && r.label.includes('Last mock 62%'))).toBe(true)
    expect(rows.some(r => r.cta === 'Interview →' && r.label.includes('Verbal warm-up'))).toBe(true)
    expect(rows.every(r => typeof r.why === 'string' && r.why.length > 0)).toBe(true)
  })

  it('defaults to 3 rows when limit is set', () => {
    const limited = buildWeakAreaRows(richInput, { limit: 3 })
    const full = buildWeakAreaRows(richInput)
    expect(limited).toHaveLength(3)
    expect(full.length).toBeGreaterThan(3)
    expect(limited).toEqual(full.slice(0, 3))
  })

  it('dedupes baseline and domain-pass weak into one row per domain', () => {
    const rows = buildWeakAreaRows({
      missed: [],
      readiness: {},
      domainPassRecords: {
        fundamentals: { weakObjectives: ['1.4'] },
      },
      mockHistory: [],
      placementRecords: {
        fundamentals: { lastAttempt: { at: Date.now(), pct: 85, blueprintVersion: 2, weakObjectives: ['1.7'] } },
      },
    })
    const fundRows = rows.filter(r => r.domainId === 'fundamentals' || r.label.includes('D1'))
    expect(fundRows).toHaveLength(1)
    expect(fundRows[0].label).toMatch(/1\.4/)
    expect(fundRows[0].label).toMatch(/1\.7/)
    expect(fundRows[0].cta).toBe('Practice →')
  })

  it('prioritizes traps (P0) before domain and mock rows', () => {
    const rows = buildWeakAreaRows(richInput, { limit: 3 })
    expect(rows[0]?.category).toBe('traps')
    expect(rows[0]?.cta).toBe('Trap drill →')
  })

  it('suggests placement when stale or never taken', () => {
    const rows = buildWeakAreaRows({
      missed: [],
      readiness: {},
      domainPassRecords: {},
      mockHistory: [],
      placementRecords: {},
    })
    expect(rows.some(r => r.cta === 'Check level →' && r.action === 'domainPlacement')).toBe(true)
    expect(rows.find(r => r.action === 'domainPlacement')?.payload?.domainId).toBe('fundamentals')
  })

  it('prioritizes remap baseline for stale v1 baselines', () => {
    const rows = buildWeakAreaRows({
      missed: [],
      readiness: {},
      domainPassRecords: {},
      mockHistory: [],
      placementRecords: {
        fundamentals: { lastAttempt: { at: 1, pct: 80, blueprintVersion: 1 } },
        access: { lastAttempt: { at: 1, pct: 85, blueprintVersion: 2 } },
      },
    })
    expect(rows[0]?.cta).toBe('Remap baseline →')
    expect(rows[0]?.payload?.domainId).toBe('fundamentals')
    expect(rows[0]?.category).toBe('baseline')
  })
})

describe('WeakAreaDashboard', () => {
  const allDomainsPlaced = Object.fromEntries(
    ['fundamentals', 'access', 'connectivity', 'services', 'security', 'automation'].map(id => [
      id,
      { lastAttempt: { at: Date.now(), pct: 85, blueprintVersion: 2 } },
    ]),
  )

  it('renders Fix Next rows with CTAs and category subheaders', () => {
    const html = renderToStaticMarkup(
      React.createElement(WeakAreaDashboard, {
        missed: [{ objectiveId: '2.1', misconceptionTested: 'Mismatched native VLANs.' }],
        readiness: {
          domainStats: [{ id: 'access', name: 'Network Access', avg: 0.5 }],
        },
        domainPassRecords: {},
        placementRecords: allDomainsPlaced,
        onSelectObjective: () => {},
        onOpenTrapDrill: () => {},
        onOpenDomainPass: () => {},
        onOpenMock: () => {},
      }),
    )
    expect(html).toContain('FIX NEXT')
    expect(html).toContain('Trap drill →')
    expect(html).toContain('Domain pass →')
    expect(html).toContain('Traps')
    expect(html).toContain('Domains')
    expect(html).toMatch(/Trap drill/i)
  })

  it('renders empty state when no gaps', () => {
    const html = renderToStaticMarkup(
      React.createElement(WeakAreaDashboard, {
        missed: [],
        readiness: { domainStats: [{ id: 'access', name: 'Network Access', avg: 0.95 }] },
        domainPassRecords: {},
        placementRecords: allDomainsPlaced,
        onOpenDomainPass: () => {},
        onStudyNext: () => {},
      }),
    )
    expect(html).toContain('No urgent gaps')
    expect(html).toContain('Domain Pass →')
    expect(html).toContain('Study Next →')
  })
})
