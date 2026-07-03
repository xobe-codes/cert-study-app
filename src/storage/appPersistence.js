import { STORAGE_KEYS } from '../storageKeys.js'

/** progress: { [objectiveId]: { status, quizScores, lastSeen } } */
export async function loadProgress() {
  const stored = await window.storage.getItem(STORAGE_KEYS.progress)
  return stored || {}
}

export async function saveProgress(progress) {
  await window.storage.setItem(STORAGE_KEYS.progress, progress)
}

/** missed: [{ objectiveId, question, choices, correctIndex, explanation, addedAt }] */
export async function loadMissed() {
  const stored = await window.storage.getItem(STORAGE_KEYS.missed)
  return stored || []
}

export async function saveMissed(missed) {
  await window.storage.setItem(STORAGE_KEYS.missed, missed)
}

/** streak: { count, lastStudyDate (YYYY-MM-DD) } */
export async function loadStreak() {
  const stored = await window.storage.getItem(STORAGE_KEYS.streak)
  return stored || { count: 0, lastStudyDate: null }
}

export async function saveStreak(streak) {
  await window.storage.setItem(STORAGE_KEYS.streak, streak)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a)
  return Math.round(ms / 86400000)
}

/** Call whenever the user does study activity. Returns the updated streak. */
export async function bumpStreak() {
  const streak = await loadStreak()
  const today = todayStr()
  if (streak.lastStudyDate === today) return streak
  if (streak.lastStudyDate) {
    const diff = daysBetween(streak.lastStudyDate, today)
    if (diff === 1) streak.count += 1
    else if (diff > 1) streak.count = 1
    else streak.count = streak.count || 1
  } else {
    streak.count = 1
  }
  streak.lastStudyDate = today
  await saveStreak(streak)
  return streak
}
