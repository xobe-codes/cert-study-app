import { describe, it, expect } from 'vitest'
import { allLabs } from '../data/ccnaLabs.js'
import { CONFIG_LAB_IDS, getInterpretAlternate, isConfigLab } from '../data/labTierStrategy.js'

describe('labTierStrategy', () => {
  it('tracks 25 config labs matching non-interpretOnly set', () => {
    const configFromData = allLabs().filter(l => !l.interpretOnly).map(l => l.id).sort()
    const fromSet = [...CONFIG_LAB_IDS].sort()
    expect(fromSet).toEqual(configFromData)
    expect(CONFIG_LAB_IDS.size).toBe(25)
  })

  it('high-traffic config labs have interpret alternates', () => {
    const mustHaveAlt = [
      'LAB-EXTENDED-ACL-BUILD',
      'LAB-STATIC-NAT',
      'LAB-OSPF-DEFAULT',
      'LAB-INTERVLAN-SVI',
    ]
    for (const id of mustHaveAlt) {
      const alt = getInterpretAlternate(id)
      expect(alt, id).toBeTruthy()
      expect(isConfigLab(id)).toBe(true)
      const altLab = allLabs().find(l => l.id === alt)
      expect(altLab?.interpretOnly, alt).toBe(true)
    }
  })
})
