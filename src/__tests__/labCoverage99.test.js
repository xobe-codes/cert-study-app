import { describe, it, expect } from 'vitest'
import { PHASE_LAB_BUNDLES } from '../data/ccnaLabsPhases.js'
import { getLab, labsForObjective } from '../data/ccnaLabs.js'

const WAVE99_OBJECTIVES = [
  '1.1', '1.2', '1.3', '1.4', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12',
  '2.2', '2.7',
  '4.7', '4.9', '4.10',
  '5.1', '5.2', '5.7',
]

const WAVE99_LAB_IDS = [
  'LAB-D11-11', 'LAB-D11-12', 'LAB-D11-13', 'LAB-D11-14', 'LAB-D11-17', 'LAB-D11-18', 'LAB-D11-19',
  'LAB-D11-110', 'LAB-D11-111', 'LAB-D11-112',
  'LAB-D22-22', 'LAB-D27-27',
  'LAB-D47-47', 'LAB-D49-49', 'LAB-D410-410',
  'LAB-D51-51', 'LAB-D52-52', 'LAB-D57-57',
]

describe('lab_coverage_99_wave', () => {
  for (const objId of WAVE99_OBJECTIVES) {
    it(`objective ${objId} has at least one lab`, () => {
      expect(labsForObjective(objId).length).toBeGreaterThanOrEqual(1)
    })
  }

  for (const labId of WAVE99_LAB_IDS) {
    it(`phase bundle includes ${labId}`, () => {
      expect(PHASE_LAB_BUNDLES.some(b => b.lab?.id === labId)).toBe(true)
    })

    it(`getLab resolves ${labId} with tasks and verification`, () => {
      const bundle = getLab(labId)
      expect(bundle?.lab?.id).toBe(labId)
      expect(bundle?.lab?.tasks?.length).toBeGreaterThan(0)
      expect(bundle?.validator?.verificationChecks?.length).toBeGreaterThan(0)
    })
  }
})
