import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  DOMAIN_4_OBJECTIVES,
  hasLeakText,
  isExhibitDependent,
  validateCleanQuestion,
} from '../../scripts/lib/cleanBankUtils.mjs'

const ROOT = join(import.meta.dirname, '..', '..')
const CLEAN_DIR = join(ROOT, 'data', 'clean-question-bank', 'domain-4')
const MANIFEST = join(ROOT, 'data', 'clean-question-bank', 'manifest.json')
const SHELVED = join(ROOT, 'data', 'shelved-questions', 'domain-4', 'exhibit-dependent.json')

const bankBuilt = existsSync(MANIFEST)

describe('clean question bank (Domain 4)', () => {
  beforeAll(() => {
    if (!bankBuilt) {
      console.warn('Clean bank not built — run: npm run kb:domain4')
    }
  })

  it('manifest exists after build', () => {
    expect(bankBuilt).toBe(true)
  })

  it('has all Domain 4 objective files with questions', () => {
    if (!bankBuilt) return
    for (const id of DOMAIN_4_OBJECTIVES) {
      const path = join(CLEAN_DIR, `${id}.json`)
      expect(existsSync(path), `missing ${id}.json`).toBe(true)
      const { questions } = JSON.parse(readFileSync(path, 'utf-8'))
      expect(questions.length, `${id} empty`).toBeGreaterThan(0)
    }
  })

  it('active bank has no source leaks or exhibit stems', () => {
    if (!bankBuilt) return
    const errors = []
    for (const id of DOMAIN_4_OBJECTIVES) {
      const { questions } = JSON.parse(readFileSync(join(CLEAN_DIR, `${id}.json`), 'utf-8'))
      for (const q of questions) {
        if (isExhibitDependent(q)) errors.push(`${id}/${q.id}: exhibit in active bank`)
        errors.push(...validateCleanQuestion(q, id))
      }
    }
    expect(errors).toEqual([])
  })

  it('shelved exhibit bucket is separate from active bank', () => {
    if (!bankBuilt) return
    const shelved = JSON.parse(readFileSync(SHELVED, 'utf-8'))
    expect(shelved.length).toBeGreaterThan(0)
    for (const s of shelved) {
      expect(s.reason).toBe('exhibit-dependent')
    }
  })

  it('detects leak patterns in utility', () => {
    expect(hasLeakText('The source maps this item to answer A')).toBe(true)
    expect(hasLeakText('PAT uses unique source ports.')).toBe(false)
  })
})

describe('cleanQuestionAdapter', () => {
  it('clean bank can be enabled after validation', async () => {
    const { CLEAN_BANK_ENABLED, hasCleanBank } = await import('../data/cleanQuestionAdapter.js')
    expect(CLEAN_BANK_ENABLED).toBe(true)
    expect(hasCleanBank('4.3')).toBe(true)
  })
})
