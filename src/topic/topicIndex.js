import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { curatedObjectiveIds, getCurated } from '../data/ccnaCurated.js'

/** @typedef {'cku'|'glossary'|'trap'|'flashcard'} ConceptKind */

let _cache = null

function conceptId(kind, id) {
  return `${kind}:${id}`
}

function pushConcept(list, byId, item) {
  if (byId.has(item.id)) return
  byId.set(item.id, item)
  list.push(item)
}

/**
 * Unified CCNA topic index — objectives (coarse) + concepts (fine).
 * Built once from curated packs; safe to call repeatedly (cached).
 */
export function buildTopicIndex() {
  const concepts = []
  const conceptById = new Map()
  const objectives = ALL_OBJECTIVES.map(o => ({
    id: o.id,
    title: o.title,
    domainId: o.domainId,
    domainName: o.domainName,
    accent: o.accent,
    hasCurated: curatedObjectiveIds.has(o.id),
    conceptIds: [],
  }))
  const objMap = new Map(objectives.map(o => [o.id, o]))

  for (const objectiveId of curatedObjectiveIds) {
    const pack = getCurated(objectiveId)
    if (!pack) continue
    const meta = objMap.get(objectiveId)
    if (!meta) continue

    for (const cku of pack.ckus || []) {
      const id = conceptId('cku', cku.id)
      const aliases = (cku.aliases || []).join(' ')
      pushConcept(concepts, conceptById, {
        id,
        kind: 'cku',
        label: cku.title,
        detail: cku.summary?.slice(0, 120) || '',
        objectiveId,
        ckuIds: [cku.id],
        searchText: `${cku.title} ${cku.id} ${aliases} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }

    for (const g of pack.glossary || []) {
      const id = conceptId('glossary', g.id)
      pushConcept(concepts, conceptById, {
        id,
        kind: 'glossary',
        label: g.term,
        detail: g.definition?.slice(0, 100) || '',
        objectiveId,
        ckuIds: g.ckuIds || [],
        searchText: `${g.term} ${g.definition || ''} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }

    for (const t of pack.examTraps || []) {
      const id = conceptId('trap', t.id)
      const label = (t.trap || '').slice(0, 72)
      pushConcept(concepts, conceptById, {
        id,
        kind: 'trap',
        label: label.length < (t.trap || '').length ? `${label}…` : label,
        detail: t.correction?.slice(0, 100) || '',
        objectiveId,
        ckuIds: t.ckuIds || [],
        searchText: `${t.trap} ${t.correction || ''} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }

    for (const f of pack.flashcards || []) {
      const id = conceptId('flashcard', f.id)
      pushConcept(concepts, conceptById, {
        id,
        kind: 'flashcard',
        label: f.front,
        detail: f.back?.slice(0, 100) || '',
        objectiveId,
        ckuIds: f.ckuId ? [f.ckuId] : [],
        searchText: `${f.front} ${f.back || ''} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }
  }

  return { objectives, concepts, conceptById }
}

export function getTopicIndex() {
  if (!_cache) _cache = buildTopicIndex()
  return _cache
}

export function resolveCkuIdsFromConcepts(conceptIds, index = getTopicIndex()) {
  const ckus = new Set()
  for (const cid of conceptIds) {
    const c = index.conceptById.get(cid)
    if (!c) continue
    for (const k of c.ckuIds || []) ckus.add(k)
    if (c.kind === 'cku') ckus.add(cid.replace(/^cku:/, ''))
  }
  return ckus
}

/** Exam-aligned quick bundles for post–external-test focus. */
export const TOPIC_PRESETS = [
  { id: 'preset-routing', label: 'Routing & forwarding', objectiveIds: ['3.1', '3.2', '3.3', '3.4', '3.6'] },
  { id: 'preset-switching', label: 'Switching & VLANs', objectiveIds: ['2.1', '2.2', '2.4', '2.5'] },
  { id: 'preset-nat-services', label: 'NAT & IP services', objectiveIds: ['4.1', '4.2', '4.3', '4.6'] },
  { id: 'preset-security', label: 'Security & ACLs', objectiveIds: ['5.1', '5.3', '5.5', '5.6', '5.9'] },
  { id: 'preset-wlan', label: 'Wireless', objectiveIds: ['2.6', '2.7', '2.8', '5.8', '5.9'] },
  { id: 'preset-automation', label: 'Automation & APIs', objectiveIds: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6'] },
]

export const CONCEPT_KIND_LABEL = {
  cku: 'Concept',
  glossary: 'Term',
  trap: 'Exam trap',
  flashcard: 'Flashcard',
}
