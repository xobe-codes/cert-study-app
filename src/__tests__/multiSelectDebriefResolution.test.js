import { describe, it, expect } from 'vitest'
import { buildWrongChoiceItem, applyAnswerReviewToQuestion, resolveIncorrectItem } from '../answerReviewLogic.js'
import { correctChoiceText, isMultiQuestion, multiCorrectIndexes } from '../questionUtils.js'
import { MULTI_SELECT_QUESTION_PATCHES } from '../data/multiSelectQuestionPatches.js'
import { PRACTICE_EXAM_PATCHES } from '../data/practiceExamPatches.js'

function shippedMultiQuestions() {
  const out = []
  for (const patches of [MULTI_SELECT_QUESTION_PATCHES, PRACTICE_EXAM_PATCHES]) {
    for (const entry of Object.values(patches)) {
      for (const q of entry?.questions || []) if (isMultiQuestion(q)) out.push(q)
    }
  }
  return out
}

const MULTI = {
  id: 'test-multi',
  question: 'Which two are IPv6 unicast address types?',
  choices: ['Link-local', 'Global unicast', 'Broadcast', 'Class D'],
  correctIndexes: [0, 1],
  explanation: 'IPv6 has no broadcast; Class D is IPv4 multicast space.',
  concept: 'ipv6 address types',
  type: 'multi',
}

describe('correctChoiceText', () => {
  it('resolves single-answer questions from correctIndex', () => {
    expect(correctChoiceText({ choices: ['a', 'b'], correctIndex: 1 })).toBe('b')
  })

  it('resolves multi-select from correctIndexes, which has no correctIndex', () => {
    expect(MULTI.correctIndex).toBeUndefined()
    expect(correctChoiceText(MULTI)).toBe('Link-local and Global unicast')
  })

  it('carries no choice letters — display order shuffles per render', () => {
    expect(correctChoiceText(MULTI)).not.toMatch(/\b[A-D][.)]/)
  })

  it('is empty rather than undefined for a malformed question', () => {
    expect(correctChoiceText({})).toBe('')
    expect(correctChoiceText(null)).toBe('')
  })
})

describe('multi-select wrong-choice debrief', () => {
  it('names the correct answer instead of rendering an empty bold span', () => {
    const item = buildWrongChoiceItem(MULTI, 2)
    for (const field of [item.whyWrongHere, item.whatItDoes, item.explanation]) {
      if (field) expect(field).not.toMatch(/\*\*\*\*/)
    }
    expect(item.whyWrongHere).toContain('Link-local and Global unicast')
  })

  it('leaves no shipped multi-select debrief with an empty correct-answer slot', () => {
    const questions = shippedMultiQuestions()
    expect(questions.length).toBeGreaterThan(0)

    const blanks = []
    for (const q of questions) {
      const reviewed = applyAnswerReviewToQuestion(q)
      const correct = new Set(multiCorrectIndexes(q))
      for (const item of reviewed.answerReview?.incorrect || []) {
        if (correct.has(item.choiceIndex)) continue
        let resolved = resolveIncorrectItem(q, item)
        if (!resolved.whatItDoes || !resolved.whyWrongHere) {
          const rebuilt = buildWrongChoiceItem(q, item.choiceIndex)
          resolved = {
            ...resolved,
            whatItDoes: resolved.whatItDoes || rebuilt.whatItDoes,
            whyWrongHere: resolved.whyWrongHere || rebuilt.whyWrongHere,
          }
        }
        const text = `${resolved.whyWrongHere || ''} ${resolved.whatItDoes || ''}`
        if (text.includes('****')) blanks.push(`${q.id}#${item.choiceIndex}`)
      }
    }
    expect(blanks).toEqual([])
  })
})
