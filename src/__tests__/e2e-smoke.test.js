import { describe, it, expect, beforeAll } from 'vitest'
import { hasCuratedReading, hasCuratedQuestions, validateCurated } from '../data/ccnaCurated.js'
import { getLegacyImportObjectives, getCleanBankStats, preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { CLEAN_BANK_OBJECTIVES } from '../data/ccnaCleanBankMeta.js'
import { getShelvedStats } from '../data/shelvedStudy.js'
import { VISUAL_DIAGRAMS } from '../data/visualDiagramSupplement.js'

const ALL_OBJECTIVE_IDS = [
  '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12',
  '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8',
  '3.1', '3.2', '3.3', '3.4', '3.5', '3.6',
  '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10',
  '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10', '5.11',
  '6.1', '6.2', '6.3', '6.4', '6.5', '6.6',
]

describe('e2e smoke — exam coverage invariants', () => {
  beforeAll(async () => {
    await preloadCleanBank()
  })

  it('all 53 objectives have quiz questions', () => {
    const missing = ALL_OBJECTIVE_IDS.filter(id => !hasCuratedQuestions(id))
    expect(missing, `missing quiz: ${missing.join(', ')}`).toEqual([])
  })

  it('all 53 objectives have curated reading (no AI Explain required)', () => {
    const missing = ALL_OBJECTIVE_IDS.filter(id => !hasCuratedReading(id))
    expect(missing, `missing reading: ${missing.join(', ')}`).toEqual([])
  })

  it('curated content validates', () => {
    const { ok, errors } = validateCurated()
    expect(errors).toEqual([])
    expect(ok).toBe(true)
  })

  it('clean bank covers 53 objectives with zero legacy imports', () => {
    expect(getLegacyImportObjectives()).toEqual([])
    expect(CLEAN_BANK_OBJECTIVES.size).toBe(53)
    const stats = getCleanBankStats()
    expect(stats.loaded).toBe(true)
    expect(stats.questions).toBeGreaterThan(850)
  })

  it('no shelved questions remain', () => {
    expect(getShelvedStats().total).toBe(0)
  })

  it('extra objectives 2.1, 2.2, 3.6, 4.10, 5.4, 5.11 in clean bank', () => {
    for (const id of ['2.1', '2.2', '3.6', '4.10', '5.4', '5.11']) {
      expect(CLEAN_BANK_OBJECTIVES.has(id), id).toBe(true)
    }
  })

  it('visual supplement covers at least 20 high-weight objectives', () => {
    expect(Object.keys(VISUAL_DIAGRAMS).length).toBeGreaterThanOrEqual(20)
  })
})
