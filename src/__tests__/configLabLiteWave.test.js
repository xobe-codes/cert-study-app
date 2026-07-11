import { describe, it, expect } from 'vitest'
import { getLab } from '../data/ccnaLabs.js'
import { CONFIG_LAB_LITE_IDS } from '../data/configLabLiteWave.js'
import { CONFIG_LAB_IDS } from '../data/labTierStrategy.js'

const RESTORED_CONFIG_LAB_IDS = [
  'LAB-PORT-SECURITY',
  'LAB-EXTENDED-ACL-BUILD',
  'LAB-OSPF-DEFAULT',
]

describe('configLabLiteWave', () => {
  it('converts remaining lite-wave labs to interpret-only', () => {
    expect(CONFIG_LAB_LITE_IDS.size).toBe(22)
    for (const id of CONFIG_LAB_LITE_IDS) {
      const lab = getLab(id)?.lab
      expect(lab?.interpretOnly, id).toBe(true)
      expect(lab?.tasks?.every(t => (t.expectedCommands || []).every(c => /^show /i.test(c))), id).toBe(true)
      expect(lab?.cliShowOutput, id).toBeTruthy()
    }
  })

  it('tiers three restored typing labs as config-advanced', () => {
    expect(CONFIG_LAB_IDS.size).toBe(3)
    for (const id of RESTORED_CONFIG_LAB_IDS) {
      expect(CONFIG_LAB_LITE_IDS.has(id)).toBe(false)
      expect(CONFIG_LAB_IDS.has(id)).toBe(true)
    }
  })

  it('restores typing config labs via getLab with config expectedCommands', () => {
    for (const id of RESTORED_CONFIG_LAB_IDS) {
      const lab = getLab(id)?.lab
      expect(lab?.interpretOnly, id).toBeFalsy()
      const allCmds = (lab?.tasks || []).flatMap(t => t.expectedCommands || [])
      expect(allCmds.length, id).toBeGreaterThan(0)
      expect(allCmds.some(c => !/^show /i.test(c)), id).toBe(true)
    }
  })
})
