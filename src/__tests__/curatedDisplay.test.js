import { describe, it, expect } from 'vitest'
import {
  difficultyAccent,
  formatCuratedAttribution,
  isCuratedPack,
  getObjectiveDifficulty,
  getCkuDifficulty,
  getCuratedPreview,
  shortSourceLabel,
} from '../curatedDisplay.js'

describe('curatedDisplay', () => {
  it('maps difficulty to pill accents', () => {
    expect(difficultyAccent('easy')).toBe('mint')
    expect(difficultyAccent('medium')).toBe('sky')
    expect(difficultyAccent('hard')).toBe('amber')
  })

  it('returns hardest question difficulty for a curated objective', () => {
    expect(getObjectiveDifficulty('3.2')).toBe('hard')
    expect(getObjectiveDifficulty('1.1')).toBeTruthy()
  })

  it('returns CKU difficulty from linked questions', () => {
    const diff = getCkuDifficulty('3.2', 'CKU-LONGEST-PREFIX-MATCH')
    expect(['easy', 'medium', 'hard']).toContain(diff)
  })

  it('returns a plain-text preview for curated reading', () => {
    const preview = getCuratedPreview('3.2')
    expect(preview).toBeTruthy()
    expect(preview).not.toMatch(/\*\*/)
  })

  it('shortens long source names for display', () => {
    expect(shortSourceLabel("Jeremy's IT Lab — CCNA 200-301 Notes")).toBe("Jeremy's IT Lab")
    expect(shortSourceLabel('Cisco Press CCNA 200-301 Official Cert Guide, Vol 1 (Odom)')).toBe('Odom Vol 1')
  })

  it('formats exam topic + grounded sources', () => {
    const line = formatCuratedAttribution([
      { sourceName: "Jeremy's IT Lab — CCNA 200-301 Notes" },
      { sourceName: 'Cisco Press CCNA 200-301 Official Cert Guide, Vol 1 (Odom)' },
      { sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics' },
    ], '1.1')
    expect(line).toBe("CCNA 200-301 topic 1.1 · from Jeremy's IT Lab & Odom Vol 1")
  })

  it('detects curated packs by reading or questions', () => {
    expect(isCuratedPack('3.2')).toBe(true)
    expect(isCuratedPack('99.99')).toBe(false)
  })
})
