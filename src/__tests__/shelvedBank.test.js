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
    expect(SHELVED_BANK.stats.total).toBe(0)
  })

  it('shelved pool is empty after full promotion', () => {
    expect(getShelvedPool('all').length).toBe(0)
  })

  it('approved promotions list is readable', () => {
    expect(Array.isArray(SHELVED_BANK.approvedPromotions)).toBe(true)
    for (const entry of SHELVED_BANK.approvedPromotions) {
      if (entry.id) expect(isApprovedForPromotion(entry.id)).toBe(true)
    }
  })
})
