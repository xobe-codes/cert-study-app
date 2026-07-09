import { describe, it, expect } from 'vitest'
import { allLabs, getLab, validateLabs } from '../data/ccnaLabs.js'
import { LAB_QUALITY_MIN, meetsLabQuality99 } from '../lab/labQuality99.js'

describe('labQuality99', () => {
  it('validateLabs passes with no structural errors', () => {
    const { ok, errors } = validateLabs()
    expect(ok, errors.join('; ')).toBe(true)
  })

  it('gold standard LAB-31-ROUTE-INTERPRET meets 99+ bar', () => {
    const bundle = getLab('LAB-31-ROUTE-INTERPRET')
    expect(meetsLabQuality99(bundle)).toBe(true)
    expect(bundle.lab.learningGoals.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.learningGoals)
    expect(bundle.lab.commonMistakes.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.commonMistakes)
    expect(bundle.lab.tasks.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.tasks)
    expect(bundle.validator.verificationChecks.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.verificationChecks)
    expect(bundle.packetFlows[0].steps.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.flowSteps)
  })

  for (const lab of allLabs()) {
    it(`getLab(${lab.id}) meets 99+ minimums`, () => {
      const bundle = getLab(lab.id)
      expect(bundle?.lab?.id).toBe(lab.id)
      expect(meetsLabQuality99(bundle), lab.id).toBe(true)
      expect(bundle.lab.learningGoals.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.learningGoals)
      expect(bundle.lab.commonMistakes.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.commonMistakes)
      expect(bundle.lab.tasks.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.tasks)
      expect(bundle.validator.verificationChecks.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.verificationChecks)
      expect(bundle.validator.verificationChecks.every(c => c.expectedResult?.length >= 12)).toBe(true)
      expect(bundle.packetFlows[0].steps.length).toBeGreaterThanOrEqual(LAB_QUALITY_MIN.flowSteps)
    })
  }
})
