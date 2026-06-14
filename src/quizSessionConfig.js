import { STORAGE_KEYS } from './storageKeys.js'

export const MIN_QUIZ_SESSION_SIZE = 1
export const DEFAULT_QUIZ_SESSION_SIZE = 5
export const MAX_QUIZ_SESSION_SIZE = 99

export function clampQuizSessionSize(size, { max = MAX_QUIZ_SESSION_SIZE } = {}) {
  const n = typeof size === 'number' ? size : parseInt(size, 10)
  if (!Number.isFinite(n)) return DEFAULT_QUIZ_SESSION_SIZE
  const ceiling = Math.max(MIN_QUIZ_SESSION_SIZE, max)
  return Math.min(Math.max(MIN_QUIZ_SESSION_SIZE, Math.floor(n)), ceiling)
}

export async function loadQuizSessionSize() {
  try {
    const v = await window.storage.getItem(STORAGE_KEYS.quizSessionSize)
    return clampQuizSessionSize(v)
  } catch {
    return DEFAULT_QUIZ_SESSION_SIZE
  }
}

export async function saveQuizSessionSize(size) {
  const clamped = clampQuizSessionSize(size)
  await window.storage.setItem(STORAGE_KEYS.quizSessionSize, clamped)
  return clamped
}
