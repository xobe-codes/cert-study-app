import { describe, it, expect } from 'vitest'
import { DOMAINS } from '../data/ccnaDomains.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { isChoiceQuestion } from '../questionUtils.js'
import { auditQuestionShape, isPlayableChoiceQuestion } from '../questionShapeAudit.js'
import { buildDomainPassPool, hydrateMcQuestion } from '../features/domainPass/buildDomainPassPool.js'

describe('domain pass pool health', () => {
  it('every curated question has type-aligned answer shape', async () => {
    await preloadCleanBank()
    const failures = []
    for (const domain of DOMAINS) {
      for (const obj of domain.objectives) {
        for (const q of getCuratedQuestions(obj.id)) {
          const issues = auditQuestionShape(q)
          if (issues.length) failures.push({ id: q.id, objectiveId: obj.id, issues })
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('domain pass pools contain only playable choice questions', async () => {
    await preloadCleanBank()
    const getMc = id => getCuratedQuestions(id).filter(isChoiceQuestion)
    for (const domain of DOMAINS) {
      const pool = buildDomainPassPool({ domain, getMcQuestions: getMc, shuffle: a => [...a] })
      expect(pool.length).toBeGreaterThan(0)
      expect(pool.every(q => isPlayableChoiceQuestion(q))).toBe(true)
      expect(pool.every(q => q.choices?.length >= 2)).toBe(true)
    }
  })

  it('drops partial missed entries and hydrates by questionId', async () => {
    await preloadCleanBank()
    const domain = DOMAINS.find(d => d.id === 'security')
    const getMc = id => getCuratedQuestions(id).filter(isChoiceQuestion)
    const sample = getMc(domain.objectives[0].id)[0]
    const partial = {
      objectiveId: sample.objectiveId,
      questionId: sample.id,
      question: 'Stale stem only',
    }
    const orderingMissed = {
      objectiveId: domain.objectives[0].id,
      questionId: 'ordering-only',
      question: 'Put in order',
      type: 'ordering',
      orderItems: ['a', 'b', 'c'],
    }
    const pool = buildDomainPassPool({
      domain,
      getMcQuestions: getMc,
      shuffle: a => [...a],
      missedQuestions: [partial, orderingMissed],
    })
    expect(pool.every(q => isPlayableChoiceQuestion(q))).toBe(true)
    const hydrated = hydrateMcQuestion(partial, domain, getMc)
    expect(hydrated?.choices?.length).toBeGreaterThanOrEqual(2)
    expect(hydrated?.id).toBe(sample.id)
  })
})
