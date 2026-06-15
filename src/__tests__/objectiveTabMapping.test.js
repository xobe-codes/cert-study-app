import { describe, it, expect } from 'vitest'

function mapLegacyTab(tab) {
  if (!tab) return 'Study'
  if (tab === 'Explain' || tab === 'Visual') return 'Study'
  if (tab === 'Quiz') return 'Practice'
  if (tab === 'Study' || tab === 'Practice') return tab
  return null
}

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

  it('returns null for tool tabs', () => {
    expect(mapLegacyTab('CLI Drill')).toBeNull()
  })
})
