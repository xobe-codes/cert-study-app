import { describe, it, expect } from 'vitest'
import { buildCuratedReadingSpeech, buildAiReadingSpeech, bulletsToSpeech } from '../lib/readingTts.js'

const sampleReading = {
  tiers: {
    beginner: 'A router forwards between networks.',
    intermediate: 'Routers use routing tables to pick the best path.',
  },
  bigTakeaway: 'Longest-prefix match wins at lookup time.',
  keyPoints: ['Check the routing table', 'Verify next-hop reachability'],
}

describe('readingTts', () => {
  it('buildCuratedReadingSpeech includes body, takeaway, and key points', () => {
    const text = buildCuratedReadingSpeech(sampleReading, 'intermediate')
    expect(text).toContain('routing tables')
    expect(text).toContain('Key takeaway')
    expect(text).toContain('Longest-prefix match')
    expect(text).toContain('Key points')
    expect(text).toContain('routing table')
  })

  it('buildCuratedReadingSpeech follows active tier', () => {
    const beginner = buildCuratedReadingSpeech(sampleReading, 'beginner')
    expect(beginner).toContain('A router forwards')
    expect(beginner).not.toContain('routing tables to pick')
  })

  it('buildAiReadingSpeech mirrors curated shape', () => {
    const text = buildAiReadingSpeech({
      definition: 'NAT translates private addresses to public ones.',
      bigTakeaway: 'Inside local maps to inside global.',
      keyPoints: ['Overload uses PAT'],
    })
    expect(text).toContain('NAT translates')
    expect(text).toContain('Inside local maps')
    expect(text).toContain('Overload uses PAT')
  })

  it('returns empty string when reading missing', () => {
    expect(buildCuratedReadingSpeech(null)).toBe('')
    expect(buildAiReadingSpeech(null)).toBe('')
  })

  it('bulletsToSpeech joins list items', () => {
    expect(bulletsToSpeech(['A', 'B'])).toBe('A. B')
  })
})
