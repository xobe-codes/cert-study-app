import { describe, it, expect } from 'vitest'
import { getLab } from '../data/ccnaLabs.js'
import { CONFIG_LAB_LITE_IDS } from '../data/configLabLiteWave.js'
import { CONFIG_LAB_IDS } from '../data/labTierStrategy.js'
import { CORE_CONFIG_LAB_IDS } from '../data/coreConfigLabWave.js'

describe('configLabLiteWave', () => {
  it('converts remaining lite-wave labs to interpret-only', () => {
    expect(CONFIG_LAB_LITE_IDS.size).toBe(19)
    for (const id of CONFIG_LAB_LITE_IDS) {
      const lab = getLab(id)?.lab
      expect(lab?.interpretOnly, id).toBe(true)
      expect(lab?.tasks?.every(t => (t.expectedCommands || []).every(c => /^show /i.test(c))), id).toBe(true)
      expect(lab?.cliShowOutput, id).toBeTruthy()
    }
  })

  it('tiers the core configuration set as config-advanced', () => {
    expect(CORE_CONFIG_LAB_IDS.size).toBe(6)
    expect(CONFIG_LAB_IDS.size).toBe(7)
    for (const id of CORE_CONFIG_LAB_IDS) {
      expect(CONFIG_LAB_LITE_IDS.has(id)).toBe(false)
      expect(CONFIG_LAB_IDS.has(id)).toBe(true)
    }
  })

  it('restores typing config labs via getLab with config expectedCommands', () => {
    for (const id of CORE_CONFIG_LAB_IDS) {
      const lab = getLab(id)?.lab
      expect(lab?.interpretOnly, id).toBeFalsy()
      const allCmds = (lab?.tasks || []).flatMap(t => t.expectedCommands || [])
      expect(allCmds.length, id).toBeGreaterThan(0)
      expect(allCmds.some(c => !/^show /i.test(c)), id).toBe(true)
    }
  })
})
