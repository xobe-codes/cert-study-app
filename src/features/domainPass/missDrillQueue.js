/**
 * Spec 3 — Fix misses queue + spaced 2-correct clear rule.
 */
import { STORAGE_KEYS } from '../../storageKeys.js'
import { domainIdFromObjectiveId } from './domainQuestionExposure.js'

const DEFAULT_SIZE = 10

async function loadClearStore() {
  try {
    const raw = await window.storage.getItem(STORAGE_KEYS.missClearProgress)
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

async function saveClearStore(store) {
  await window.storage.setItem(STORAGE_KEYS.missClearProgress, store && typeof store === 'object' ? store : {})
}

function missId(m) {
  return m?.id ?? m?.questionId
}

/** Domain-scoped misses, newest first, deduped. */
export function collectDomainMisses(missed, domainId, domains) {
  const domain = (domains || []).find(d => d.id === domainId)
  const objIds = new Set((domain?.objectives || []).map(o => o.id))
  const seen = new Set()
  const out = []
  for (let i = (missed || []).length - 1; i >= 0; i--) {
    const m = missed[i]
    if (!m) continue
    const oid = m.objectiveId
    const inDomain = objIds.size
      ? objIds.has(oid)
      : domainIdFromObjectiveId(oid) === domainId
    if (!inDomain) continue
    const id = missId(m)
    if (id == null || seen.has(id)) continue
    seen.add(id)
    out.push(m)
  }
  return out
}

/**
 * Build Fix-misses queue: domain misses ∪ same-CKU siblings ∪ exposure-stale wrongs.
 * Returns question ids (deduped), size 8–12 by default.
 */
export function buildMissDrillQueue({
  missed = [],
  domainId,
  domains,
  bankByObjective = {},
  staleWrongIds = [],
  size = DEFAULT_SIZE,
} = {}) {
  const cap = Math.min(12, Math.max(8, size || DEFAULT_SIZE))
  const domainMisses = collectDomainMisses(missed, domainId, domains)
  const ids = []
  const seen = new Set()

  function push(id) {
    if (id == null || seen.has(id) || ids.length >= cap) return
    seen.add(id)
    ids.push(id)
  }

  for (const m of domainMisses) push(missId(m))

  // Same-CKU siblings from bank for each miss
  for (const m of domainMisses) {
    if (ids.length >= cap) break
    const ckuIds = new Set(m.ckuIds || [])
    if (!ckuIds.size) continue
    const bank = bankByObjective[m.objectiveId] || []
    for (const q of bank) {
      if (ids.length >= cap) break
      if (q.id === missId(m)) continue
      const overlap = (q.ckuIds || []).some(c => ckuIds.has(c))
      if (overlap) push(q.id)
    }
  }

  for (const id of staleWrongIds || []) push(id)

  return ids.slice(0, cap)
}

/**
 * Record a correct/incorrect attempt toward clearing a miss.
 * Clears when 2 corrects (same session OK if both correct — "ace both").
 * @returns {{ cleared: boolean, correctCount: number }}
 */
export async function recordMissClearAttempt(questionId, { correct, sessionKey = null } = {}) {
  if (!questionId) return { cleared: false, correctCount: 0 }
  const store = await loadClearStore()
  const entry = store[questionId] || { corrects: [] }

  if (!correct) {
    store[questionId] = { corrects: [], lastWrongAt: Date.now() }
    await saveClearStore(store)
    return { cleared: false, correctCount: 0 }
  }

  const corrects = [...(entry.corrects || [])]
  corrects.push({ at: Date.now(), sessionKey: sessionKey || null })
  // Keep last 4
  while (corrects.length > 4) corrects.shift()

  const cleared = corrects.length >= 2
  if (cleared) {
    delete store[questionId]
  } else {
    store[questionId] = { corrects }
  }
  await saveClearStore(store)
  return { cleared, correctCount: cleared ? 2 : corrects.length }
}

/** Remove all missed entries matching question ids (after clear). */
export function purgeMissedByIds(missed, questionIds) {
  const drop = new Set(questionIds || [])
  if (!drop.size) return missed || []
  return (missed || []).filter(m => !drop.has(missId(m)))
}

export function formatMissStudyNextLine(domainName, missCount) {
  const n = Math.max(0, Number(missCount) || 0)
  if (!n) return null
  const label = domainName || 'Domain'
  return `${label} · ${n} miss${n === 1 ? '' : 'es'} · Fix now`
}
