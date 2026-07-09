import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import DomainBaselinePanel from '../features/domainPlacement/DomainBaselinePanel.jsx'

const security = DOMAINS.find(d => d.id === 'security')

describe('DomainBaselinePanel', () => {
  it('shows domain learning tagline in header', () => {
    const html = renderToStaticMarkup(
      React.createElement(DomainBaselinePanel, {
        domain: security,
        record: null,
        onCheckLevel: () => {},
      }),
    )
    expect(html).toContain('Baseline maps your gaps')
    expect(html).toContain('Domain Pass proves')
  })

  it('renders building rows with Quiz CTA and pointer affordance', () => {
    const onStudyObjective = vi.fn()
    const html = renderToStaticMarkup(
      React.createElement(DomainBaselinePanel, {
        domain: security,
        record: {
          lastAttempt: {
            at: Date.now(),
            pct: 72,
            byObjective: {
              '5.1': { correct: 7, total: 10 },
            },
            trapMisses: [],
          },
        },
        onCheckLevel: () => {},
        onStudyObjective,
      }),
    )
    expect(html).toContain('BUILDING')
    expect(html).toContain('Quiz')
    expect(html).toContain('ccna-domain-baseline-row--building')
    expect(html).not.toContain('disabled=""')
  })
})
