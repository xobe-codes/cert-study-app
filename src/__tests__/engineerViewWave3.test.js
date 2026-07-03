import { describe, it, expect } from 'vitest'
import { FACTORY_ENGINEER_VIEW_WAVE3_SUPPLEMENTS } from '../data/factoryEngineerViewPatchesWave3.js'
import { getCurated } from '../data/ccnaCurated.js'

const WAVE3_IDS = Object.keys(FACTORY_ENGINEER_VIEW_WAVE3_SUPPLEMENTS)

describe('engineerViewWave3', () => {
  it('supplements verify-heavy objectives', () => {
    expect(WAVE3_IDS).toHaveLength(13)
    for (const patch of Object.values(FACTORY_ENGINEER_VIEW_WAVE3_SUPPLEMENTS)) {
      expect(patch.verifyCommands?.length).toBe(1)
    }
  })

  for (const id of WAVE3_IDS) {
    it(`objective ${id} has at least 3 engineer verify commands after wave 3`, () => {
      const ev = getCurated(id)?.engineerView
      expect(ev?.verifyCommands?.length).toBeGreaterThanOrEqual(3)
      expect(ev?.trapCallout?.trap).toBeTruthy()
    })
  }
})
