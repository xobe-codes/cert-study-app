import { describe, it, expect } from 'vitest'
import { DOMAINS } from '../data/ccnaDomains.js'
import {
  DOMAIN_LEARNING_TAGLINE,
  DOMAIN_LAYER_LEGEND,
  domainNumberLabel,
  domainDisplayTitle,
} from '../features/domainPlacement/domainLearningCopy.js'

describe('domainLearningCopy', () => {
  const fundamentals = DOMAINS.find(d => d.id === 'fundamentals')

  it('exports shared tagline and layer legend', () => {
    expect(DOMAIN_LEARNING_TAGLINE).toContain('Baseline maps your gaps')
    expect(DOMAIN_LAYER_LEGEND).toContain('SRS mastery')
    expect(DOMAIN_LAYER_LEGEND).toContain('baseline check')
  })

  it('domainNumberLabel returns D prefix from first objective id', () => {
    expect(domainNumberLabel(fundamentals)).toBe('D1')
    expect(domainNumberLabel({ objectives: [{ id: '5.3' }] })).toBe('D5')
    expect(domainNumberLabel({ objectives: [] })).toBe('')
  })

  it('domainDisplayTitle prefixes domain number when available', () => {
    expect(domainDisplayTitle(fundamentals)).toBe('D1 Network Fundamentals')
    expect(domainDisplayTitle({ name: 'Custom', objectives: [] })).toBe('Custom')
  })
})
