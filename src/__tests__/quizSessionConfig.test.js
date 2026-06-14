import { describe, it, expect, beforeEach } from 'vitest'
import {
  QUIZ_SESSION_OPTIONS,
  DEFAULT_QUIZ_SESSION_SIZE,
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

  it('persists a valid session size', async () => {
    await saveQuizSessionSize(8)
    expect(await loadQuizSessionSize()).toBe(8)
  })

  it('ignores invalid stored values', async () => {
    await globalThis.window.storage.setItem(STORAGE_KEYS.quizSessionSize, 99)
    expect(await loadQuizSessionSize()).toBe(DEFAULT_QUIZ_SESSION_SIZE)
  })

  it('does not save invalid sizes', async () => {
    await saveQuizSessionSize(7)
    expect(await globalThis.window.storage.getItem(STORAGE_KEYS.quizSessionSize)).toBe(null)
  })

  it('exposes expected option list', () => {
    expect(QUIZ_SESSION_OPTIONS).toEqual([3, 5, 8, 10])
  })
})
