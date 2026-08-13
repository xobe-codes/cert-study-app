import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { BATCH30_GOLD } from '../answerReview/goldAnswerReviewsBatch30.js'
import { GOLD_ANSWER_REVIEWS } from '../answerReview/goldAnswerReviewsData.js'

const ROOT = join(import.meta.dirname, '..', '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const BATCH30_IDS = JSON.parse(
  readFileSync(join(ROOT, 'scripts', '_goldBatch30Ids.json'), 'utf-8'),
)

function collectCleanBankQuestions() {
  const questions = []
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else if (name.endsWith('.json') && name !== 'manifest.json') {
        const data = JSON.parse(readFileSync(path, 'utf-8'))
        for (const q of data.questions || []) questions.push(q)
      }
    }
  }
  walk(CLEAN_ROOT)
  return questions
}

describe('goldAnswerReviewsBatch30', () => {
  it('has 105 hand-authored entries', () => {
    expect(Object.keys(BATCH30_GOLD).length).toBe(105)
  })

  it('matches the batch 30 ID manifest exactly', () => {
    expect(Object.keys(BATCH30_GOLD).sort()).toEqual([...BATCH30_IDS].sort())
  })

  it('wires every batch 30 entry into GOLD_ANSWER_REVIEWS', () => {
    for (const id of BATCH30_IDS) {
      expect(GOLD_ANSWER_REVIEWS[id], `missing gold for ${id}`).toBeDefined()
    }
  })

  it('GOLD_ANSWER_REVIEWS covers all 904 clean bank source questions with no gaps', () => {
    const bankQuestions = collectCleanBankQuestions()
    expect(bankQuestions.length).toBe(904)

    const sourceQuestions = bankQuestions.filter((q) => q.id.includes('source'))
    expect(sourceQuestions.length).toBe(656)

    const missing = sourceQuestions
      .filter((q) => !GOLD_ANSWER_REVIEWS[q.id])
      .map((q) => q.id)

    expect(missing, `ungolded source questions: ${missing.join(', ')}`).toEqual([])
  })

  it('each batch 30 review keys correctIndex to the clean bank', () => {
    const byId = Object.fromEntries(collectCleanBankQuestions().map((q) => [q.id, q]))
    for (const id of BATCH30_IDS) {
      const q = byId[id]
      const gold = BATCH30_GOLD[id]
      expect(q, `clean bank missing ${id}`).toBeDefined()
      expect(gold.correct.choiceIndex).toBe(q.correctIndex)
      expect(gold.incorrect).toHaveLength(3)
      for (const item of gold.incorrect) {
        expect(item.choiceIndex).not.toBe(q.correctIndex)
      }
    }
  })
})
