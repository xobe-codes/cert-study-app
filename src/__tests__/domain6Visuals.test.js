import { describe, it, expect } from 'vitest'
import {
  VISUAL_DIAGRAMS,
  VISUAL_COMPARE,
  VISUAL_TRAP_CALLOUTS,
  VISUAL_FLOWS,
  DOMAIN6_VISUAL_OBJECTIVES,
  getDomain6VisualCoverage,
} from '../data/visualDiagramSupplement.js'
import { getCurated } from '../data/ccnaCurated.js'

describe('Domain 6 visual packs', () => {
  it('covers all six objectives with diagram + compare + traps + flow', () => {
    const coverage = getDomain6VisualCoverage()
    expect(coverage.ok, JSON.stringify(coverage.missing)).toBe(true)
    expect(coverage.covered).toBe(6)
  })

  it.each(DOMAIN6_VISUAL_OBJECTIVES)('getCurated(%s) merges the full visual pack', (id) => {
    const c = getCurated(id)
    expect(c.diagram?.id).toMatch(/^DIAG-6\./)
    expect(c.diagram.nodes.length).toBeGreaterThanOrEqual(3)
    expect(c.diagram.annotations?.length).toBeGreaterThanOrEqual(2)
    expect(c.visualCompare?.type).toMatch(/comparison|layer_stack/)
    expect(c.visualTraps.length).toBeGreaterThanOrEqual(2)
    expect(c.packetFlow.steps.length).toBeGreaterThanOrEqual(3)
  })

  it('upgrades 6.1–6.3 beyond thin stubs', () => {
    expect(VISUAL_DIAGRAMS['6.1'].title).toMatch(/ops loop/i)
    expect(VISUAL_DIAGRAMS['6.2'].nodes.length).toBeGreaterThan(4)
    expect(VISUAL_DIAGRAMS['6.3'].annotations.join(' ')).toMatch(/Northbound/i)
    expect(VISUAL_COMPARE['6.4'].type).toBe('comparison')
    expect(VISUAL_TRAP_CALLOUTS['6.5'].length).toBeGreaterThanOrEqual(2)
    expect(VISUAL_FLOWS['6.6'].steps.length).toBe(3)
  })
})
