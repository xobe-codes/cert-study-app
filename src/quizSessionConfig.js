import { STORAGE_KEYS } from './storageKeys.js'

export const MIN_QUIZ_SESSION_SIZE = 1
export const DEFAULT_QUIZ_SESSION_SIZE = 5
export const MAX_QUIZ_SESSION_SIZE = 99

/**
 * 99+ spec — domain Practice session-size field
 *
 * States
 * - `committed`: clamped number used for storage + quiz start (1…max).
 * - `draft`: free string while editing; may be '' mid-edit.
 *
 * Typing
 * - Allow select-all + delete to empty; digits-only while typing.
 * - Do not clamp on every keystroke (so "1" can become "15").
 *
 * Blur / start
 * - Valid draft → clamp to [1, max], commit, sync draft.
 * - Empty or non-numeric draft → restore last committed value.
 * - Start always commits draft first; disabled while draft is empty/invalid.
 *
 * Sync
 * - Load from storage, bank shrink, or parent max change updates committed + draft.
 *
 * Mobile
 * - `inputMode="numeric"` text field (no spinner fights); `aria-label` includes max.
 */

export function sessionSizeDraftFromCommitted(size) {
  const n = clampQuizSessionSize(size)
  return String(n)
}

/** Strip non-digits; preserve empty string for clear-and-retype. */
export function sanitizeSessionSizeDraftInput(raw) {
  const s = String(raw ?? '')
  if (s === '') return ''
  return s.replace(/\D/g, '')
}

export function isSessionSizeDraftEmpty(draft) {
  return sanitizeSessionSizeDraftInput(draft) === ''
}

/** Parse in-progress draft; null when empty or non-numeric. */
export function parseSessionSizeDraft(draft, { max = MAX_QUIZ_SESSION_SIZE } = {}) {
  const cleaned = sanitizeSessionSizeDraftInput(draft)
  if (cleaned === '') return null
  const n = parseInt(cleaned, 10)
  if (!Number.isFinite(n)) return null
  return clampQuizSessionSize(n, { max })
}

/** Blur/start commit: valid draft clamps; otherwise fall back to last committed. */
export function commitSessionSizeDraft(draft, { max = MAX_QUIZ_SESSION_SIZE, fallback = DEFAULT_QUIZ_SESSION_SIZE } = {}) {
  const parsed = parseSessionSizeDraft(draft, { max })
  if (parsed != null) return parsed
  return clampQuizSessionSize(fallback, { max })
}

/** Button label while typing a valid in-range draft. */
export function effectiveSessionSize(draft, committed, { max = MAX_QUIZ_SESSION_SIZE } = {}) {
  return parseSessionSizeDraft(draft, { max }) ?? clampQuizSessionSize(committed, { max })
}

export function isSessionSizeDraftSubmittable(draft, { max = MAX_QUIZ_SESSION_SIZE } = {}) {
  return parseSessionSizeDraft(draft, { max }) != null
}

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
