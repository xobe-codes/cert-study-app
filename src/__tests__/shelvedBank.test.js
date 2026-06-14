import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { isMcQuestion } from '../questionUtils.js'
import {
  getShelvedPool,
  getShelvedStats,
  getPromoteHint,
  isApprovedForPromotion,
} from '../data/shelvedStudy.js'
import { SHELVED_BANK } from '../data/ccnaShelvedQuestions.js'

const ROOT = join(import.meta.dirname, '..', '..')
const SHELVED_MODULE = join(ROOT, 'src', 'data', 'ccnaShelvedQuestions.js')

describe('shelved question bank', () => {
  it('compiled module exists with stats', () => {
    expect(existsSync(SHELVED_MODULE)).toBe(true)
    expect(SHELVED_BANK.stats.total).toBeGreaterThan(0)
    expect(SHELVED_BANK.stats.exhibitDependent + SHELVED_BANK.stats.outOfScope).toBe(SHELVED_BANK.stats.total)
  })

  it('shelved pool helpers match compiled bank', () => {
    const stats = getShelvedStats()
    expect(stats.total).toBe(SHELVED_BANK.stats.total)
    expect(getShelvedPool('all').length).toBe(stats.total)
    expect(getShelvedPool('exhibit').length).toBe(stats.exhibitDependent)
    expect(getShelvedPool('out-of-scope').length).toBe(stats.outOfScope)
  })

  it('most shelved MC questions have choices and answerReview', () => {
    const pool = getShelvedPool('all')
    const mc = pool.filter(isMcQuestion)
    expect(mc.length).toBeGreaterThan(50)
    const missing = mc.filter(q => !q.choices?.length || typeof q.correctIndex !== 'number' || !q.answerReview)
    expect(missing.map(q => q.id)).toEqual([])
  })

  it('promote hints are present for shelved reasons', () => {
    const exhibit = getShelvedPool('exhibit')[0]
    const oos = getShelvedPool('out-of-scope')[0]
    expect(getPromoteHint(exhibit)).toContain('exhibitConverters')
    expect(getPromoteHint(oos)).toContain('approved-promotions')
  })

  it('approved promotions list is readable', () => {
    expect(Array.isArray(SHELVED_BANK.approvedPromotions)).toBe(true)
    for (const entry of SHELVED_BANK.approvedPromotions) {
      if (entry.id) expect(isApprovedForPromotion(entry.id)).toBe(true)
    }
  })
})
