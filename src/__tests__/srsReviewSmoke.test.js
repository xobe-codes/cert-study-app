import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '../storageKeys.js'
import {
  countDueQuestions,
  loadDueQuestions,
  seedDueReviewBank,
  recordQuizResult,
  REVIEW_SESSION_CAP,
} from '../quiz/srsReview.js'

const SAMPLE_Q = {
  question: 'What is the default HSRP priority?',
  choices: ['100', '255', '1', '50'],
  correctIndex: 0,
  explanation: 'Default HSRP priority is 100.',
  type: 'definition',
  difficulty: 'easy',
  concept: 'hsrp priority',
}

function setupStorage() {
  const store = new Map()
  globalThis.window = {
    storage: {
      async getItem(key) {
        return store.has(key) ? store.get(key) : null
      },
      async setItem(key, value) {
        store.set(key, value)
      },
      async removeItem(key) {
        store.delete(key)
      },
    },
  }
  globalThis.window.storage._store = store
  return store
}

describe('SRS review smoke', () => {
  beforeEach(() => {
    setupStorage()
  })

  it('seedDueReviewBank marks questions due and countDueQuestions reflects them', async () => {
    const ids = await seedDueReviewBank('3.5', [SAMPLE_Q])
    expect(ids.length).toBe(1)
    expect(await countDueQuestions()).toBe(1)
  })

  it('loadDueQuestions returns seeded due items up to cap', async () => {
    await seedDueReviewBank('3.5', [SAMPLE_Q, { ...SAMPLE_Q, question: 'Which protocol is Cisco proprietary FHRP?' }])
    const due = await loadDueQuestions(REVIEW_SESSION_CAP)
    expect(due.length).toBe(2)
    expect(due.every(q => q.objectiveId === '3.5')).toBe(true)
  })

  it('answering a due question reschedules it and drops due count', async () => {
    const [id] = await seedDueReviewBank('3.5', [SAMPLE_Q])
    expect(await countDueQuestions()).toBe(1)

    const dueBefore = await loadDueQuestions(1)
    expect(dueBefore[0].id).toBe(id)

    await recordQuizResult('3.5', id, { correct: true, schedule: true })

    expect(await countDueQuestions()).toBe(0)

    const bank = await window.storage.getItem(STORAGE_KEYS.quizBank)
    const q = bank['3.5'].find(x => x.id === id)
    expect(q.srs.due).toBeGreaterThan(Date.now())
  })

  it('future-due questions are excluded from loadDueQuestions', async () => {
    const future = Date.now() + 86400000 * 7
    await seedDueReviewBank('3.5', [SAMPLE_Q], { dueAt: future })
    expect(await countDueQuestions()).toBe(0)
    expect(await loadDueQuestions()).toEqual([])
  })
})
