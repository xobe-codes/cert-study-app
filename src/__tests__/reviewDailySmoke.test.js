import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '../storageKeys.js'
import {
  countDueQuestions,
  loadDueQuestions,
  seedDueReviewBank,
  recordQuizResult,
  REVIEW_SESSION_CAP,
} from '../quiz/srsReview.js'

const FHRP_Q = {
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
  return store
}

describe('Daily Review flow smoke (SRS seed → session → reschedule)', () => {
  beforeEach(() => {
    setupStorage()
  })

  it('simulates #/review session: due count drops to zero after answering all due items', async () => {
    await seedDueReviewBank('3.5', [
      FHRP_Q,
      { ...FHRP_Q, question: 'Which FHRP is Cisco proprietary for load sharing?', correctIndex: 2, choices: ['HSRP', 'VRRP', 'GLBP', 'Proxy ARP'] },
    ])
    expect(await countDueQuestions()).toBe(2)

    const session = await loadDueQuestions(REVIEW_SESSION_CAP)
    expect(session.length).toBe(2)

    for (const q of session) {
      await recordQuizResult(q.objectiveId, q.id, { correct: true, schedule: true })
    }

    expect(await countDueQuestions()).toBe(0)
    expect(await loadDueQuestions()).toEqual([])
  })

  it('persists rescheduled bank in storage (reload-safe)', async () => {
    const [id] = await seedDueReviewBank('3.5', [FHRP_Q])
    await recordQuizResult('3.5', id, { correct: true, schedule: true })

    const bank = await window.storage.getItem(STORAGE_KEYS.quizBank)
    const q = bank['3.5'].find(x => x.id === id)
    expect(q.srs.due).toBeGreaterThan(Date.now())
    expect(await countDueQuestions()).toBe(0)
  })
})
