import { STORAGE_KEYS } from '../storageKeys.js'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'

/** Failure-mode → Fix Next / Study Next micro-copy. */
export const FAILURE_MODE_WHY = {
  retention: 'Due for spaced review · next: Daily Review → Practice',
  misconception: 'Same trap repeating · next: Trap drill → then Lab',
  application: 'Weak on scenarios · next: Practice → Domain Pass',
  verification: 'Need CLI proof · next: Command Sprint → Lab',
  procedural: 'Math/procedure slips · next: Subnetting drill',
}

export const FAILURE_MODE_NEXT_STEPS = {
  retention: ['review', 'practice'],
  misconception: ['trapDrill', 'lab'],
  application: ['practice', 'domainPass'],
  verification: ['commandHub', 'lab'],
  procedural: ['subnet'],
}

/** Soft gate: first-pass unseen with reading — suggest Study before Practice. */
export function shouldSuggestStudyFirst({ status, hasReading, dismissed } = {}) {
  if (dismissed || !hasReading) return false
  return status === 'unseen' || !status
}

/**
 * Soft gate: already studied (or engaged) but may be weak —
 * optional refresh only; do NOT force Study first.
 */
export function shouldSuggestRefreshStudy({ status, hasReading, dismissed } = {}) {
  if (dismissed || !hasReading) return false
  return status === 'in_progress' || status === 'mastered'
}

/**
 * Progress auto-flips unseen → in_progress on open. Treat “opened but never
 * studied/practiced” as first-pass so the Study-first soft gate still shows.
 */
export function resolveCoachStatus(entry) {
  if (!entry) return 'unseen'
  if (entry.status === 'mastered') return 'mastered'
  const hasStudy = !!(entry.studySectionsViewed || entry.readingTier)
  const hasPractice = (entry.quizScores || []).length > 0
    || (entry.engagementScores || []).length > 0
  if (!hasStudy && !hasPractice) return 'unseen'
  return entry.status === 'in_progress' || entry.status === 'mastered'
    ? entry.status
    : 'in_progress'
}

/**
 * Diagnose how the learner is failing after study.
 * Priority: retention → misconception → procedural → verification → application.
 */
export function pickFailureMode({
  trapCount = 0,
  labDone = true,
  passWeak = false,
  srsDue = false,
  procedural = false,
} = {}) {
  if (srsDue) return 'retention'
  if (trapCount >= 2) return 'misconception'
  if (procedural) return 'procedural'
  if (passWeak && !labDone) return 'verification'
  if (!labDone && (passWeak || trapCount >= 1)) return 'verification'
  if (passWeak) return 'application'
  if (!labDone) return 'verification'
  return null
}

export function whyForFailureMode(mode, { count } = {}) {
  if (!mode) return null
  if (mode === 'misconception' && count != null && count > 0) {
    return `Missed ${count}× · next: Trap drill → then Lab`
  }
  return FAILURE_MODE_WHY[mode] || null
}

export function todayDateKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10)
}

/** @returns {Promise<boolean>} true if Study-first / Refresh dismissed for today */
export async function isStudyCoachDismissedToday(objectiveId, now = Date.now()) {
  if (!objectiveId || !window.storage?.getItem) return false
  const map = (await window.storage.getItem(STORAGE_KEYS.studyCoachDismissed)) || {}
  return map[objectiveId] === todayDateKey(now)
}

export async function dismissStudyCoachToday(objectiveId, now = Date.now()) {
  if (!objectiveId || !window.storage?.getItem) return
  const map = { ...((await window.storage.getItem(STORAGE_KEYS.studyCoachDismissed)) || {}) }
  map[objectiveId] = todayDateKey(now)
  await window.storage.setItem(STORAGE_KEYS.studyCoachDismissed, map)
}

/**
 * Study Next after SRS + baseline: domain-pass weak → high trap → almost-ready.
 * Returns null to fall through to generateLocalSuggestions.
 */
export function pickCoachObjectiveNext(summary, { domainPassRecords = {} } = {}) {
  if (!summary?.perObjective?.length) return null

  const passWeakIds = []
  const seen = new Set()
  for (const rec of Object.values(domainPassRecords || {})) {
    for (const id of rec?.weakObjectives || []) {
      if (seen.has(id)) continue
      seen.add(id)
      passWeakIds.push(id)
    }
  }
  if (passWeakIds.length) {
    const obj = summary.perObjective.find(o => o.id === passWeakIds[0])
      || ALL_OBJECTIVES.find(o => o.id === passWeakIds[0])
    if (obj) {
      return {
        kind: 'objective',
        accent: 'rose',
        shortTitle: `Pass weak — ${obj.id} ${obj.title}`,
        objective: obj,
        tab: 'Study',
        why: whyForFailureMode('application'),
        failureMode: 'application',
      }
    }
  }

  const topMiss = Object.entries(summary.missedByObj || {})
    .sort((a, b) => b[1] - a[1])[0]
  if (topMiss && topMiss[1] >= 2) {
    const obj = summary.perObjective.find(o => o.id === topMiss[0])
    if (obj) {
      return {
        kind: 'objective',
        accent: 'rose',
        shortTitle: `Trap focus — ${obj.id} ${obj.title}`,
        objective: obj,
        tab: 'Practice',
        why: whyForFailureMode('misconception', { count: topMiss[1] }),
        failureMode: 'misconception',
      }
    }
  }

  const near = [...summary.perObjective]
    .filter(o => o.status === 'in_progress' && o.mastery >= 0.6 && o.mastery < 0.85)
    .sort((a, b) => b.mastery - a.mastery)[0]
  if (near) {
    return {
      kind: 'objective',
      accent: 'mint',
      shortTitle: `Lock in — ${near.id} ${near.title}`,
      objective: near,
      tab: 'Practice',
      why: 'Almost ready · next: Practice to lock mastery',
      failureMode: null,
    }
  }

  return null
}
