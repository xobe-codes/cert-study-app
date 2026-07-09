import { groupMissedByTrap, getMissedTrapInfo } from './missed/missedTrapGroups.js'
import { resolveTrapDrillCku } from './features/trapDrill/trapDrillQuestions.js'

/** Local weakness aggregation by CKU and exam-trap tags — no API. */

export function computeCkuWeakness(missed = []) {
  const counts = {}
  for (const m of missed) {
    const ids = m.ckuIds?.length ? m.ckuIds : (m.concept ? [`concept:${m.concept}`] : [])
    for (const id of ids) {
      counts[id] = (counts[id] || 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, count }))
}

/** Same trap labels as Home/Focus missed review (groupMissedByTrap). */
export function computeTrapWeakness(missed = []) {
  return groupMissedByTrap(missed).map(({ trap, count }) => ({ trap, count }))
}

/** Resolve a weak-CKU row tap into study or trap-drill action. */
export function resolveCkuWeakAction(id, missed = []) {
  if (id.startsWith('CKU-')) {
    return { kind: 'trapDrill', payload: { ckuId: id } }
  }
  if (id.startsWith('concept:')) {
    const concept = id.slice('concept:'.length)
    const missedItem = missed.find(m => m.concept === concept)
    if (missedItem?.objectiveId) {
      return { kind: 'study', payload: { objectiveId: missedItem.objectiveId } }
    }
    return { kind: 'trapDrill', payload: { trapLabel: missedItem?.misconceptionTested || concept } }
  }
  return { kind: 'trapDrill', payload: { ckuId: id } }
}

/** Resolve a repeated exam-trap tap into trap drill, study, or exam-traps fallback. */
export function resolveTrapWeakAction(trapLabel, missed = []) {
  const resolved = resolveTrapDrillCku({ trapLabel })
  if (resolved) {
    return { kind: 'trapDrill', payload: { ckuId: resolved.ckuId, trapLabel: resolved.trapLabel } }
  }
  const trapItem = missed.find((m) => getMissedTrapInfo(m).trap === trapLabel)
  if (trapItem?.objectiveId) {
    return { kind: 'study', payload: { objectiveId: trapItem.objectiveId } }
  }
  return { kind: 'examTraps', payload: { trapLabel } }
}

/** Run a trap-weak action through navigation handlers. */
export function executeTrapWeakAction(action, handlers = {}) {
  const { onOpenTrapDrill, onOpenExamTraps, onStudyObjective } = handlers
  switch (action?.kind) {
    case 'trapDrill':
      onOpenTrapDrill?.(action.payload)
      break
    case 'examTraps':
      onOpenExamTraps?.(action.payload)
      break
    case 'study':
      if (action.payload?.objectiveId) onStudyObjective?.(action.payload.objectiveId)
      break
    default:
      break
  }
}

/** Resolve + dispatch a trap weakness row tap. */
export function trapWeakTap(trapLabel, missed, handlers) {
  executeTrapWeakAction(resolveTrapWeakAction(trapLabel, missed), handlers)
}
