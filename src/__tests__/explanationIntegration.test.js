import { describe, it, expect } from 'vitest'
import { regenIncorrectFor, mapRegenToIncorrectItem } from '../features/explanationIntegration.js'

describe('explanationIntegration', () => {
  it('regenIncorrectFor maps staged regen for known id', () => {
    const item = regenIncorrectFor('1.1-c-q1', 0)
    expect(item).toBeTruthy()
    expect(item.whyWrongHere).toMatch(/primarily operates|Layer 3 header/i)
    expect(mapRegenToIncorrectItem(null)).toBeNull()
  })
})
