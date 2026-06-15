#!/usr/bin/env node
/** Phase 2 — merge normalized lessons into objective-level KB readings + CKU enrichments. */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { OBJECTIVE_GAPS } from './lib/onenoteTopicMap.mjs'
import {
  ROOT,
  ONENOTE_NORMALIZED,
  ONENOTE_COMPILED,
  loadJson,
  buildReadingTiers,
} from './lib/onenoteUtils.mjs'

const KB_DIR = join(ROOT, 'data', 'knowledge-base')
const CKUS_PATH = join(KB_DIR, 'ckus.json')

function loadNormalized() {
  if (!existsSync(ONENOTE_NORMALIZED)) return []
  return readdirSync(ONENOTE_NORMALIZED)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(readFileSync(join(ONENOTE_NORMALIZED, f), 'utf8')))
}

function mergeByObjective(records) {
  const byObj = new Map()
  for (const rec of records) {
    if (rec.chapter) continue
    for (const oid of rec.objectiveIds || []) {
      if (!byObj.has(oid)) byObj.set(oid, [])
      byObj.get(oid).push(rec)
    }
  }

  const readings = {}
  for (const [objectiveId, group] of byObj) {
    const sorted = [...group].sort((a, b) => (a.part || 0) - (b.part || 0))
    const operatorSummary = sorted.map(r => r.operatorSummary).filter(Boolean).join(' ').slice(0, 600)
    const keyPoints = [...new Set(sorted.flatMap(r => r.keyPoints || []))].slice(0, 10)
    const examTraps = sorted.flatMap(r => r.examTraps || []).slice(0, 8)
    const learningOutcomes = [...new Set(sorted.flatMap(r => r.learningOutcomes || []))].slice(0, 8)
    const warnings = sorted.flatMap(r => r.warnings || [])
    const sourceFiles = sorted.map(r => r.filename)
    const hasDraft = sorted.some(r => r.confidence === 'draft')

    const parsed = {
      operatorSummary,
      keyPoints,
      examTraps,
      learningOutcomes,
      warnings,
    }
    const examBoundary = learningOutcomes.find(l => /exam|ccna|must/i.test(l)) || ''
    const { tiers, bigTakeaway } = buildReadingTiers(
      { operatorSummary, keyPoints },
      compressBoundary(examBoundary),
    )

    readings[objectiveId] = {
      objectiveId,
      operatorSummary,
      keyPoints,
      examTraps,
      learningOutcomes,
      tiers,
      bigTakeaway,
      sourceFiles,
      confidence: hasDraft ? 'draft' : 'gold',
      needsReview: warnings.length > 0,
      ckuIds: [...new Set(sorted.flatMap(r => r.ckuIds || []))],
    }
  }
  return readings
}

function compressBoundary(text) {
  if (!text) return ''
  return String(text).replace(/\*\*/g, '').slice(0, 220)
}

function enrichCkus(records, ckus) {
  const byId = new Map(ckus.map(c => [c.ckuId, { ...c }]))
  for (const rec of records) {
    if (!rec.operatorSummary || !rec.ckuIds?.length) continue
    for (const ckuId of rec.ckuIds) {
      const existing = byId.get(ckuId)
      if (!existing) continue
      existing.operatorSummary = rec.operatorSummary.slice(0, 480)
      existing.source = 'onenote'
      existing.sourceFiles = [...new Set([...(existing.sourceFiles || []), rec.filename])]
      existing.confidence = rec.confidence === 'draft' ? 'draft' : (existing.confidence || 'gold')
    }
  }
  return [...byId.values()]
}

function main() {
  const records = loadNormalized()
  if (!records.length) {
    console.error('✗ No normalized OneNote data. Run: npm run onenote:import')
    process.exit(1)
  }

  mkdirSync(ONENOTE_COMPILED, { recursive: true })
  const readings = mergeByObjective(records)
  const gapsCovered = OBJECTIVE_GAPS.filter(id => !readings[id])

  writeFileSync(join(ONENOTE_COMPILED, 'objective-readings.json'), JSON.stringify(readings, null, 2))

  const ckus = existsSync(CKUS_PATH) ? JSON.parse(readFileSync(CKUS_PATH, 'utf8')) : []
  const enriched = enrichCkus(records, ckus)
  writeFileSync(join(ONENOTE_COMPILED, 'cku-enrichments.json'), JSON.stringify(enriched, null, 2))

  const trapAdditions = []
  for (const r of Object.values(readings)) {
    for (const t of r.examTraps || []) {
      trapAdditions.push({ ...t, objectiveId: r.objectiveId, source: 'onenote' })
    }
  }
  writeFileSync(join(ONENOTE_COMPILED, 'exam-trap-additions.json'), JSON.stringify(trapAdditions, null, 2))

  const gold = Object.values(readings).filter(r => r.confidence === 'gold').length
  console.log(`✓ Merged OneNote → ${Object.keys(readings).length} objective readings (${gold} gold)`)
  if (gapsCovered.length) {
    console.log(`  ℹ Objective gaps (no OneNote page): ${gapsCovered.join(', ')}`)
  }
}

main()
