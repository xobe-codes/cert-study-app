import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  isExhibitDependent,
  isTruncatedStem,
  hasInlineExhibit,
  validateCleanQuestion,
} from '../../scripts/lib/cleanBankUtils.mjs'
import { DOMAIN_META } from '../../scripts/lib/sourceBankConfig.mjs'
import { exhibitForQuestion } from '../../scripts/lib/exhibitExhibits.mjs'
import { applyQuestionStemFixes } from '../../scripts/lib/questionStemFixes.mjs'

const ROOT = join(import.meta.dirname, '..', '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')

const FIXED_IDS = [
  'obj-3.1-source-q004',
  'obj-3.2-source-q003',
  'obj-3.3-source-q040',
  'obj-3.4-source-q041',
  'obj-3.5-source-q030',
]

function normalizeQuestion(q) {
  let out = applyQuestionStemFixes(q)
  const converted = exhibitForQuestion(out)
  if (converted) out = converted
  return out
}

function loadAllCleanQuestions() {
  const out = []
  for (const [domainNum, meta] of Object.entries(DOMAIN_META)) {
    for (const obj of meta.objectives) {
      const path = join(CLEAN_ROOT, `domain-${domainNum}`, `${obj}.json`)
      if (!existsSync(path)) continue
      const { questions } = JSON.parse(readFileSync(path, 'utf-8'))
      for (const q of questions) out.push({ q, obj })
    }
  }
  return out
}

describe('exhibitSelfContained', () => {
  const bankBuilt = existsSync(CLEAN_ROOT)

  it('active bank has no truncated stems or dangling exhibit pointers after normalize', () => {
    if (!bankBuilt) return
    const errors = []
    for (const { q, obj } of loadAllCleanQuestions()) {
      const normalized = normalizeQuestion(q)
      if (isTruncatedStem(normalized)) errors.push(`${obj}/${normalized.id}: truncated`)
      if (isExhibitDependent(normalized)) errors.push(`${obj}/${normalized.id}: dangling exhibit`)
      errors.push(...validateCleanQuestion(normalized, obj))
    }
    expect(errors).toEqual([])
  })

  for (const id of FIXED_IDS) {
    it(`${id} is self-contained after normalize`, () => {
      if (!bankBuilt) return
      const row = loadAllCleanQuestions().find(({ q }) => q.id === id)
      expect(row, `missing ${id}`).toBeTruthy()
      const normalized = normalizeQuestion(row.q)
      expect(isTruncatedStem(normalized)).toBe(false)
      expect(isExhibitDependent(normalized)).toBe(false)
      expect(hasInlineExhibit(normalized) || !/exhibit|refer to the following/i.test(normalized.question)).toBe(true)
      expect(normalized.question).not.toMatch(/\.\.\.\s*$/)
    })
  }
})
