import { STORAGE_KEYS } from '../../storageKeys.js'
import { computeMastery } from '../../netUtils.js'
import { quizQuestionKey } from '../../quiz/quizBankStorage.js'

const SYNC_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateSyncCode() {
  let s = ''
  for (let i = 0; i < 16; i++) {
    if (i && i % 4 === 0) s += '-'
    s += SYNC_CODE_ALPHABET[Math.floor(Math.random() * SYNC_CODE_ALPHABET.length)]
  }
  return s
}

export async function loadSyncBundle() {
  const [progress, missed, quizBank, cliStats, streak] = await Promise.all([
    window.storage.getItem(STORAGE_KEYS.progress),
    window.storage.getItem(STORAGE_KEYS.missed),
    window.storage.getItem(STORAGE_KEYS.quizBank),
    window.storage.getItem(STORAGE_KEYS.cliStats),
    window.storage.getItem(STORAGE_KEYS.streak),
  ])
  return {
    progress: progress || {}, missed: missed || [], quizBank: quizBank || {},
    cliStats: cliStats || {}, streak: streak || { count: 0, lastStudyDate: null },
  }
}

export async function saveSyncBundle(b) {
  await Promise.all([
    window.storage.setItem(STORAGE_KEYS.progress, b.progress),
    window.storage.setItem(STORAGE_KEYS.missed, b.missed),
    window.storage.setItem(STORAGE_KEYS.quizBank, b.quizBank),
    window.storage.setItem(STORAGE_KEYS.cliStats, b.cliStats),
    window.storage.setItem(STORAGE_KEYS.streak, b.streak),
  ])
}

function mergeProgressEntry(a, b) {
  if (!a) return b
  if (!b) return a
  const byDate = {}
  ;[...(a.quizScores || []), ...(b.quizScores || [])].forEach(s => { byDate[s.date] = s })
  const quizScores = Object.values(byDate).sort((x, y) => x.date - y.date)
  const confidenceRatings = ((a.confidenceRatings || []).length >= (b.confidenceRatings || []).length ? a.confidenceRatings : b.confidenceRatings) || []
  const { score, mastered } = computeMastery({ quizScores, confidenceRatings })
  return {
    status: mastered ? 'mastered' : (quizScores.length ? 'in_progress' : (a.status || b.status || 'unseen')),
    quizScores, confidenceRatings, masteryScore: score,
    lastSeen: Math.max(a.lastSeen || 0, b.lastSeen || 0),
  }
}

export function mergeProgress(a = {}, b = {}) {
  const out = { ...a }
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    out[id] = mergeProgressEntry(a[id], b[id])
  }
  return out
}

export function mergeMissed(a = [], b = []) {
  const seen = new Set()
  const out = []
  ;[...a, ...b].forEach(m => {
    const k = `${m.objectiveId}::${m.question}`
    if (!seen.has(k)) { seen.add(k); out.push(m) }
  })
  return out
}

export function mergeQuizBank(a = {}, b = {}) {
  const out = {}
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const map = {}
    ;[...(a[id] || []), ...(b[id] || [])].forEach(q => {
      const k = quizQuestionKey(q.question)
      if (!map[k] || (q.attempts?.length || 0) > (map[k].attempts?.length || 0)) map[k] = q
    })
    out[id] = Object.values(map)
  }
  return out
}

export function mergeCliStats(a = {}, b = {}) {
  const out = { ...a }
  for (const id of Object.keys(b)) {
    if (!out[id] || (b[id].updatedAt || 0) > (out[id].updatedAt || 0)) out[id] = b[id]
  }
  return out
}

export function mergeStreak(a = { count: 0 }, b = { count: 0 }) {
  const ad = a?.lastStudyDate || '', bd = b?.lastStudyDate || ''
  if (bd > ad) return b
  if (ad > bd) return a
  return (b?.count || 0) > (a?.count || 0) ? b : a
}

export function mergeSyncData(local, remote = {}) {
  return {
    progress: mergeProgress(local.progress, remote.progress || {}),
    missed: mergeMissed(local.missed, remote.missed || []),
    quizBank: mergeQuizBank(local.quizBank, remote.quizBank || {}),
    cliStats: mergeCliStats(local.cliStats, remote.cliStats || {}),
    streak: mergeStreak(local.streak, remote.streak || { count: 0, lastStudyDate: null }),
  }
}

export async function pullSync(code) {
  const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error(`Sync server error ${res.status}`)
  const j = await res.json()
  return j.data || null
}

export async function pushSync(code, data) {
  const res = await fetch('/api/sync', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, data }),
  })
  if (!res.ok) throw new Error(`Sync server error ${res.status}`)
  return res.json()
}
