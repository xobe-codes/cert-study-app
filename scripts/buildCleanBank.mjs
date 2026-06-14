#!/usr/bin/env node
/**
 * Build clean question bank — domain-by-domain or all domains.
 * Usage: node scripts/buildCleanBank.mjs [2|3|4|5|6|all]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCurated } from '../src/data/ccnaCurated.js'
import {
  SCHEMA_VERSION,
  cleanAppQuestion,
  convertSourceQuestion,
  isExhibitDependent,
  shelvedRecord,
} from './lib/cleanBankUtils.mjs'
import { DOMAIN_META, filesForDomain, OSPF_34_EXCLUDE } from './lib/sourceBankConfig.mjs'
import { tryConvertExhibit } from './lib/exhibitConverters.mjs'
import { APPROVED_UNCERTAIN_IDS, PROMOTED_OSPF_34_IDS } from './lib/shelvedOverrides.mjs'
import { applyAnswerReviewToQuestion } from './lib/generateAnswerReview.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SOURCE_ROOT = join(ROOT, 'data', 'source-question-bank')
const DL = join(homedir(), 'Downloads')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const SHELVED_ROOT = join(ROOT, 'data', 'shelved-questions')

const arg = process.argv[2] || 'all'
const domains = arg === 'all' ? [2, 3, 4, 5, 6] : [Number(arg)]
if (domains.some(d => !DOMAIN_META[d])) {
  console.error('Usage: buildCleanBank.mjs [2|3|4|5|6|all]')
  process.exit(1)
}

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

function mergeCuratedHand(appId) {
  const curated = getCurated(appId)
  if (!curated?.questions?.length) return []
  return curated.questions.map(q => cleanAppQuestion(q, appId))
}

function processQuestion(q, appId, shelved) {
  let clean = q
  if (isExhibitDependent(clean)) {
    const converted = tryConvertExhibit(clean, appId)
    if (converted) {
      clean = converted
    } else {
      shelved.exhibitDependent.push(shelvedRecord(clean, appId, 'exhibit-dependent'))
      return null
    }
  }
  return applyAnswerReviewToQuestion(clean)
}

function buildFromSourceEntry(entry) {
  const data = readSourceJson(entry.file)
  if (!data) return { active: [], shelved: { exhibitDependent: [], outOfScope: [] }, missing: true }

  const exclude = new Set(entry.exclude || [])
  const shelved = { exhibitDependent: [], outOfScope: [] }
  const active = []

  for (const q of data.questions || []) {
    if (exclude.has(q.id) && !PROMOTED_OSPF_34_IDS.has(q.id)) {
      shelved.outOfScope.push(shelvedRecord(convertSourceQuestion(q, entry.appId), entry.appId, 'out-of-scope', 'excluded cluster'))
      continue
    }
    if (q.qualityFlags?.uncertainObjectiveMapping && !APPROVED_UNCERTAIN_IDS.has(q.id) && !PROMOTED_OSPF_34_IDS.has(q.id)) {
      shelved.outOfScope.push(shelvedRecord(convertSourceQuestion(q, entry.appId), entry.appId, 'out-of-scope', 'uncertainObjectiveMapping'))
      continue
    }
    const converted = convertSourceQuestion(q, entry.appId)
    const final = processQuestion(converted, entry.appId, shelved)
    if (final) active.push(final)
  }

  return { active, shelved, missing: false }
}

function buildDomain(domainNum) {
  const meta = DOMAIN_META[domainNum]
  const cleanDir = join(CLEAN_ROOT, `domain-${domainNum}`)
  const shelvedDir = join(SHELVED_ROOT, `domain-${domainNum}`)
  mkdirSync(cleanDir, { recursive: true })
  mkdirSync(shelvedDir, { recursive: true })

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    domain: String(domainNum),
    domainName: meta.name,
    builtAt: new Date().toISOString(),
    objectives: {},
    totals: { active: 0, shelved: 0 },
  }

  const allShelved = { exhibitDependent: [], outOfScope: [] }
  const byObjective = {}

  for (const entry of filesForDomain(domainNum)) {
    console.log(`  ${entry.appId} …`)
    let active = mergeCuratedHand(entry.appId)

    const shelvedLocal = { exhibitDependent: [], outOfScope: [] }
    active = active.map(q => processQuestion(q, entry.appId, shelvedLocal)).filter(Boolean)

    const result = buildFromSourceEntry(entry)
    if (!result.missing) {
      active = dedupeById([...active, ...result.active])
      allShelved.exhibitDependent.push(...shelvedLocal.exhibitDependent, ...result.shelved.exhibitDependent)
      allShelved.outOfScope.push(...shelvedLocal.outOfScope, ...result.shelved.outOfScope)
    } else {
      allShelved.exhibitDependent.push(...shelvedLocal.exhibitDependent)
      allShelved.outOfScope.push(...shelvedLocal.outOfScope)
      if (!active.length) console.warn(`    source missing for ${entry.appId}`)
    }

    byObjective[entry.appId] = (byObjective[entry.appId] || []).concat(active)
  }

  for (const [appId, questions] of Object.entries(byObjective)) {
    const deduped = dedupeById(questions)
    const curated = getCurated(appId)
    const data = readSourceJson(filesForDomain(domainNum).find(f => f.appId === appId)?.file || '')
    writeFileSync(join(cleanDir, `${appId}.json`), JSON.stringify({
      objectiveId: appId,
      title: curated?.title || data?.objective?.objectiveTitle || appId,
      questions: deduped.map(q => applyAnswerReviewToQuestion(q)),
    }, null, 2))
    manifest.objectives[appId] = { active: deduped.length }
    manifest.totals.active += deduped.length
  }

  writeFileSync(join(cleanDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  writeFileSync(join(shelvedDir, 'exhibit-dependent.json'), JSON.stringify(allShelved.exhibitDependent, null, 2))
  writeFileSync(join(shelvedDir, 'out-of-scope.json'), JSON.stringify(allShelved.outOfScope, null, 2))
  manifest.totals.shelved = allShelved.exhibitDependent.length + allShelved.outOfScope.length

  console.log(`✓ Domain ${domainNum}: ${manifest.totals.active} active, ${manifest.totals.shelved} shelved`)
  return manifest
}

function main() {
  const summary = { builtAt: new Date().toISOString(), domains: {} }
  for (const d of domains) {
    console.log(`Building domain ${d} (${DOMAIN_META[d].name}) …`)
    summary.domains[d] = buildDomain(d)
  }
  writeFileSync(join(CLEAN_ROOT, 'manifest.json'), JSON.stringify(summary, null, 2))
  console.log('✓ All requested domains built')
}

main()
