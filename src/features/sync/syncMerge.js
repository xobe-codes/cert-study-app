import { STORAGE_KEYS } from '../../storageKeys.js'
import { computeMastery } from '../../netUtils.js'
import { quizQuestionKey } from '../../quiz/quizBankStorage.js'
import { EVENT_LOG_CAP } from '../../eventLog.js'

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
  const [progress, missed, quizBank, cliStats, streak, events] = await Promise.all([
    window.storage.getItem(STORAGE_KEYS.progress),
    window.storage.getItem(STORAGE_KEYS.missed),
    window.storage.getItem(STORAGE_KEYS.quizBank),
    window.storage.getItem(STORAGE_KEYS.cliStats),
    window.storage.getItem(STORAGE_KEYS.streak),
    window.storage.getItem(STORAGE_KEYS.events),
  ])
  return {
    progress: progress || {}, missed: missed || [], quizBank: quizBank || {},
    cliStats: cliStats || {}, streak: streak || { count: 0, lastStudyDate: null },
    events: events || [],
  }
}

export async function saveSyncBundle(b) {
  await Promise.all([
    window.storage.setItem(STORAGE_KEYS.progress, b.progress),
    window.storage.setItem(STORAGE_KEYS.missed, b.missed),
    window.storage.setItem(STORAGE_KEYS.quizBank, b.quizBank),
    window.storage.setItem(STORAGE_KEYS.cliStats, b.cliStats),
    window.storage.setItem(STORAGE_KEYS.streak, b.streak),
    // events is optional on the bundle so callers that only touch the other
    // keys (doSync's remote pull, which never carried events historically)
    // don't have to pass it — omit rather than clobber the log with [].
    ...(b.events !== undefined ? [window.storage.setItem(STORAGE_KEYS.events, b.events)] : []),
  ])
}

function mergeProgressEntry(a, b) {
  if (!a) return b
  if (!b) return a
  const byDate = {}
  ;[...(a.quizScores || []), ...(b.quizScores || [])].forEach(s => { byDate[s.date] = s })
  const quizScores = Object.values(byDate).sort((x, y) => x.date - y.date)
  const engByKey = {}
  ;[...(a.engagementScores || []), ...(b.engagementScores || [])].forEach(s => {
    engByKey[`${s.date}::${s.kind}::${s.score}`] = s
  })
  const engagementScores = Object.values(engByKey).sort((x, y) => x.date - y.date).slice(-40)
  const confidenceRatings = ((a.confidenceRatings || []).length >= (b.confidenceRatings || []).length ? a.confidenceRatings : b.confidenceRatings) || []
  const merged = {
    ...a,
    ...b,
    quizScores,
    engagementScores,
    confidenceRatings,
    studySectionsViewed: a.studySectionsViewed || b.studySectionsViewed,
    labCompleted: a.labCompleted || b.labCompleted,
    cliDrillCompleted: a.cliDrillCompleted || b.cliDrillCompleted,
    commandSprintCompleted: a.commandSprintCompleted || b.commandSprintCompleted,
    examTrapsViewed: Math.max(a.examTrapsViewed || 0, b.examTrapsViewed || 0),
    lastSeen: Math.max(a.lastSeen || 0, b.lastSeen || 0),
  }
  const { score, mastered } = computeMastery(merged)
  return {
    ...merged,
    status: mastered ? 'mastered' : (quizScores.length || engagementScores.length ? 'in_progress' : (a.status || b.status || 'unseen')),
    masteryScore: score,
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

/**
 * Union two learning-event logs by eventId (falling back to the legacy `id`
 * field), sorted chronologically and capped the same as the live log —
 * without this, a Raw Data restore or a cross-device sync silently dropped
 * ccna_events_v1 (no reference to STORAGE_KEYS.events existed anywhere in
 * this file), leaving Metrics Dashboard's activity/CLI-skill sections
 * showing stale or zeroed data after an otherwise-successful restore.
 */
export function mergeEvents(a = [], b = []) {
  const byId = new Map()
  for (const e of [...a, ...b]) {
    const key = e?.eventId || e?.id
    if (key == null) continue
    if (!byId.has(key)) byId.set(key, e)
  }
  const merged = [...byId.values()].sort((x, y) => (x.at || 0) - (y.at || 0))
  return merged.length > EVENT_LOG_CAP ? merged.slice(-EVENT_LOG_CAP) : merged
}

export function mergeSyncData(local, remote = {}) {
  return {
    progress: mergeProgress(local.progress, remote.progress || {}),
    missed: mergeMissed(local.missed, remote.missed || []),
    quizBank: mergeQuizBank(local.quizBank, remote.quizBank || {}),
    cliStats: mergeCliStats(local.cliStats, remote.cliStats || {}),
    streak: mergeStreak(local.streak, remote.streak || { count: 0, lastStudyDate: null }),
    events: mergeEvents(local.events || [], remote.events || []),
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
