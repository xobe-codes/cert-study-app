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

  it('LAB-WPA2-PSK-59 is lab-lite with WPA2 verify show commands', () => {
    const lab = getLab('LAB-WPA2-PSK-59')?.lab
    expect(lab?.interpretOnly).toBe(true)
    const cmds = (lab?.tasks || []).flatMap(t => t.expectedCommands || []).join(' ')
    expect(cmds).toMatch(/show wlan summary/)
    expect(cmds).toMatch(/show wlan GUEST_WIFI/)
  })

  it('LAB-MAC-FORWARD-15 is lab-lite with MAC table verify commands', () => {
    const lab = getLab('LAB-MAC-FORWARD-15')?.lab
    expect(lab?.interpretOnly).toBe(true)
    expect(lab?.objectiveId).toBe('1.5')
    const cmds = (lab?.tasks || []).flatMap(t => t.expectedCommands || [])
    expect(cmds.some(c => c.includes('show mac address-table'))).toBe(true)
  })
})

describe('automation_labs_62_66_still_covered', () => {
  for (const objId of AUTO_IDS) {
    it(`objective ${objId} still has automation lab in extended bundle`, () => {
      expect(EXTENDED_LAB_BUNDLES.some(b => b.lab?.objectiveId === objId)).toBe(true)
    })
  }
})
