import { describe, it, expect, beforeEach } from 'vitest'
import {
  MIN_QUIZ_SESSION_SIZE,
  DEFAULT_QUIZ_SESSION_SIZE,
  MAX_QUIZ_SESSION_SIZE,
  clampQuizSessionSize,
  loadQuizSessionSize,
  saveQuizSessionSize,
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
})
