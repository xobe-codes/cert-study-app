import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '../storageKeys.js'
import { LEARNER_QUARANTINE_THRESHOLD } from '../data/questionHealthConstants.js'
import { setLocalQuarantineIds, filterHealthyQuestions, isLocallyQuarantined } from '../data/questionHealth.js'
import {
  processFlaggedQuestions,
  getContentHealthStatus,
  saveContentHealthAiEnabled,
  loadContentHealthAiEnabled,
  hydrateLocalQuarantine,
} from '../quiz/contentHealthProcess.js'
import { PREMIUM_FEATURES } from '../premium/premiumFeatures.js'

function setupStorage(seed = {}) {
  const store = new Map(Object.entries(seed))
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

describe('contentHealthProcess', () => {
  beforeEach(() => {
    setLocalQuarantineIds([])
    setupStorage()
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ counts: {} }),
    }))
  })

  it('persists Content Health AI toggle', async () => {
    expect(await loadContentHealthAiEnabled()).toBe(false)
    await saveContentHealthAiEnabled(true)
    expect(await loadContentHealthAiEnabled()).toBe(true)
  })

  it('process soft-quarantines questions at threshold without AI', async () => {
    const qid = 'q-health-1'
    const flags = Array.from({ length: LEARNER_QUARANTINE_THRESHOLD }, (_, i) => ({
      questionId: qid,
      objectiveId: '1.1',
      reason: 'ambiguous',
      at: Date.now() + i,
    }))
    await window.storage.setItem(STORAGE_KEYS.questionHealthFlags, flags)

    const report = await processFlaggedQuestions({ premiumUnlocked: false, aiEnabled: false })
    expect(report.ok).toBe(true)
    expect(report.quarantined).toBeGreaterThanOrEqual(1)
    expect(report.quarantineIds).toContain(qid)
    expect(report.drafts.length).toBeGreaterThanOrEqual(1)
    expect(report.drafts.every(d => d.source === 'template' || d.status === 'draft')).toBe(true)
    expect(isLocallyQuarantined(qid)).toBe(true)

    const filtered = filterHealthyQuestions([{ id: qid }, { id: 'healthy' }])
    expect(filtered.map(q => q.id)).toEqual(['healthy'])
  })

  it('hydrateLocalQuarantine restores soft excludes', async () => {
    await window.storage.setItem(STORAGE_KEYS.contentHealthLocalQuarantine, ['q-a', 'q-b'])
    setLocalQuarantineIds([])
    expect(isLocallyQuarantined('q-a')).toBe(false)
    await hydrateLocalQuarantine()
    expect(isLocallyQuarantined('q-a')).toBe(true)
    expect(isLocallyQuarantined('q-b')).toBe(true)
  })

  it('getContentHealthStatus counts local pending', async () => {
    await window.storage.setItem(STORAGE_KEYS.questionHealthFlags, [
      { questionId: 'x', objectiveId: '1.1', reason: 'typo', at: 1 },
    ])
    const status = await getContentHealthStatus()
    expect(status.localPending).toBe(1)
  })

  it('exposes content_health_ai premium feature', () => {
    expect(PREMIUM_FEATURES.content_health_ai).toBe('content_health_ai')
  })
})
