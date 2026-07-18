import { describe, it, expect } from 'vitest'
import { allLabs, getLab } from '../data/ccnaLabs.js'
import { CONFIG_LAB_LITE_IDS } from '../data/configLabLiteWave.js'
import { CORE_CONFIG_LAB_IDS } from '../data/coreConfigLabWave.js'
import { CONFIG_LAB_IDS, getInterpretAlternate, isConfigLab, INTERPRET_ALTERNATE_BY_CONFIG } from '../data/labTierStrategy.js'

const RESTORED_CONFIG_LAB_IDS = [
  'LAB-EXTENDED-ACL-BUILD',
  ...CORE_CONFIG_LAB_IDS,
]

describe('labTierStrategy', () => {
  it('tracks the core configuration labs plus the extended ACL build', () => {
    const configFromData = allLabs().filter(l => !l.interpretOnly && CONFIG_LAB_IDS.has(l.id)).map(l => l.id).sort()
    expect(configFromData).toEqual([...RESTORED_CONFIG_LAB_IDS].sort())
    expect(CONFIG_LAB_IDS.size).toBe(7)
  })

  it('keeps lite-wave labs interpret-only and marks restored labs as config', () => {
    for (const id of CONFIG_LAB_LITE_IDS) {
      expect(CONFIG_LAB_IDS.has(id)).toBe(false)
      expect(getLab(id)?.lab?.interpretOnly, id).toBe(true)
    }
    for (const id of RESTORED_CONFIG_LAB_IDS) {
      expect(isConfigLab(id)).toBe(true)
      expect(getLab(id)?.lab?.interpretOnly, id).toBeFalsy()
    }
  })

  it('former config labs with alternates point at interpret-only labs', () => {
    const mustHaveAlt = [
      'LAB-L3-ETHERCHANNEL',
      'LAB-DHCP-SNOOP-27',
      'LAB-D49-49',
      'LAB-WPA2-PSK-59',
      'LAB-IPV4-SUBNETTING',
      'LAB-STATIC-FLOATING',
      'LAB-SSH-ACCESS',
      'LAB-D22-22',
      'LAB-LLDP',
      ...RESTORED_CONFIG_LAB_IDS,
    ]
    for (const id of mustHaveAlt) {
      const alt = getInterpretAlternate(id)
      expect(alt, id).toBeTruthy()
      const altLab = getLab(alt)?.lab ?? allLabs().find(l => l.id === alt)
      expect(altLab?.interpretOnly, alt).toBe(true)
    }
    expect(Object.keys(INTERPRET_ALTERNATE_BY_CONFIG).length).toBeGreaterThanOrEqual(20)
    expect(isConfigLab('LAB-IPV6-STATIC')).toBe(false)
  })
})
