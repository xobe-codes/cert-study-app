import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CURATED61_GOLD } from '../answerReview/goldAnswerReviewsCurated61.js'
import { GOLD_ANSWER_REVIEWS } from '../answerReview/goldAnswerReviewsData.js'

const ROOT = join(import.meta.dirname, '..', '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const CURATED61_IDS = JSON.parse(
  readFileSync(join(ROOT, 'scripts', '_goldCurated61Ids.json'), 'utf-8'),
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

describe('goldAnswerReviewsCurated61', () => {
  it('has 61 hand-authored entries', () => {
    expect(Object.keys(CURATED61_GOLD).length).toBe(61)
  })

  it('matches the curated 61 ID manifest exactly', () => {
    expect(Object.keys(CURATED61_GOLD).sort()).toEqual([...CURATED61_IDS].sort())
  })

  it('wires every curated 61 entry into GOLD_ANSWER_REVIEWS', () => {
    for (const id of CURATED61_IDS) {
      expect(GOLD_ANSWER_REVIEWS[id], `missing gold for ${id}`).toBeDefined()
    }
  })

  it('GOLD_ANSWER_REVIEWS covers all 904 clean bank questions with no gaps', () => {
    const bankQuestions = collectCleanBankQuestions()
    expect(bankQuestions.length).toBe(904)

    const missing = bankQuestions
      .filter((q) => !GOLD_ANSWER_REVIEWS[q.id])
      .map((q) => q.id)

    expect(missing, `ungolded questions (${missing.length}): ${missing.join(', ')}`).toEqual([])
  })

  it('each curated 61 review keys correctIndex to the clean bank', () => {
    const byId = Object.fromEntries(collectCleanBankQuestions().map((q) => [q.id, q]))
    for (const id of CURATED61_IDS) {
      const q = byId[id]
      const gold = CURATED61_GOLD[id]
      expect(q, `clean bank missing ${id}`).toBeDefined()
      expect(gold.correct.choiceIndex).toBe(q.correctIndex)
      const wrongCount = q.choices.length - 1
      expect(gold.incorrect).toHaveLength(wrongCount)
      for (const item of gold.incorrect) {
        expect(item.choiceIndex).not.toBe(q.correctIndex)
      }
    }
  })
})
