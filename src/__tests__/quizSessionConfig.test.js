import { describe, it, expect, beforeEach } from 'vitest'
import {
  MIN_QUIZ_SESSION_SIZE,
  DEFAULT_QUIZ_SESSION_SIZE,
  MAX_QUIZ_SESSION_SIZE,
  clampQuizSessionSize,
  loadQuizSessionSize,
  saveQuizSessionSize,
  sanitizeSessionSizeDraftInput,
  parseSessionSizeDraft,
  commitSessionSizeDraft,
  effectiveSessionSize,
  isSessionSizeDraftSubmittable,
  sessionSizeDraftFromCommitted,
} from '../quizSessionConfig.js'
import { STORAGE_KEYS } from '../storageKeys.js'

describe('quizSessionConfig', () => {
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
      },
    }
  })

  it('defaults when nothing is stored', async () => {
    expect(await loadQuizSessionSize()).toBe(DEFAULT_QUIZ_SESSION_SIZE)
  })

  it('persists any valid session size', async () => {
    await saveQuizSessionSize(12)
    expect(await loadQuizSessionSize()).toBe(12)
  })

  it('clamps stored values to the allowed range', async () => {
    await globalThis.window.storage.setItem(STORAGE_KEYS.quizSessionSize, 250)
    expect(await loadQuizSessionSize()).toBe(MAX_QUIZ_SESSION_SIZE)
  })

  it('clamps to a custom max (e.g. bank size)', () => {
    expect(clampQuizSessionSize(20, { max: 8 })).toBe(8)
    expect(clampQuizSessionSize(0, { max: 8 })).toBe(MIN_QUIZ_SESSION_SIZE)
  })

  it('returns default for non-numeric input', () => {
    expect(clampQuizSessionSize('abc')).toBe(DEFAULT_QUIZ_SESSION_SIZE)
  })

  describe('session size draft (Practice field 99+ spec)', () => {
    it('allows empty draft while editing', () => {
      expect(sanitizeSessionSizeDraftInput('')).toBe('')
      expect(parseSessionSizeDraft('')).toBeNull()
      expect(isSessionSizeDraftSubmittable('')).toBe(false)
    })

    it('strips non-digits but keeps numeric partials', () => {
      expect(sanitizeSessionSizeDraftInput('1a2')).toBe('12')
      expect(parseSessionSizeDraft('15', { max: 99 })).toBe(15)
    })

    it('does not clamp mid-type until commit', () => {
      expect(parseSessionSizeDraft('1', { max: 8 })).toBe(1)
      expect(commitSessionSizeDraft('15', { max: 8, fallback: 5 })).toBe(8)
    })

    it('restores fallback on empty or invalid blur', () => {
      expect(commitSessionSizeDraft('', { max: 20, fallback: 7 })).toBe(7)
      expect(commitSessionSizeDraft('abc', { max: 20, fallback: 7 })).toBe(7)
    })

    it('effective size prefers valid draft over committed', () => {
      expect(effectiveSessionSize('12', 5, { max: 99 })).toBe(12)
      expect(effectiveSessionSize('', 5, { max: 99 })).toBe(5)
    })

    it('syncs draft string from committed number', () => {
      expect(sessionSizeDraftFromCommitted(8)).toBe('8')
    })
  })
})
