import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import {
  buildDomainStudyRoutes,
  getDomainStudyMeta,
  pickDomainPracticeObjective,
} from '../home/domainStudyRoutes.js'
import { STORAGE_KEYS } from '../storageKeys.js'
import CommandHubStudio from '../commands/CommandHubStudio.jsx'

describe('domainStudyRoutes', () => {
  it('exports labCount and hasPlacement for all six domains', () => {
    const routes = buildDomainStudyRoutes()
    expect(Object.keys(routes)).toHaveLength(6)
    expect(routes.fundamentals).toEqual(expect.objectContaining({
      hasPlacement: true,
      labCount: expect.any(Number),
    }))
    expect(routes.fundamentals.labCount).toBeGreaterThan(0)
  })

  it('getDomainStudyMeta returns domain number from objectives', () => {
    const meta = getDomainStudyMeta('security')
    expect(meta.domainNumber).toBe(5)
    expect(meta.hasPlacement).toBe(true)
  })

  it('pickDomainPracticeObjective prefers baseline weak objectives', () => {
    const domain = getDomainStudyMeta('access').domain
    const oid = pickDomainPracticeObjective(domain, {
      baselineSummary: { weakObjectives: [{ id: '2.3' }] },
      progress: {},
    })
    expect(oid).toBe('2.3')
  })
})

describe('CommandHubStudio initialDomainFilter', () => {
  it('renders Command Hub with domain filter controls when prefilled', () => {
    const html = renderToStaticMarkup(
      React.createElement(CommandHubStudio, {
        onBack: () => {},
        initialDomainFilter: 'connectivity',
      }),
    )
    expect(html).toContain('Command Hub')
    expect(html).toContain('D3')
  })
})

describe('command hub domain filter storage key', () => {
  it('uses dedicated storage key separate from labs', () => {
    expect(STORAGE_KEYS.commandHubDomainFilter).toBe('ccna_command_hub_domain_filter_v1')
    expect(STORAGE_KEYS.commandHubDomainFilter).not.toBe(STORAGE_KEYS.labsDomainFilter)
  })
})
