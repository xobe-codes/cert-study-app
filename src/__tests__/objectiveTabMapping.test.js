import { describe, it, expect } from 'vitest'
import { mapLegacyTab } from '../features/objective/objectiveTabUtils.js'

describe('objective tab mapping', () => {
  it('maps legacy Explain/Visual to Study', () => {
    expect(mapLegacyTab('Explain')).toBe('Study')
    expect(mapLegacyTab('Visual')).toBe('Study')
  })

  it('maps legacy Quiz to Practice', () => {
    expect(mapLegacyTab('Quiz')).toBe('Practice')
  })

  it('keeps Study and Practice', () => {
    expect(mapLegacyTab('Study')).toBe('Study')
    expect(mapLegacyTab('Practice')).toBe('Practice')
  })

  it('maps lowercase hash tabs to canonical names', () => {
    expect(mapLegacyTab('study')).toBe('Study')
    expect(mapLegacyTab('practice')).toBe('Practice')
  })

  it('returns null for tool tabs', () => {
    expect(mapLegacyTab('CLI Drill')).toBeNull()
  })
})
