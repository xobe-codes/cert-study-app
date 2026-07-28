import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ logEvent: vi.fn() }))
vi.mock('../eventLog.js', () => ({ logEvent: mocks.logEvent }))

import { DOMAINS } from '../data/ccnaDomains.js'
import { allLabs, getLab, labsForObjective, validateLabs } from '../data/ccnaLabs.js'
import { preloadCleanBankForObjective } from '../data/cleanQuestionAdapter.js'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { labMarkers, labTaskProgress, recordLabOutcome } from '../lab/labOutcome.js'
import { getStemReplayLab, stemReplayEntries } from '../features/stemReplay/stemReplayLabs.js'

describe('canonical lab identity and outcomes', () => {
  beforeAll(async () => {
    await Promise.all(DOMAINS.flatMap(domain => (
      domain.objectives.map(objective => preloadCleanBankForObjective(objective.id))
    )))
  })

  beforeEach(() => mocks.logEvent.mockClear())

  it('uses the same domain/objective/CKU marker contract as question outcomes', () => {
    const lab = getLab('LAB-31-ROUTE-INTERPRET').lab
    expect(labMarkers(lab, {
      surface: 'wrong-answer',
      questionId: 'obj-3.1-source-q001',
      ckuId: 'CKU-ROUTING-TABLE-ENTRY',
      trapId: 'route-source-code',
      checkpointId: 't2',
    })).toEqual(expect.objectContaining({
      schemaVersion: 2,
      surface: 'wrong-answer',
      domainId: 'connectivity',
      objectiveId: '3.1',
      questionId: 'obj-3.1-source-q001',
      labId: 'LAB-31-ROUTE-INTERPRET',
      checkpointId: 't2',
      ckuId: 'CKU-ROUTING-TABLE-ENTRY',
      trapId: 'route-source-code',
    }))
  })

  it('records one structured lab event', () => {
    const lab = getLab('LAB-AUTO-JSON-66').lab
    const payload = recordLabOutcome('user_completed_lab', lab, {
      surface: 'lab-exam', checkpointIds: ['t1', 't2', 't3'], correct: 4, total: 4,
    })
    expect(mocks.logEvent).toHaveBeenCalledTimes(1)
    expect(mocks.logEvent).toHaveBeenCalledWith('user_completed_lab', payload)
    expect(payload).toEqual(expect.objectContaining({
      schemaVersion: 2,
      domainId: 'automation',
      objectiveId: '6.6',
      labId: 'LAB-AUTO-JSON-66',
    }))
  })

  it('does not complete while displayed runtime checkpoints remain unfinished', () => {
    const lab = getLab('LAB-TS-ACL-PLACEMENT').lab
    const flags = Object.fromEntries(lab.tasks.map(task => [
      task.id,
      (task.expectedCommands || []).map(() => false),
    ]))
    flags[lab.tasks[0].id] = flags[lab.tasks[0].id].map(() => true)
    const progress = labTaskProgress(lab.tasks, flags)
    expect(progress.done.length).toBeGreaterThan(0)
    expect(progress.done.length).toBeLessThan(progress.total)
    expect(progress.complete).toBe(false)
  })

  it('keeps every lab domain aligned to its canonical objective', () => {
    const objectiveDomains = new Map(DOMAINS.flatMap(domain => (
      domain.objectives.map(objective => [objective.id, domain.id])
    )))
    for (const lab of allLabs()) {
      expect(lab.domainId, lab.id).toBe(objectiveDomains.get(lab.objectiveId))
    }
    expect(validateLabs().errors).toEqual([])
  })

  it('uses current question markers to repair stale replay targets', () => {
    const automation = getStemReplayLab('obj-6.1-source-q003', {
      objectiveId: '6.1', domainId: 'automation', ckuIds: ['CKU-AUTOMATION'],
    })
    expect(automation?.lab.objectiveId).toBe('6.1')
    expect(automation?.lab.domainId).toBe('automation')

    const ssh = getStemReplayLab('obj-4.8-source-q001', {
      objectiveId: '4.8', domainId: 'services', ckuIds: ['CKU-SSH'],
    })
    expect(ssh?.lab.objectiveId).toBe('4.8')
    expect(ssh?.lab.domainId).toBe('services')
  })

  it('keeps every learner-visible replay in its current objective and best available CKU family', () => {
    const questionById = new Map(DOMAINS.flatMap(domain => domain.objectives.flatMap(objective => (
      getCuratedQuestions(objective.id).map(question => [question.id, {
        ...question, objectiveId: objective.id, domainId: domain.id,
      }])
    ))))
    let checked = 0
    for (const { questionId } of stemReplayEntries()) {
      const question = questionById.get(questionId)
      if (!question) continue
      const replay = getStemReplayLab(questionId, question)
      expect(replay?.lab.objectiveId, questionId).toBe(question.objectiveId)
      expect(replay?.lab.domainId, questionId).toBe(question.domainId)

      const objectiveLabs = labsForObjective(question.objectiveId)
      const hasAvailableOverlap = objectiveLabs.some(lab => (
        lab.ckuIds?.some(ckuId => question.ckuIds?.includes(ckuId))
      ))
      if (hasAvailableOverlap) {
        expect(replay.lab.ckuIds.some(ckuId => question.ckuIds?.includes(ckuId)), questionId).toBe(true)
      }
      checked += 1
    }
    expect(checked).toBeGreaterThanOrEqual(150)
  })
})
