import { STORAGE_KEYS } from '../storageKeys.js'
import { AI_CACHE_KEYS, SOCRATIC_DEFAULT_KEY } from './cacheKeys.js'
import { DEFAULT_QUIZ_SESSION_SIZE, clampQuizSessionSize } from '../quizSessionConfig.js'

export async function loadExamDate() {
  try {
    return (await window.storage.getItem(STORAGE_KEYS.examDate)) || null
  } catch {
    return null
  }
}

export async function saveExamDate(isoDate) {
  if (!isoDate) return null
  await window.storage.setItem(STORAGE_KEYS.examDate, isoDate)
  return isoDate
}

export async function clearExamDate() {
  try {
    await window.storage.removeItem?.(STORAGE_KEYS.examDate)
  } catch {
    await window.storage.setItem(STORAGE_KEYS.examDate, null)
  }
}

export async function loadSocraticDefault() {
  try {
    const v = await window.storage.getItem(SOCRATIC_DEFAULT_KEY)
    return !!v
  } catch {
    return false
  }
}

export async function saveSocraticDefault(on) {
  await window.storage.setItem(SOCRATIC_DEFAULT_KEY, on || null)
  return on
}

export async function loadReduceMotion() {
  try {
    return !!(await window.storage.getItem(STORAGE_KEYS.reduceMotion))
  } catch {
    return false
  }
}

export async function saveReduceMotion(on) {
  await window.storage.setItem(STORAGE_KEYS.reduceMotion, on || null)
  if (typeof document !== 'undefined') {
    if (on) document.documentElement.setAttribute('data-reduce-motion', 'true')
    else document.documentElement.removeAttribute('data-reduce-motion')
  }
  return on
}

export function applyReduceMotionPreference(on) {
  if (typeof document === 'undefined') return
  if (on) document.documentElement.setAttribute('data-reduce-motion', 'true')
  else document.documentElement.removeAttribute('data-reduce-motion')
}

export async function clearTutorChat() {
  await window.storage.setItem(STORAGE_KEYS.tutorChat, [])
}

export async function clearAiCaches() {
  await Promise.all(AI_CACHE_KEYS.map(key => window.storage.setItem(key, {})))
}

export async function resetStudyProgress() {
  await Promise.all([
    window.storage.setItem(STORAGE_KEYS.progress, {}),
    window.storage.setItem(STORAGE_KEYS.missed, []),
    window.storage.setItem(STORAGE_KEYS.streak, { count: 0, lastStudyDate: null }),
    window.storage.setItem(STORAGE_KEYS.quizBank, {}),
    window.storage.removeItem?.(STORAGE_KEYS.onboardDone),
  ])
}

export async function loadQuizSessionSizePref() {
  try {
    const v = await window.storage.getItem(STORAGE_KEYS.quizSessionSize)
    return clampQuizSessionSize(v)
  } catch {
    return DEFAULT_QUIZ_SESSION_SIZE
  }
}

export async function saveQuizSessionSizePref(size) {
  const clamped = clampQuizSessionSize(size)
  await window.storage.setItem(STORAGE_KEYS.quizSessionSize, clamped)
  return clamped
}

export async function saveExamMode(on) {
  await window.storage.setItem(STORAGE_KEYS.examMode, on || null)
  return on
}

export async function loadExamMode() {
  try {
    return !!(await window.storage.getItem(STORAGE_KEYS.examMode))
  } catch {
    return false
  }
}

export async function loadTourDone() {
  try {
    return !!(await window.storage.getItem(STORAGE_KEYS.tourDone))
  } catch {
    return false
  }
}

export async function saveTourDone(done = true) {
  await window.storage.setItem(STORAGE_KEYS.tourDone, done || null)
}
