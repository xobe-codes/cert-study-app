import { describe, it, expect } from 'vitest'
import {
  difficultyAccent,
  isCuratedPack,
  getObjectiveDifficulty,
  getCkuDifficulty,
  getCuratedPreview,
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

  it('detects curated packs by reading or questions', () => {
    expect(isCuratedPack('3.2')).toBe(true)
    expect(isCuratedPack('99.99')).toBe(false)
  })
})
