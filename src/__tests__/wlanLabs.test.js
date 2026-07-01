import { describe, it, expect } from 'vitest'
import { PHASE_LAB_BUNDLES } from '../data/ccnaLabsPhases.js'
import { EXTENDED_LAB_BUNDLES } from '../data/ccnaLabsExtended.js'
import { getLab, labsForObjective } from '../data/ccnaLabs.js'

const PHASE3_LAB_IDS = [
  'LAB-MAC-FORWARD-15',
  'LAB-WLAN-SEC-58',
  'LAB-WPA2-PSK-59',
  'LAB-VPN-TYPES-510',
  'LAB-SEGMENT-511',
]

const PHASE3_OBJECTIVES = ['1.5', '5.8', '5.9', '5.10', '5.11']

const INTERPRET_IDS = ['LAB-WLAN-SEC-58', 'LAB-VPN-TYPES-510', 'LAB-SEGMENT-511']

const AUTO_IDS = ['6.2', '6.3', '6.4', '6.5', '6.6']

describe('phase3_lab_wave', () => {
  for (const labId of PHASE3_LAB_IDS) {
    it(`phase bundle includes ${labId}`, () => {
      expect(PHASE_LAB_BUNDLES.some(b => b.lab?.id === labId)).toBe(true)
    })

    it(`getLab resolves ${labId}`, () => {
      const bundle = getLab(labId)
      expect(bundle?.lab?.id).toBe(labId)
      expect(bundle?.lab?.tasks?.length).toBeGreaterThan(0)
      expect(bundle?.validator?.verificationChecks?.length).toBeGreaterThan(0)
    })
  }

  for (const objId of PHASE3_OBJECTIVES) {
    it(`objective ${objId} has at least one lab`, () => {
      expect(labsForObjective(objId).length).toBeGreaterThan(0)
    })
  }

  for (const labId of INTERPRET_IDS) {
    it(`${labId} is interpret-only with cliShowOutput`, () => {
      const lab = getLab(labId)?.lab
      expect(lab?.interpretOnly).toBe(true)
      expect(lab?.cliShowOutput).toBeTruthy()
    })
  }

  it('LAB-WPA2-PSK-59 has WPA2 security expected commands', () => {
    const tasks = getLab('LAB-WPA2-PSK-59')?.lab?.tasks || []
    const cmds = tasks.flatMap(t => t.expectedCommands || []).join(' ')
    expect(cmds).toMatch(/security wpa akm psk/)
    expect(cmds).toMatch(/security wpa wpa2 ciphers aes/)
  })

  it('LAB-MAC-FORWARD-15 covers MAC table verify commands', () => {
    const lab = getLab('LAB-MAC-FORWARD-15')?.lab
    expect(lab?.objectiveId).toBe('1.5')
    expect(lab?.verificationCommands).toContain('show mac address-table')
  })
})

describe('automation_labs_62_66_still_covered', () => {
  for (const objId of AUTO_IDS) {
    it(`objective ${objId} still has automation lab in extended bundle`, () => {
      expect(EXTENDED_LAB_BUNDLES.some(b => b.lab?.objectiveId === objId)).toBe(true)
    })
  }
})
