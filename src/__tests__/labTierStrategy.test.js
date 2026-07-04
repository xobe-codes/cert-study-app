import { describe, it, expect } from 'vitest'
import { allLabs, getLab } from '../data/ccnaLabs.js'
import { CONFIG_LAB_LITE_IDS } from '../data/configLabLiteWave.js'
import { CONFIG_LAB_IDS, getInterpretAlternate, isConfigLab } from '../data/labTierStrategy.js'

describe('labTierStrategy', () => {
  it('tracks 10 config labs matching non-interpretOnly set', () => {
    const configFromData = allLabs().filter(l => !l.interpretOnly && CONFIG_LAB_IDS.has(l.id)).map(l => l.id).sort()
    const fromSet = [...CONFIG_LAB_IDS].sort()
    expect(fromSet).toEqual(configFromData)
    expect(CONFIG_LAB_IDS.size).toBe(10)
  })

  it('converts high-traffic labs to lab-lite interpret-only via getLab', () => {
    for (const id of CONFIG_LAB_LITE_IDS) {
      expect(CONFIG_LAB_IDS.has(id)).toBe(false)
      expect(getLab(id)?.lab?.interpretOnly, id).toBe(true)
    }
  })

  it('config labs with alternates point at interpret-only labs', () => {
    const mustHaveAlt = ['LAB-L3-ETHERCHANNEL', 'LAB-DHCP-SNOOP-27', 'LAB-D49-49']
    for (const id of mustHaveAlt) {
      const alt = getInterpretAlternate(id)
      expect(alt, id).toBeTruthy()
      expect(isConfigLab(id)).toBe(true)
      const altLab = getLab(alt)?.lab ?? allLabs().find(l => l.id === alt)
      expect(altLab?.interpretOnly, alt).toBe(true)
    }
  })
})
