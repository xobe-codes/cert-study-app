import { describe, it, expect } from 'vitest'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { getCurated } from '../data/ccnaCurated.js'

describe('engineer_view_full_coverage', () => {
  for (const objective of ALL_OBJECTIVES) {
    it(`objective ${objective.id} has engineerView verify commands`, () => {
      const ev = getCurated(objective.id)?.engineerView
      expect(ev?.verifyCommands?.length, `${objective.id} missing verifyCommands`).toBeGreaterThan(0)
      expect(ev?.trapCallout?.trap, `${objective.id} missing trapCallout`).toBeTruthy()
    })
  }
})
