import { describe, it, expect } from 'vitest'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { getCurated } from '../data/ccnaCurated.js'
import { FACTORY_ENGINEER_VIEW_WAVE4_SUPPLEMENTS } from '../data/factoryEngineerViewPatchesWave4.js'

describe('engineerViewWave4', () => {
  it('supplements 37 remaining thin objectives', () => {
    expect(Object.keys(FACTORY_ENGINEER_VIEW_WAVE4_SUPPLEMENTS)).toHaveLength(37)
  })

  for (const objective of ALL_OBJECTIVES) {
    it(`objective ${objective.id} has at least 3 engineer verify commands`, () => {
      const ev = getCurated(objective.id)?.engineerView
      expect(ev?.verifyCommands?.length, `${objective.id} verify count`).toBeGreaterThanOrEqual(3)
      expect(ev?.trapCallout?.trap).toBeTruthy()
    })
  }
})
