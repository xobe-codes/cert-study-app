import { describe, it, expect } from 'vitest'
import { getRevealedChoiceLayout } from '../mcChoicesLogic.js'

describe('mcChoicesLogic', () => {
  it('keeps correct and selected wrong visible; collapses others', () => {
    const { primaryIndices, collapsedIndices } = getRevealedChoiceLayout(4, 2, 0)
    expect(primaryIndices).toEqual([0, 2])
    expect(collapsedIndices).toEqual([1, 3])
  })

  it('shows only correct when answer was right', () => {
    const { primaryIndices, collapsedIndices } = getRevealedChoiceLayout(4, 1, 1)
    expect(primaryIndices).toEqual([1])
    expect(collapsedIndices).toEqual([0, 2, 3])
  })
})
