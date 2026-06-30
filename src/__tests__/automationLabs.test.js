import { describe, it, expect } from 'vitest'
import { EXTENDED_LAB_BUNDLES } from '../data/ccnaLabsExtended.js'
import { getLab } from '../data/ccnaLabs.js'

const AUTO_IDS = ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6']
const AUTO_LAB_IDS = [
  'LAB-AUTO-MGMT-61', 'LAB-AUTO-CTRL-62', 'LAB-AUTO-SDN-63',
  'LAB-AUTO-DNA-64', 'LAB-AUTO-REST-65', 'LAB-AUTO-JSON-66',
]

describe('automation_labs_phase7', () => {
  for (const labId of AUTO_LAB_IDS) {
    it(`extended bundle includes ${labId}`, () => {
      expect(EXTENDED_LAB_BUNDLES.some(b => b.lab?.id === labId)).toBe(true)
    })
    it(`getLab resolves ${labId}`, () => {
      const bundle = getLab(labId)
      expect(bundle?.lab?.interpretOnly).toBe(true)
      expect(bundle?.lab?.cliShowOutput).toBeTruthy()
    })
  }

  for (const objId of AUTO_IDS) {
    it(`objective ${objId} has at least one automation lab`, () => {
      const hasLab = EXTENDED_LAB_BUNDLES.some(b => b.lab?.objectiveId === objId)
      expect(hasLab).toBe(true)
    })
  }
})
