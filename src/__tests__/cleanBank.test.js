import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  hasLeakText,
  isExhibitDependent,
  validateCleanQuestion,
} from '../../scripts/lib/cleanBankUtils.mjs'
import { DOMAIN_META } from '../../scripts/lib/sourceBankConfig.mjs'
import { generateAnswerReview } from '../../scripts/lib/generateAnswerReview.mjs'

const ROOT = join(import.meta.dirname, '..', '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const MANIFEST = join(CLEAN_ROOT, 'manifest.json')

const bankBuilt = existsSync(MANIFEST)

describe('clean question bank (all domains)', () => {
  beforeAll(() => {
    if (!bankBuilt) console.warn('Clean bank not built — run: npm run kb:full')
  })

  it('manifest exists after build', () => {
    expect(bankBuilt).toBe(true)
  })

  it('has objective files for domains 2–6', () => {
    if (!bankBuilt) return
    for (const [domainNum, meta] of Object.entries(DOMAIN_META)) {
      for (const id of meta.objectives) {
        const path = join(CLEAN_ROOT, `domain-${domainNum}`, `${id}.json`)
        expect(existsSync(path), `missing domain-${domainNum}/${id}.json`).toBe(true)
        const { questions } = JSON.parse(readFileSync(path, 'utf-8'))
        expect(questions.length, `${id} empty`).toBeGreaterThan(0)
      }
    }
  })

  it('active bank has no leaks, exhibits, and includes answerReview', () => {
    if (!bankBuilt) return
    const errors = []
    for (const [domainNum, meta] of Object.entries(DOMAIN_META)) {
      for (const id of meta.objectives) {
        const { questions } = JSON.parse(readFileSync(join(CLEAN_ROOT, `domain-${domainNum}`, `${id}.json`), 'utf-8'))
        for (const q of questions) {
          if (isExhibitDependent(q)) errors.push(`${id}/${q.id}: exhibit in active bank`)
          if (!q.answerReview) errors.push(`${id}/${q.id}: missing answerReview`)
          errors.push(...validateCleanQuestion(q, id))
        }
      }
    }
    expect(errors).toEqual([])
  })

  it('generateAnswerReview produces distinct incorrect entries', () => {
    const q = {
      question: 'When a switch learns a MAC address, which address does it record?',
      choices: ['Destination MAC', 'Source MAC', 'Both', 'Neither — IP only'],
      correctIndex: 1,
      explanation: 'Switches learn by reading the SOURCE MAC address and the port it arrived on.',
      concept: 'mac learning',
    }
    const ar = generateAnswerReview(q)
    expect(ar.incorrect).toHaveLength(3)
    const texts = ar.incorrect.map(i => i.explanation)
    expect(new Set(texts).size).toBe(3)
    expect(texts.every(t => !/scenario requires/i.test(t))).toBe(true)
  })

  it('detects leak patterns in utility', () => {
    expect(hasLeakText('The source maps this item to answer A')).toBe(true)
    expect(hasLeakText('PAT uses unique source ports.')).toBe(false)
  })
})

describe('cleanQuestionAdapter', () => {
  it('clean bank replaces imports for migrated objectives', async () => {
    const { CLEAN_BANK_ENABLED, hasCleanBank, getLegacyImportObjectives, preloadCleanBank } = await import('../data/cleanQuestionAdapter.js')
    await preloadCleanBank()
    expect(CLEAN_BANK_ENABLED).toBe(true)
    expect(hasCleanBank('4.3')).toBe(true)
    expect(hasCleanBank('3.2')).toBe(true)
    const legacy = getLegacyImportObjectives()
    expect(legacy.length).toBeLessThan(40)
  })
})
