import { describe, it, expect } from 'vitest'
import { buildLabModules, difficultyRank, LAB_MODULE_DEFS, canonicalLabDomain, filterLabModules, labDomainDoneCount, labsForDomain } from '../data/labModules.js'
import { allLabs } from '../data/ccnaLabs.js'
import { DOMAINS } from '../data/ccnaDomains.js'

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

  it('tags each domain module with domainId and exam weight', () => {
    const domainMods = modules.filter(m => m.domainId !== 'capstone')
    expect(domainMods.length).toBe(6)
    for (const mod of domainMods) {
      expect(mod.domainNumber).toBeGreaterThanOrEqual(1)
      expect(mod.domainNumber).toBeLessThanOrEqual(6)
      expect(mod.examWeight).toBeGreaterThan(0)
      expect(DOMAINS.some(d => d.id === mod.domainId)).toBe(true)
    }
    const capstone = modules.find(m => m.domainId === 'capstone')
    expect(capstone?.domainId).toBe('capstone')
    expect(capstone?.domainNumber).toBeNull()
  })

  it('filterLabModules isolates a single domain', () => {
    const services = filterLabModules(modules, 'services')
    expect(services).toHaveLength(1)
    expect(services[0].domainId).toBe('services')
    expect(services[0].labs.every(l => canonicalLabDomain(l.domainId) === 'services' || l.labType === 'troubleshooting')).toBe(true)
    expect(filterLabModules(modules, 'all')).toEqual(modules)
    expect(filterLabModules(modules, 'capstone').every(m => m.domainId === 'capstone')).toBe(true)
  })

  it('labDomainDoneCount tracks completion per filter', () => {
    const first = modules[0].labs[0]?.id
    if (!first) return
    const counts = labDomainDoneCount(modules, [first], 'all')
    expect(counts.done).toBe(1)
    expect(counts.total).toBe(labs.length)
  })

  it('labsForDomain returns guided labs for canonical domain', () => {
    const access = labsForDomain('access')
    expect(access.length).toBeGreaterThan(0)
    expect(access.every(l => canonicalLabDomain(l.domainId) === 'access')).toBe(true)
    expect(labsForDomain('ip_services').map(l => l.id)).toEqual(labsForDomain('services').map(l => l.id))
  })
})
