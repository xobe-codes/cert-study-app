import { describe, it, expect } from 'vitest'
import { regenIncorrectFor, mapRegenToIncorrectItem } from '../features/explanationIntegration.js'
import { CLEAN_QUESTIONS as DOMAIN_1_QUESTIONS } from '../data/cleanQuestions/domain-1.js'

describe('explanationIntegration', () => {
  it('regenIncorrectFor maps embedded regen for a known question', () => {
    const question = DOMAIN_1_QUESTIONS['1.1'].find(q => q.id === '1.1-c-q1')
    const item = regenIncorrectFor(question, 0)
    expect(item).toBeTruthy()
    expect(item.whyWrongHere).toMatch(/primarily operates|Layer 3 header/i)
    expect(mapRegenToIncorrectItem(null)).toBeNull()
  })
})
