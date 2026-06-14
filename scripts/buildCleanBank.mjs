#!/usr/bin/env node
/**
 * Build student-facing clean question bank for Domain 4 (IP Services) pilot.
 * - 4.1: prefers hand-curated questions from ccnaCurated.js (merged at build)
 * - 4.2–4.9: converted from data/source-question-bank/ (fallback: ~/Downloads/)
 * - Exhibit-dependent questions → data/shelved-questions/domain-4/
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCurated } from '../src/data/ccnaCurated.js'
import {
  SCHEMA_VERSION,
  DOMAIN_4_OBJECTIVES,
  DOMAIN_4_SOURCE_FILES,
  cleanAppQuestion,
  convertSourceQuestion,
  isExhibitDependent,
  shelvedRecord,
} from './lib/cleanBankUtils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SOURCE_ROOT = join(ROOT, 'data', 'source-question-bank')
const DL = join(homedir(), 'Downloads')
const CLEAN_DIR = join(ROOT, 'data', 'clean-question-bank', 'domain-4')
const SHELVED_DIR = join(ROOT, 'data', 'shelved-questions', 'domain-4')

function readSourceJson(relPath) {
  const local = join(SOURCE_ROOT, relPath)
  const fallback = join(DL, relPath)
  const path = existsSync(local) ? local : existsSync(fallback) ? fallback : null
  if (!path) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function dedupeById(questions) {
  const seen = new Set()
  return questions.filter(q => {
    if (!q.id || seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })
}

function buildObjective41() {
  const curated = getCurated('4.1')
  const active = []
  const shelved = []

  for (const q of curated?.questions || []) {
    const clean = cleanAppQuestion(q, '4.1')
    if (isExhibitDependent(clean)) {
      shelved.push(shelvedRecord(clean, '4.1', 'exhibit-dependent', 'NAT topology — convert to inline text exhibit later'))
    } else {
      active.push(clean)
    }
  }

  return { active: dedupeById(active), shelved }
}

function buildFromSource(appId, relPath) {
  const data = readSourceJson(relPath)
  if (!data) {
    console.warn(`  ${appId}: source file missing — skipping`)
    return { active: [], shelved: [], missing: true }
  }

  const active = []
  const shelved = []

  for (const q of data.questions || []) {
    const converted = convertSourceQuestion(q, appId)
    if (isExhibitDependent(converted)) {
      shelved.push(shelvedRecord(converted, appId, 'exhibit-dependent'))
    } else if (q.qualityFlags?.uncertainObjectiveMapping) {
      shelved.push(shelvedRecord(converted, appId, 'out-of-scope', 'uncertainObjectiveMapping'))
    } else {
      active.push(converted)
    }
  }

  return { active: dedupeById(active), shelved, missing: false }
}

function main() {
  mkdirSync(CLEAN_DIR, { recursive: true })
  mkdirSync(SHELVED_DIR, { recursive: true })

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    domain: '4',
    domainName: 'IP Services',
    builtAt: new Date().toISOString(),
    objectives: {},
    totals: { active: 0, shelved: 0, needsExplanationReview: 0 },
  }

  const allShelved = { exhibitDependent: [], outOfScope: [] }

  // 4.1 from curated
  console.log('Building 4.1 from curated …')
  const r41 = buildObjective41()
  writeFileSync(join(CLEAN_DIR, '4.1.json'), JSON.stringify({
    objectiveId: '4.1',
    title: getCurated('4.1')?.title || 'NAT',
    questions: r41.active,
  }, null, 2))
  allShelved.exhibitDependent.push(...r41.shelved)
  manifest.objectives['4.1'] = { active: r41.active.length, shelved: r41.shelved.length, source: 'curated' }
  manifest.totals.active += r41.active.length
  manifest.totals.shelved += r41.shelved.length
  manifest.totals.needsExplanationReview += r41.active.filter(q => q.needsExplanationReview).length

  // 4.2–4.9 from source JSON
  for (const entry of DOMAIN_4_SOURCE_FILES) {
    if (entry.appId === '4.1') continue
    console.log(`Building ${entry.appId} from source …`)
    const result = buildFromSource(entry.appId, entry.file)
    const data = readSourceJson(entry.file)
    writeFileSync(join(CLEAN_DIR, `${entry.appId}.json`), JSON.stringify({
      objectiveId: entry.appId,
      title: data?.objective?.objectiveTitle || entry.appId,
      questions: result.active,
    }, null, 2))
    for (const s of result.shelved) {
      if (s.reason === 'out-of-scope') allShelved.outOfScope.push(s)
      else allShelved.exhibitDependent.push(s)
    }
    manifest.objectives[entry.appId] = {
      active: result.active.length,
      shelved: result.shelved.length,
      source: result.missing ? 'missing' : 'source-json',
    }
    manifest.totals.active += result.active.length
    manifest.totals.shelved += result.shelved.length
    manifest.totals.needsExplanationReview += result.active.filter(q => q.needsExplanationReview).length
  }

  writeFileSync(join(ROOT, 'data', 'clean-question-bank', 'manifest.json'), JSON.stringify(manifest, null, 2))
  writeFileSync(join(SHELVED_DIR, 'exhibit-dependent.json'), JSON.stringify(allShelved.exhibitDependent, null, 2))
  writeFileSync(join(SHELVED_DIR, 'out-of-scope.json'), JSON.stringify(allShelved.outOfScope, null, 2))

  console.log('✓ Clean bank built')
  console.log(`  Active: ${manifest.totals.active}`)
  console.log(`  Shelved: ${manifest.totals.shelved}`)
  console.log(`  Needs explanation review: ${manifest.totals.needsExplanationReview}`)
  for (const id of DOMAIN_4_OBJECTIVES) {
    const o = manifest.objectives[id]
    if (o) console.log(`  ${id}: ${o.active} active, ${o.shelved} shelved (${o.source})`)
  }
}

main()
