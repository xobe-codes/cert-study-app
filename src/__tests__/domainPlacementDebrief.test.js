import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import DomainPlacementDebrief from '../features/domainPlacement/DomainPlacementDebrief.jsx'

const security = DOMAINS.find(d => d.id === 'security')

function baseReport(overrides = {}) {
  return {
    pct: 55,
    correct: 6,
    total: 11,
    byObjective: {
      '5.1': { correct: 0, total: 2 },
      '5.3': { correct: 0, total: 2 },
      '5.2': { correct: 2, total: 2 },
    },
    trapMisses: [],
    ...overrides,
  }
}

describe('DomainPlacementDebrief', () => {
  it('shows Study all weak when multiple weak objectives and handler provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(DomainPlacementDebrief, {
        domainId: 'security',
        domainName: security.name,
        domain: security,
        report: baseReport(),
        onStudyObjective: () => {},
        onStudyWeakObjectives: vi.fn(),
        onRetake: () => {},
        onExit: () => {},
      }),
    )
    expect(html).toContain('Study all weak (2)')
  })

  it('hides Study all weak with a single weak objective', () => {
    const html = renderToStaticMarkup(
      React.createElement(DomainPlacementDebrief, {
        domainId: 'security',
        domainName: security.name,
        domain: security,
        report: baseReport({
          byObjective: {
            '5.3': { correct: 0, total: 2 },
            '5.2': { correct: 2, total: 2 },
          },
        }),
        onStudyObjective: () => {},
        onStudyWeakObjectives: vi.fn(),
        onRetake: () => {},
        onExit: () => {},
      }),
    )
    expect(html).not.toContain('Study all weak')
  })

  it('hides Study all weak without onStudyWeakObjectives handler', () => {
    const html = renderToStaticMarkup(
      React.createElement(DomainPlacementDebrief, {
        domainId: 'security',
        domainName: security.name,
        domain: security,
        report: baseReport(),
        onStudyObjective: () => {},
        onRetake: () => {},
        onExit: () => {},
      }),
    )
    expect(html).not.toContain('Study all weak')
  })
})
