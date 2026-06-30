import { describe, it, expect } from 'vitest'
import { getCurated } from '../data/ccnaCurated.js'

const TIER_C_ENGINEER_IDS = ['2.3', '2.4', '2.6', '2.7', '2.8', '3.5', '3.6', '4.2', '4.3', '4.4']

describe('engineer_view_tier_c', () => {
  for (const id of TIER_C_ENGINEER_IDS) {
    it(`objective ${id} has engineerView verify commands`, () => {
      const ev = getCurated(id)?.engineerView
      expect(ev?.verifyCommands?.length).toBeGreaterThan(0)
      expect(ev?.trapCallout?.trap).toBeTruthy()
    })
  }
})
