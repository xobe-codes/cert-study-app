import { STORAGE_KEYS } from './storageKeys.js'

export const QUIZ_SESSION_OPTIONS = [3, 5, 8, 10]
export const DEFAULT_QUIZ_SESSION_SIZE = 5

export async function loadQuizSessionSize() {
  try {
    const v = await window.storage.getItem(STORAGE_KEYS.quizSessionSize)
    const n = typeof v === 'number' ? v : parseInt(v, 10)
    return QUIZ_SESSION_OPTIONS.includes(n) ? n : DEFAULT_QUIZ_SESSION_SIZE
  } catch {
    return DEFAULT_QUIZ_SESSION_SIZE
  }
}

export async function saveQuizSessionSize(size) {
  if (!QUIZ_SESSION_OPTIONS.includes(size)) return
  await window.storage.setItem(STORAGE_KEYS.quizSessionSize, size)
}
