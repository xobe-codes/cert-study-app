import { describe, it, expect } from 'vitest'

function mapLegacyTab(tab) {
  if (!tab) return 'Study'
  const key = tab.length > 1 ? tab.charAt(0).toUpperCase() + tab.slice(1).toLowerCase() : tab
  if (key === 'Explain' || key === 'Visual') return 'Study'
  if (key === 'Quiz') return 'Practice'
  if (key === 'Study' || key === 'Practice') return key
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

  it('maps lowercase hash tabs to canonical names', () => {
    expect(mapLegacyTab('study')).toBe('Study')
    expect(mapLegacyTab('practice')).toBe('Practice')
  })

  it('returns null for tool tabs', () => {
    expect(mapLegacyTab('CLI Drill')).toBeNull()
  })
})
