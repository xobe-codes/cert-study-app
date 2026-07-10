/** Build curated Command Sprint sessions from COMMAND_DRILLS. */

import { buildDrillQuizItems, gradeCommandDrillQuestion, drillSessionSummary } from './commandDrillQuiz.js'
import { getSprintPack, listSprintPacks } from './commandSprintPacks.js'

export { gradeCommandDrillQuestion as gradeSprintQuestion, drillSessionSummary as sprintSessionSummary }

/**
 * Resolve pack items in stable objective order (teach-first, not random dump).
 * Falls back to related-domain drills if a pack is thin.
 */
export function buildSprintSession(packOrId, { shuffle = false, seed = 1 } = {}) {
  const pack = typeof packOrId === 'string' ? getSprintPack(packOrId) : packOrId
  if (!pack) return []

  const all = buildDrillQuizItems()
  const oidSet = new Set(pack.objectiveIds || [])
  let items = all.filter(q => oidSet.has(q.objectiveId))

  if (pack.preferCategory) {
    const preferred = items.filter(q => q.category === pack.preferCategory)
    if (preferred.length >= Math.min(3, pack.count || 5)) {
      items = [...preferred, ...items.filter(q => q.category !== pack.preferCategory)]
    }
  }

  // Stable order: objective id, then drill index embedded in id
  items.sort((a, b) => {
    const oa = String(a.objectiveId || '')
    const ob = String(b.objectiveId || '')
    if (oa !== ob) return oa.localeCompare(ob, undefined, { numeric: true })
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
  })

  // Dedupe by display answer
  const seen = new Set()
  const unique = []
  for (const q of items) {
    const key = String(q.displayAnswer || '').toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push({
      ...q,
      sprintPackId: pack.id,
      type: 'type_command',
    })
  }

  let deck = unique
  if (shuffle && deck.length > 1) {
    let state = (seed >>> 0) || 1
    const rng = () => {
      state = (state * 1664525 + 1013904223) >>> 0
      return state / 0x100000000
    }
    deck = [...deck]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
  }

  const count = Math.max(2, Math.min(pack.count || 8, deck.length))
  return deck.slice(0, count)
}

export function sprintPackAvailability(domainId) {
  return listSprintPacks({ domainId }).map(pack => {
    const session = buildSprintSession(pack)
    return {
      ...pack,
      availableCount: session.length,
      ready: session.length >= 2,
    }
  }).filter(p => p.ready)
}
