import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '../storageKeys.js'
import { AI_CACHE_KEYS } from '../settings/cacheKeys.js'
import {
  saveExamDate,
  loadExamDate,
  clearExamDate,
  clearAiCaches,
  resetStudyProgress,
  saveReduceMotion,
  loadReduceMotion,
  saveQuizSessionSizePref,
  loadQuizSessionSizePref,
  saveTourDone,
  loadTourDone,
} from '../settings/settingsActions.js'

describe('settingsActions', () => {
  beforeEach(() => {
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
    globalThis.document = {
      documentElement: {
        _attrs: new Map(),
        setAttribute(k, v) { this._attrs.set(k, v) },
        removeAttribute(k) { this._attrs.delete(k) },
        getAttribute(k) { return this._attrs.get(k) ?? null },
        hasAttribute(k) { return this._attrs.has(k) },
      },
    }
  })

  it('saves and loads exam date', async () => {
    await saveExamDate('2026-12-01')
    expect(await loadExamDate()).toBe('2026-12-01')
    await clearExamDate()
    expect(await loadExamDate()).toBeNull()
  })

  it('clears AI cache keys', async () => {
    for (const key of AI_CACHE_KEYS) {
      await window.storage.setItem(key, { '1.1': { x: 1 } })
    }
    await clearAiCaches()
    for (const key of AI_CACHE_KEYS) {
      expect(await window.storage.getItem(key)).toEqual({})
    }
  })

  it('resets core study progress keys', async () => {
    await window.storage.setItem(STORAGE_KEYS.progress, { '1.1': { status: 'mastered' } })
    await window.storage.setItem(STORAGE_KEYS.missed, [{ id: 1 }])
    await window.storage.setItem(STORAGE_KEYS.streak, { count: 5, lastStudyDate: '2026-01-01' })
    await window.storage.setItem(STORAGE_KEYS.quizBank, { '1.1': [] })
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    await resetStudyProgress()
    expect(await window.storage.getItem(STORAGE_KEYS.progress)).toEqual({})
    expect(await window.storage.getItem(STORAGE_KEYS.missed)).toEqual([])
    expect(await window.storage.getItem(STORAGE_KEYS.streak)).toEqual({ count: 0, lastStudyDate: null })
    expect(await window.storage.getItem(STORAGE_KEYS.quizBank)).toEqual({})
    expect(await window.storage.getItem(STORAGE_KEYS.onboardDone)).toBeNull()
  })

  it('persists reduce motion on document root', async () => {
    await saveReduceMotion(true)
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('true')
    expect(await loadReduceMotion()).toBe(true)
    await saveReduceMotion(false)
    expect(document.documentElement.hasAttribute('data-reduce-motion')).toBe(false)
  })

  it('clamps quiz session size preference', async () => {
    expect(await saveQuizSessionSizePref(12)).toBe(12)
    expect(await loadQuizSessionSizePref()).toBe(12)
  })

  it('tracks tour completion', async () => {
    expect(await loadTourDone()).toBe(false)
    await saveTourDone(true)
    expect(await loadTourDone()).toBe(true)
  })
})
