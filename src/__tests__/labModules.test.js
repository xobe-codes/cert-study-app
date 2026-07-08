import { describe, it, expect } from 'vitest'
import { buildLabModules, difficultyRank, LAB_MODULE_DEFS, canonicalLabDomain } from '../data/labModules.js'
import { allLabs } from '../data/ccnaLabs.js'

describe('lab curriculum modules', () => {
  const modules = buildLabModules()
  const labs = allLabs()

  it('orders modules foundation → capstone', () => {
    const ids = modules.map(m => m.id)
    const expected = LAB_MODULE_DEFS.map(d => d.id).filter(id => ids.includes(id))
    expect(ids).toEqual(expected)
    expect(ids[0]).toBe('m1-fundamentals')
    expect(ids[ids.length - 1]).toBe('m7-troubleshooting')
    modules.forEach((m, i) => expect(m.order).toBe(i + 1))
  })

  it('covers every lab exactly once', () => {
    const assigned = modules.flatMap(m => m.labs.map(l => l.id))
    expect(assigned.length).toBe(labs.length)
    expect(new Set(assigned).size).toBe(labs.length)
  })

  it('routes all troubleshooting labs to the capstone module', () => {
    const capstone = modules.find(m => m.id === 'm7-troubleshooting')
    expect(capstone.level).toBe('Capstone')
    expect(capstone.labs.every(l => l.labType === 'troubleshooting')).toBe(true)
    const tsTotal = labs.filter(l => l.labType === 'troubleshooting').length
    expect(capstone.labs.length).toBe(tsTotal)
  })

  it('sorts labs beginner → advanced within every module', () => {
    for (const mod of modules) {
      const ranks = mod.labs.map(difficultyRank)
      const sorted = [...ranks].sort((a, b) => a - b)
      expect(ranks).toEqual(sorted)
    }
  })

  it('places the DHCP labs in the services module (ip_services alias fixed)', () => {
    expect(canonicalLabDomain('ip_services')).toBe('services')
    const services = modules.find(m => m.id === 'm4-services')
    const ids = services.labs.map(l => l.id)
    expect(ids).toContain('LAB-DHCP-DNS-FLOW')
    expect(ids).toContain('LAB-DHCP-POOL-43')
    // No orphan module should exist for the legacy id.
    expect(modules.some(m => m.title.toLowerCase().includes('ip_services'))).toBe(false)
  })

  it('gives non-troubleshooting labs a real domain module', () => {
    const guided = labs.filter(l => l.labType !== 'troubleshooting')
    for (const lab of guided) {
      const inModule = modules.some(m => m.id !== 'm7-troubleshooting' && m.labs.includes(lab))
      expect(inModule, `${lab.id} (${lab.domainId}) should belong to a domain module`).toBe(true)
    }
  })
})
