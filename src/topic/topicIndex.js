import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { curatedObjectiveIds, getCurated } from '../data/ccnaCurated.js'
import { CCNA_TERM_REGISTRY } from './ccnaTermRegistry.js'

/** @typedef {'cku'|'glossary'|'trap'|'flashcard'|'mnemonic'} ConceptKind */

let _cache = null

function conceptId(kind, id) {
  return `${kind}:${id}`
}

function pushConcept(list, byId, item) {
  if (byId.has(item.id)) return
  byId.set(item.id, item)
  list.push(item)
}

function linkRegistryToConcepts(registry, concepts) {
  return registry.map(term => {
    const q = term.term.toLowerCase()
    const aliasQs = (term.aliases || []).map(a => a.toLowerCase())
    const relatedConceptIds = concepts.filter(c => {
      const st = c.searchText || ''
      if (st.includes(q)) return true
      if (aliasQs.some(a => a.length > 2 && st.includes(a))) return true
      return (term.tags || []).some(t => (c.tags || []).includes(t) || st.includes(t))
    }).slice(0, 20).map(c => c.id)
    return { ...term, relatedConceptIds }
  })
}

function buildDictionary(concepts, termRegistry) {
  const byNorm = new Map()
  const entries = []

  for (const term of termRegistry) {
    const entry = {
      id: `dict:${term.id}`,
      term: term.term,
      definition: term.definition,
      aliases: term.aliases || [],
      tags: term.tags || [],
      objectiveIds: term.objectiveIds || [],
      conceptIds: [...(term.relatedConceptIds || [])],
      source: 'registry',
      note: term.note || '',
      registryId: term.id,
    }
    entries.push(entry)
    byNorm.set(term.term.toLowerCase(), entry)
  }

  for (const c of concepts.filter(x => x.kind === 'glossary')) {
    const norm = c.label.toLowerCase()
    const existing = byNorm.get(norm)
    if (existing) {
      if (!existing.conceptIds.includes(c.id)) existing.conceptIds.push(c.id)
      continue
    }
    entries.push({
      id: `dict:glossary:${c.id}`,
      term: c.label,
      definition: c.definition || c.detail || '',
      aliases: c.aliases || [],
      tags: c.tags || [],
      objectiveIds: [c.objectiveId],
      conceptIds: [c.id],
      source: 'glossary',
      note: '',
    })
    byNorm.set(norm, entries[entries.length - 1])
  }

  return entries
}

/**
 * Unified CCNA topic index — objectives, concepts, dictionary, term registry.
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
      const summary = cku.summary || ''
      pushConcept(concepts, conceptById, {
        id,
        kind: 'cku',
        label: cku.title,
        definition: summary,
        detail: summary.slice(0, 120),
        objectiveId,
        ckuIds: [cku.id],
        tags: cku.tags || [],
        aliases: cku.aliases || [],
        searchText: `${cku.title} ${cku.id} ${aliases} ${(cku.tags || []).join(' ')} ${summary} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }

    for (const g of pack.glossary || []) {
      const id = conceptId('glossary', g.id)
      const def = g.definition || ''
      pushConcept(concepts, conceptById, {
        id,
        kind: 'glossary',
        label: g.term,
        definition: def,
        detail: def.slice(0, 100),
        objectiveId,
        ckuIds: g.ckuIds || [],
        tags: [],
        aliases: [],
        searchText: `${g.term} ${def} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }

    for (const t of pack.examTraps || []) {
      const id = conceptId('trap', t.id)
      const trapText = t.trap || ''
      const label = trapText.slice(0, 72)
      const correction = t.correction || ''
      pushConcept(concepts, conceptById, {
        id,
        kind: 'trap',
        label: label.length < trapText.length ? `${label}…` : label,
        definition: correction,
        detail: correction.slice(0, 100),
        objectiveId,
        ckuIds: t.ckuIds || [],
        tags: ['exam-trap'],
        aliases: [],
        searchText: `${trapText} ${correction} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }

    for (const f of pack.flashcards || []) {
      const id = conceptId('flashcard', f.id)
      const back = f.back || ''
      pushConcept(concepts, conceptById, {
        id,
        kind: 'flashcard',
        label: f.front,
        definition: back,
        detail: back.slice(0, 100),
        objectiveId,
        ckuIds: f.ckuId ? [f.ckuId] : [],
        tags: ['flashcard'],
        aliases: [],
        searchText: `${f.front} ${back} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }

    for (const m of pack.mnemonics || []) {
      const id = conceptId('mnemonic', m.id)
      const body = `${m.mnemonic || ''}\n\n${m.explanation || ''}`.trim()
      pushConcept(concepts, conceptById, {
        id,
        kind: 'mnemonic',
        label: m.title,
        definition: body,
        detail: body.slice(0, 100),
        objectiveId,
        ckuIds: m.ckuIds || [],
        tags: ['mnemonic'],
        aliases: [],
        searchText: `${m.title} ${m.mnemonic || ''} ${m.explanation || ''} ${objectiveId}`.toLowerCase(),
      })
      meta.conceptIds.push(id)
    }
  }

  const termRegistry = linkRegistryToConcepts(CCNA_TERM_REGISTRY, concepts)
  const dictionary = buildDictionary(concepts, termRegistry)

  return { objectives, concepts, conceptById, dictionary, termRegistry }
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
  mnemonic: 'Mnemonic',
}
