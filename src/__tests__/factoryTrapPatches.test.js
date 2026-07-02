import { describe, it, expect } from 'vitest'
import { FACTORY_TRAP_PATCHES } from '../data/factoryTrapPatches.js'

describe('factoryTrapPatches', () => {
  it('covers at least 34 objectives with 2 exam traps each', () => {
    const keys = Object.keys(FACTORY_TRAP_PATCHES)
    expect(keys.length).toBeGreaterThanOrEqual(34)
    for (const objectiveId of keys) {
      const patch = FACTORY_TRAP_PATCHES[objectiveId]
      expect(patch.examTraps, objectiveId).toHaveLength(2)
      for (const trap of patch.examTraps) {
        expect(trap.id).toBeTruthy()
        expect(trap.trap).toBeTruthy()
        expect(trap.correction).toBeTruthy()
        expect(trap.ckuIds?.length).toBeGreaterThan(0)
      }
    }
  })

  it('includes wave-4 high-traffic objectives', () => {
    const wave4 = ['1.1', '1.5', '1.6', '2.1', '2.2', '2.5', '3.1', '3.2', '3.4', '4.1', '5.5', '5.6']
    for (const objectiveId of wave4) {
      expect(FACTORY_TRAP_PATCHES[objectiveId]?.examTraps).toHaveLength(2)
    }
  })
})
