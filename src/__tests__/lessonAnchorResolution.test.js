import { describe, expect, it } from 'vitest'
import {
  canonicalCkuId,
  lessonCkuAnchor,
  lessonSectionAnchor,
  primaryLessonAnchor,
  resolveLessonAnchor,
} from '../lesson/lessonAnchors.js'
import { getCurated, getCuratedQuestions, curatedObjectiveIds } from '../data/ccnaCurated.js'
import { preloadCleanBank, getImportedOrCleanQuestions } from '../data/cleanQuestionAdapter.js'

describe('canonicalCkuId', () => {
  it('maps a synonym onto the id lessons render', () => {
    expect(canonicalCkuId('CKU-ADMIN-DISTANCE')).toBe('CKU-ADMINISTRATIVE-DISTANCE')
    expect(canonicalCkuId('cku-admin-distance')).toBe('CKU-ADMINISTRATIVE-DISTANCE')
  })

  it('leaves unknown and empty ids alone', () => {
    expect(canonicalCkuId('CKU-SOMETHING-ELSE')).toBe('CKU-SOMETHING-ELSE')
    expect(canonicalCkuId('')).toBe('')
    expect(canonicalCkuId(undefined)).toBeUndefined()
  })

  it('makes the anchor for a synonym match the canonical anchor', () => {
    expect(lessonCkuAnchor('3.1', 'CKU-ADMIN-DISTANCE'))
      .toBe(lessonCkuAnchor('3.1', 'CKU-ADMINISTRATIVE-DISTANCE'))
  })
})

describe('resolveLessonAnchor', () => {
  const objectiveId = '3.1'
  const conceptA = lessonCkuAnchor(objectiveId, 'CKU-ROUTING-TABLE-ENTRY')
  const concepts = lessonSectionAnchor(objectiveId, 'concepts')
  const top = lessonSectionAnchor(objectiveId, 'plain')

  it('prefers the exact concept when the lesson renders it', () => {
    const token = { ckuIds: ['CKU-ROUTING-TABLE-ENTRY'], lessonAnchor: conceptA }
    expect(resolveLessonAnchor(token, objectiveId, id => id === conceptA)).toBe(conceptA)
  })

  it('falls back to another concept the question carries', () => {
    const token = {
      ckuIds: ['CKU-NOT-TAUGHT-HERE', 'CKU-ROUTING-TABLE-ENTRY'],
      lessonAnchor: lessonCkuAnchor(objectiveId, 'CKU-NOT-TAUGHT-HERE'),
    }
    expect(resolveLessonAnchor(token, objectiveId, id => id === conceptA)).toBe(conceptA)
  })

  it('falls back to the concepts block, then the top of the lesson', () => {
    const token = { ckuIds: ['CKU-NOT-TAUGHT-HERE'], lessonAnchor: lessonCkuAnchor(objectiveId, 'CKU-NOT-TAUGHT-HERE') }
    expect(resolveLessonAnchor(token, objectiveId, id => id === concepts)).toBe(concepts)
    expect(resolveLessonAnchor(token, objectiveId, id => id === top)).toBe(top)
  })

  it('returns null rather than a dangling id when the lesson renders nothing', () => {
    const token = { ckuIds: ['CKU-X'], lessonAnchor: lessonCkuAnchor(objectiveId, 'CKU-X') }
    expect(resolveLessonAnchor(token, objectiveId, () => false)).toBeNull()
  })

  it('handles a question with no concepts at all', () => {
    const token = { ckuIds: [], lessonAnchor: primaryLessonAnchor(objectiveId, []) }
    expect(resolveLessonAnchor(token, objectiveId, id => id === top)).toBe(top)
  })
})

describe('every shipped question can reach its lesson', () => {
  it('resolves a rendered anchor for all questions', async () => {
    await preloadCleanBank()
    const dead = []
    let total = 0
    for (const objectiveId of [...curatedObjectiveIds]) {
      const lessonCkus = (getCurated(objectiveId)?.ckus || []).map(c => c.id).filter(Boolean)
      // Mirrors the ids CuratedUnifiedReading renders.
      const rendered = new Set([
        ...['plain', 'how', 'exam', 'concepts'].map(s => lessonSectionAnchor(objectiveId, s)),
        ...lessonCkus.map(c => lessonCkuAnchor(objectiveId, c)),
      ])
      const pool = [
        ...(getCuratedQuestions(objectiveId) || []),
        ...(getImportedOrCleanQuestions(objectiveId) || []),
      ]
      for (const q of pool) {
        total++
        const token = { ckuIds: q.ckuIds || [], lessonAnchor: primaryLessonAnchor(objectiveId, q.ckuIds || []) }
        if (!resolveLessonAnchor(token, objectiveId, id => rendered.has(id))) {
          dead.push(`${objectiveId}#${q.id}`)
        }
      }
    }
    expect(total).toBeGreaterThan(2000)
    expect(dead).toEqual([])
  })
})
