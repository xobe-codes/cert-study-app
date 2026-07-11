/**
 * Spec 11 — Terms catalog from existing CCNA_TERM_REGISTRY + curated flashcards.
 */
import { CCNA_TERM_REGISTRY } from '../topic/ccnaTermRegistry.js'
import { DOMAINS } from '../data/ccnaDomains.js'
import { getCurated } from '../data/ccnaCurated.js'

function domainIdFromObjectiveId(objectiveId) {
  const n = parseInt(String(objectiveId || '').split('.')[0], 10)
  if (!Number.isFinite(n) || n < 1) return null
  return DOMAINS[n - 1]?.id || null
}

function cardFromRegistry(t) {
  const objectiveId = t.objectiveIds?.[0] || null
  return {
    id: t.id,
    term: t.term,
    definition: t.definition,
    objectiveId,
    domainId: domainIdFromObjectiveId(objectiveId),
    dontConfuse: t.note || null,
    ckuId: null,
    aliases: t.aliases || [],
  }
}

/** All term cards (registry + curated flashcards, deduped by term). */
export function buildTermsCatalog() {
  const out = []
  const seen = new Set()
  for (const t of CCNA_TERM_REGISTRY) {
    const card = cardFromRegistry(t)
    const key = card.term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(card)
  }
  for (const domain of DOMAINS) {
    for (const o of domain.objectives || []) {
      const fc = getCurated(o.id)?.flashcards || []
      for (const f of fc) {
        const term = f.front || f.term
        if (!term) continue
        const key = String(term).toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        out.push({
          id: f.id || `fc-${o.id}-${key}`,
          term,
          definition: f.back || f.detail || '',
          objectiveId: o.id,
          domainId: domain.id,
          dontConfuse: null,
          ckuId: f.ckuId || null,
          aliases: [],
        })
      }
    }
  }
  return out.sort((a, b) => a.term.localeCompare(b.term))
}

export function filterTermsCatalog(catalog, { domainId = null, query = '' } = {}) {
  let list = catalog || []
  if (domainId && domainId !== 'all') {
    list = list.filter(c => c.domainId === domainId)
  }
  const q = String(query || '').trim().toLowerCase()
  if (q) {
    list = list.filter(c =>
      c.term.toLowerCase().includes(q)
      || c.definition.toLowerCase().includes(q)
      || (c.aliases || []).some(a => String(a).toLowerCase().includes(q)),
    )
  }
  return list
}
