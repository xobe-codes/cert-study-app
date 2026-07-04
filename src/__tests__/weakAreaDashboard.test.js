import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { buildWeakAreaRows } from '../features/home/weakAreaDashboard.js'
import WeakAreaDashboard from '../features/home/WeakAreaDashboard.jsx'

describe('buildWeakAreaRows', () => {
  it('aggregates trap groups, weak domain, and domain-pass objectives', () => {
    const rows = buildWeakAreaRows({
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
          { lastAttempt: { at: Date.now(), pct: 85 } },
        ]),
      ),
    })

    expect(rows.some(r => r.cta === 'Trap drill' && r.label.includes('implicit deny'))).toBe(true)
    expect(rows.some(r => r.cta === 'Domain pass' && r.label.includes('Security'))).toBe(true)
    expect(rows.some(r => r.cta === 'Open Study' && r.label.includes('weak objective'))).toBe(true)
    expect(rows.some(r => r.cta === 'Open Study' && r.label.includes('Last mock 62%'))).toBe(true)
    expect(rows.some(r => r.cta === 'Interview' && r.label.includes('Verbal warm-up'))).toBe(true)
  })

  it('suggests placement when stale or never taken', () => {
    const rows = buildWeakAreaRows({
      missed: [],
      readiness: {},
      domainPassRecords: {},
      mockHistory: [],
      placementRecords: {},
    })
    expect(rows.some(r => r.cta === 'Check level' && r.action === 'domainPlacement')).toBe(true)
    expect(rows.find(r => r.action === 'domainPlacement')?.payload?.domainId).toBe('fundamentals')
  })
})

describe('WeakAreaDashboard', () => {
  it('renders weak-area rows with CTAs', () => {
    const html = renderToStaticMarkup(
      React.createElement(WeakAreaDashboard, {
        missed: [{ objectiveId: '2.1', misconceptionTested: 'Mismatched native VLANs.' }],
        readiness: {
          domainStats: [{ id: 'access', name: 'Network Access', avg: 0.5 }],
        },
        domainPassRecords: {},
        onSelectObjective: () => {},
        onOpenTrapDrill: () => {},
        onOpenDomainPass: () => {},
        onOpenMock: () => {},
      }),
    )
    expect(html).toContain('WEAK AREAS')
    expect(html).toContain('Trap drill')
    expect(html).toContain('Domain pass')
  })
})
