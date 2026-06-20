/** Federated library index — terms, reading, commands, traps for Study Lens. */

import { getTopicIndex } from '../topic/topicIndex.js'
import { getCommandIndex } from '../commands/commandIndex.js'
import { curatedObjectiveIds, getCurated } from '../data/ccnaCurated.js'
import { isDraftKbTierText } from '../lesson/readingEnrichment.js'
import { bestScore, inDomain, norm } from '../search/textRank.js'
import { makeChunk, navObjective } from './libraryChunk.js'
import { detectIntent, INTENT_KIND_BOOST } from './intentDetect.js'

let _cache = null

function addChunk(list, byId, chunk) {
  if (!chunk?.id || !chunk.body || byId.has(chunk.id)) return
  byId.set(chunk.id, chunk)
  list.push(chunk)
}

function readingChunksForPack(pack) {
  const out = []
  const oid = pack.objectiveId
  const reading = pack.reading
  if (!reading) return out

  const push = (chunk) => out.push(chunk)

  if (reading.definition && !isDraftKbTierText(reading.definition)) {
    push(makeChunk({
      id: `reading:${oid}:definition`,
      kind: 'reading-section',
      title: `${oid} — Definition`,
      body: reading.definition.replace(/\*\*/g, ''),
      objectiveIds: [oid],
      tags: ['reading', 'definition'],
      nav: navObjective(oid),
    }))
  }

  for (const tier of ['beginner', 'intermediate', 'examReady']) {
    const text = reading.tiers?.[tier]
    if (!text || isDraftKbTierText(text)) continue
    push(makeChunk({
      id: `reading:${oid}:${tier}`,
      kind: 'reading-tier',
      title: `${oid} — ${tier}`,
      body: text,
      objectiveIds: [oid],
      tags: ['reading', tier],
      nav: navObjective(oid),
    }))
  }

  for (const [i, kp] of (reading.keyPoints || []).entries()) {
    if (!kp || isDraftKbTierText(kp)) continue
    push(makeChunk({
      id: `reading:${oid}:kp:${i}`,
      kind: 'reading-section',
      title: `${oid} — Key point`,
      body: kp.replace(/\*\*/g, ''),
      objectiveIds: [oid],
      tags: ['reading', 'key-point'],
      nav: navObjective(oid),
    }))
  }

  for (const trap of pack.examTraps || []) {
    const body = `${trap.trap} Correction: ${trap.correction}`
    push(makeChunk({
      id: `trap:${trap.id || `${oid}-t`}`,
      kind: 'exam-trap',
      title: `${oid} — Exam trap`,
      body,
      objectiveIds: [oid],
      tags: ['trap', 'exam'],
      nav: navObjective(oid, 'Reference'),
    }))
  }

  const ev = pack.engineerView
  if (ev) {
    const cmds = (ev.verifyCommands || []).map(c => `${c.command}: ${c.purpose}`).join(' ')
    const symptoms = (ev.symptoms || []).join(' ')
    const body = [ev.summary, symptoms, cmds, ev.trapCallout ? `${ev.trapCallout.trap} — ${ev.trapCallout.correction}` : ''].filter(Boolean).join(' ')
    push(makeChunk({
      id: `engineer:${oid}`,
      kind: 'engineer-view',
      title: ev.title || `${oid} — Engineer view`,
      body,
      objectiveIds: [oid],
      tags: ['verify', 'troubleshoot'],
      nav: navObjective(oid),
    }))
  }

  return out
}

export function buildLibraryIndex() {
  const chunks = []
  const byId = new Map()

  const topicIndex = getTopicIndex()
  const commandIndex = getCommandIndex()

  for (const o of topicIndex.objectives) {
    addChunk(chunks, byId, makeChunk({
      id: `objective:${o.id}`,
      kind: 'objective',
      title: `${o.id} — ${o.title}`,
      body: `${o.title}. Domain: ${o.domainName || o.domainId}.`,
      objectiveIds: [o.id],
      tags: ['objective', o.domainId],
      nav: navObjective(o.id),
    }))
  }

  for (const entry of topicIndex.dictionary || []) {
    addChunk(chunks, byId, makeChunk({
      id: `term:${entry.id}`,
      kind: 'term',
      title: entry.term,
      body: [entry.definition, entry.note].filter(Boolean).join(' '),
      objectiveIds: entry.objectiveIds || [],
      tags: entry.tags || ['term'],
      quality: entry.source === 'registry' ? 'authoritative' : 'authoritative',
      nav: navObjective(entry.objectiveIds?.[0]),
    }))
  }

  for (const c of topicIndex.concepts || []) {
    const kind = c.kind === 'trap' ? 'exam-trap' : 'concept'
    addChunk(chunks, byId, makeChunk({
      id: `concept:${c.id}`,
      kind,
      title: c.label,
      body: c.definition || c.detail || c.searchText || '',
      objectiveIds: [c.objectiveId],
      tags: [c.kind, ...(c.tags || [])],
      nav: navObjective(c.objectiveId),
    }))
  }

  for (const cmd of commandIndex.commands || []) {
    addChunk(chunks, byId, makeChunk({
      id: `command:${cmd.id}`,
      kind: 'command',
      title: cmd.command,
      body: [cmd.purpose, cmd.example, cmd.syntaxNotes, cmd.note].filter(Boolean).join(' '),
      objectiveIds: cmd.objectiveIds || [],
      tags: [cmd.category, cmd.mode, ...(cmd.tags || [])],
      nav: navObjective(cmd.objectiveIds?.[0]),
    }))
  }

  for (const wf of commandIndex.workflows || []) {
    const steps = (wf.steps || []).map(s => s.commandText || s.label).join(' → ')
    addChunk(chunks, byId, makeChunk({
      id: `workflow:${wf.id}`,
      kind: 'workflow',
      title: wf.title,
      body: [wf.description, steps].filter(Boolean).join(' '),
      objectiveIds: wf.objectiveIds || [],
      tags: ['workflow', ...(wf.tags || [])],
      nav: navObjective(wf.objectiveIds?.[0]),
    }))
  }

  for (const oid of curatedObjectiveIds) {
    const pack = getCurated(oid)
    if (!pack) continue
    for (const chunk of readingChunksForPack(pack)) {
      addChunk(chunks, byId, chunk)
    }
  }

  const facets = {}
  for (const c of chunks) {
    facets[c.kind] = (facets[c.kind] || 0) + 1
  }

  return {
    chunks,
    chunkById: byId,
    objectives: topicIndex.objectives,
    facets,
  }
}

export function getLibraryIndex() {
  if (!_cache) _cache = buildLibraryIndex()
  return _cache
}

function pickDiverse(scored, limit = 12) {
  const kindCount = {}
  const out = []
  for (const hit of scored) {
    const k = hit.kind
    if ((kindCount[k] || 0) >= 2) continue
    kindCount[k] = (kindCount[k] || 0) + 1
    out.push(hit)
    if (out.length >= limit) break
  }
  if (out.length < limit) {
    for (const hit of scored) {
      if (out.some(x => x.id === hit.id)) continue
      out.push(hit)
      if (out.length >= limit) break
    }
  }
  return out
}

export function searchLibrary(query, {
  domainFilter = 'all',
  scopeObjectiveId = null,
  kinds = null,
  intent = null,
  limit = 12,
} = {}) {
  const index = getLibraryIndex()
  const q = norm(query)
  const resolvedIntent = intent || detectIntent(query)
  if (!q) return { hits: [], intent: resolvedIntent, facets: index.facets }

  const scored = []
  for (const chunk of index.chunks) {
    if (scopeObjectiveId && !(chunk.objectiveIds || []).includes(scopeObjectiveId)) continue
    if (!inDomain(chunk.objectiveIds, domainFilter, index.objectives)) continue
    if (kinds?.length && !kinds.includes(chunk.kind)) continue

    let score = bestScore(q, chunk.title, chunk.body, ...(chunk.tags || []))
    score += INTENT_KIND_BOOST[resolvedIntent]?.[chunk.kind] || 0
    if (chunk.quality === 'authoritative') score += 4
    if (score <= 0) continue
    scored.push({ ...chunk, score })
  }

  scored.sort((a, b) => b.score - a.score)
  const hits = pickDiverse(scored, limit)

  return { hits, intent: resolvedIntent, facets: index.facets, totalMatches: scored.length }
}

export function chunksForSynthesis(hits, max = 8) {
  return pickDiverse(hits.map(h => ({ ...h })), max)
}

/** @param {import('./libraryChunk.js').LibraryChunk} chunk */
export function kindLabel(kind) {
  const map = {
    term: 'Term',
    concept: 'Concept',
    objective: 'Objective',
    'reading-tier': 'Reading',
    'reading-section': 'Reading',
    command: 'Command',
    workflow: 'Workflow',
    'exam-trap': 'Exam trap',
    'engineer-view': 'Engineer view',
  }
  return map[kind] || kind
}
