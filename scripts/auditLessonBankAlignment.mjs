#!/usr/bin/env node
/**
 * Lesson ↔ Question Bank Alignment audit (P0 — measure only).
 * Spec: ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md (sections 3-4, 6 P0)
 *
 * Join key: question.ckuIds[] <-> curated.ckus[] / reading.ckuIds / examTraps.ckuIds /
 * flashcards.ckuId(s) / commands.ckuIds.
 *
 * Writes:
 *   ai-improvement-logs/LESSON_BANK_ALIGNMENT_MATRIX.json
 *   ai-improvement-logs/LESSON_BANK_ALIGNMENT_REPORT.md
 *
 * Flags:
 *   --queue   also seed FAIL objectives into IMPLEMENTATION_QUEUE.json (lesson-align-{id}),
 *             and close any pending lesson-align-{id} item whose objective now grades PASS
 *             (queue entries otherwise never learn that later content work already fixed them —
 *             see LESSON_BANK_ALIGNMENT_99_SPEC.md's "Baseline caution" note)
 *
 * Exit code: always 0 for P0 (inventory pass, not a gate).
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES, DOMAINS } from '../src/data/ccnaDomains.js'
import { getCurated } from '../src/data/ccnaCurated.js'
import { canonicalizeCkuId } from '../src/data/ckuAliasMap.js'
import { scoreLessonRetentionProse } from '../src/lesson/lessonAlignmentProse.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'ai-improvement-logs')
const BANK_DIR = join(ROOT, 'data', 'clean-question-bank')
const MATRIX_PATH = join(OUT_DIR, 'LESSON_BANK_ALIGNMENT_MATRIX.json')
const REPORT_PATH = join(OUT_DIR, 'LESSON_BANK_ALIGNMENT_REPORT.md')
const QUEUE_PATH = join(OUT_DIR, 'IMPLEMENTATION_QUEUE.json')

const DOMAIN_WEIGHT_BY_OBJECTIVE = new Map()
const DOMAIN_NAME_BY_ID = new Map()
for (const d of DOMAINS) {
  DOMAIN_NAME_BY_ID.set(d.id, d.name)
  for (const o of d.objectives) DOMAIN_WEIGHT_BY_OBJECTIVE.set(o.id, d.weight)
}

const CKU_LETTER_RE = /^(\d+\.\d+)\.([a-z])$/i

function domainNumber(objectiveId) {
  return objectiveId.split('.')[0]
}

function loadBankQuestions(objectiveId) {
  const file = join(BANK_DIR, `domain-${domainNumber(objectiveId)}`, `${objectiveId}.json`)
  if (!existsSync(file)) return []
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'))
    return Array.isArray(data.questions) ? data.questions : []
  } catch (e) {
    console.warn(`⚠ ${objectiveId}: failed to parse ${file} — ${e.message}`)
    return []
  }
}

/** Every CKU a lesson gives exam-relevant support for: ckus[], reading.ckuIds, trap/flashcard/command ckuIds. */
function collectLessonSupportCkus(curated) {
  const set = new Set()
  if (!curated) return set
  for (const cku of curated.ckus || []) {
    if (cku?.id) set.add(canonicalizeCkuId(cku.id))
  }
  for (const id of curated.reading?.ckuIds || []) set.add(canonicalizeCkuId(id))
  for (const trap of curated.examTraps || []) {
    for (const id of trap?.ckuIds || []) set.add(canonicalizeCkuId(id))
  }
  for (const fc of curated.flashcards || []) {
    if (fc?.ckuId) set.add(canonicalizeCkuId(fc.ckuId))
    for (const id of fc?.ckuIds || []) set.add(canonicalizeCkuId(id))
  }
  for (const cmd of curated.commands || []) {
    for (const id of cmd?.ckuIds || []) set.add(canonicalizeCkuId(id))
  }
  return set
}

/** Prose floors from spec 3.2 — shared scorer with validate:lesson-prose. */
function computeProseScores(curated) {
  const scored = scoreLessonRetentionProse({
    reading: curated?.reading,
    examTraps: curated?.examTraps,
    engineerView: curated?.engineerView,
  })
  const d = scored.details || {}
  return {
    missingReading: !curated?.reading,
    bigTakeawayWords: scored.bigTakeawayWords,
    bigTakeawayPass: !!d.bigTakeaway?.ok,
    beginnerWords: d.plainEnglish?.words || 0,
    beginnerSentences: d.plainEnglish?.sentences || 0,
    beginnerPass: scored.plainEnglishOk,
    howItWorksWords: Math.max(d.howItWorks?.intermediateWords || 0, d.howItWorks?.examReadyWords || 0),
    howItWorksSteps: Math.max(d.howItWorks?.intermediateSentences || 0, d.howItWorks?.examReadySentences || 0),
    howItWorksPass: scored.howItWorksOk,
    examCuePass: scored.examCueOk,
    keyPointsCount: d.remember?.count || 0,
    rememberThisPass: scored.rememberOk,
    dontConfusePass: scored.dontConfuseOk,
    draftPatternHits: scored.draftHits || [],
    thinProse: scored.thinProse,
  }
}

/** Blueprint sub-part ledger from curated.ckus sourceRefs.chapter (e.g. "3.2.a"). */
function buildSubObjectiveLedger(curated, questions) {
  const letterCkus = new Map()
  for (const cku of curated?.ckus || []) {
    for (const ref of cku.sourceRefs || []) {
      const m = CKU_LETTER_RE.exec(String(ref?.chapter || '').trim())
      if (!m) continue
      const letter = m[2].toLowerCase()
      if (!letterCkus.has(letter)) letterCkus.set(letter, new Set())
      letterCkus.get(letter).add(cku.id)
    }
  }

  const questionIdsByCku = new Map()
  for (const q of questions) {
    for (const id of q.ckuIds || []) {
      if (!questionIdsByCku.has(id)) questionIdsByCku.set(id, [])
      questionIdsByCku.get(id).push(q.id)
    }
  }

  const ledger = []
  const missingLetters = []
  for (const [letter, ckuIds] of [...letterCkus.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const questionIds = new Set()
    for (const ckuId of ckuIds) for (const qid of questionIdsByCku.get(ckuId) || []) questionIds.add(qid)
    const entry = { letter, ckuIds: [...ckuIds], questionIds: [...questionIds] }
    ledger.push(entry)
    if (questionIds.size === 0) missingLetters.push(letter)
  }

  return { subObjectiveLedger: ledger, missingLetters }
}

function analyzeObjective(obj) {
  const objectiveId = obj.id
  const curated = getCurated(objectiveId)
  const questions = loadBankQuestions(objectiveId)

  const bankCkuSet = new Set()
  const orphanQuestions = []
  for (const q of questions) {
    const ids = Array.isArray(q.ckuIds) ? q.ckuIds.filter(Boolean).map(canonicalizeCkuId) : []
    if (ids.length === 0) orphanQuestions.push(q.id)
    for (const id of ids) bankCkuSet.add(id)
  }

  const lessonSupportSet = collectLessonSupportCkus(curated)
  const ckuIdsInBank = [...bankCkuSet].sort()
  const missingCkus = ckuIdsInBank.filter(id => !lessonSupportSet.has(id))
  const uniqueBankCkus = ckuIdsInBank.length
  const supportedBankCkus = uniqueBankCkus - missingCkus.length
  const ckuCoverage = uniqueBankCkus === 0 ? 1 : supportedBankCkus / uniqueBankCkus
  const ckuPass = ckuCoverage >= 0.95

  const proseScores = computeProseScores(curated)
  const { subObjectiveLedger, missingLetters } = buildSubObjectiveLedger(curated, questions)

  let grade
  if (ckuPass && !proseScores.thinProse) grade = 'PASS'
  else if (ckuPass && proseScores.thinProse) grade = 'THIN_PROSE'
  else if (!ckuPass && !proseScores.thinProse) grade = 'MISSING_CKU'
  else grade = 'BOTH'

  return {
    objectiveId,
    domainId: obj.domainId,
    domainName: obj.domainName,
    title: obj.title,
    examWeight: DOMAIN_WEIGHT_BY_OBJECTIVE.get(objectiveId) ?? 0,
    hasCurated: !!curated,
    questionCount: questions.length,
    ckuIdsInBank,
    ckuIdsInLesson: [...lessonSupportSet].sort(),
    missingCkus,
    orphanQuestions,
    ckuCoverage: Math.round(ckuCoverage * 1000) / 1000,
    ckuPass,
    subObjectiveLedger,
    missingLetters,
    proseScores,
    grade,
  }
}

function priorityTierFor(rank, total) {
  if (total <= 0) return 'low'
  const pct = rank / total
  if (pct < 0.25) return 'critical'
  if (pct < 0.5) return 'high'
  if (pct < 0.75) return 'medium'
  return 'low'
}

function updateQueue(failRows) {
  let queue = { generatedAt: new Date().toISOString(), items: [] }
  if (existsSync(QUEUE_PATH)) {
    try { queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8')) } catch { /* keep default */ }
  }
  const items = Array.isArray(queue.items) ? queue.items : []
  const byId = new Map(items.map((it, idx) => [it.id, idx]))

  const scored = failRows
    .map(r => ({ row: r, score: r.examWeight * Math.max(r.missingCkus.length, 1) }))
    .sort((a, b) => b.score - a.score)

  let added = 0
  let updated = 0
  scored.forEach(({ row, score }, rank) => {
    const id = `lesson-align-${row.objectiveId}`
    const existingIdx = byId.get(id)
    if (existingIdx !== undefined && items[existingIdx].status === 'done') return // never reopen completed work

    const priority = priorityTierFor(rank, scored.length)
    const item = {
      id,
      priority,
      status: 'pending',
      area: 'content',
      objectiveNumber: row.objectiveId,
      problem: row.grade === 'MISSING_CKU'
        ? `${row.missingCkus.length} bank CKU(s) untaught in Study (reverse coverage ${(row.ckuCoverage * 100).toFixed(0)}%)`
        : row.grade === 'THIN_PROSE'
          ? 'Lesson prose fails retention floors (thin/draft)'
          : `${row.missingCkus.length} missing CKU(s) + thin prose`,
      recommendedImprovement: row.grade === 'THIN_PROSE'
        ? 'Beautify tiers/keyPoints/examTraps to clear prose floors (LESSON_BANK_ALIGNMENT_99_SPEC 3.2)'
        : 'Add CKU anchors to reading/traps/flashcards until reverse coverage >=95% (LESSON_BANK_ALIGNMENT_99_SPEC 3.1)',
      riskLevel: 'low',
      confidenceScore: 70,
      scoreImpact: { alignmentScore: score },
      source: 'audit:lesson-bank',
    }

    if (existingIdx !== undefined) {
      items[existingIdx] = { ...items[existingIdx], ...item, status: items[existingIdx].status === 'pending' ? 'pending' : item.status }
      updated += 1
    } else {
      items.push(item)
      byId.set(id, items.length - 1)
      added += 1
    }
  })

  queue.items = items
  queue.generatedAt = new Date().toISOString()
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2))
  return { added, updated, total: scored.length }
}

/** Close pending lesson-align-{id} queue rows whose objective now grades PASS. */
function closeStalePassed(rows) {
  if (!existsSync(QUEUE_PATH)) return { closed: 0 }
  let queue
  try { queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8')) } catch { return { closed: 0 } }
  const items = Array.isArray(queue.items) ? queue.items : []
  const passIds = new Set(rows.filter(r => r.grade === 'PASS').map(r => r.objectiveId))

  let closed = 0
  for (const item of items) {
    if (!item.id?.startsWith('lesson-align-')) continue
    if (item.status !== 'pending') continue
    if (!passIds.has(item.objectiveNumber)) continue
    item.status = 'done'
    item.summary = 'Closed by audit:lesson-bank --queue: objective now grades PASS (reverse CKU coverage >=95%, prose floors clear).'
    closed += 1
  }

  if (closed > 0) {
    queue.items = items
    queue.generatedAt = new Date().toISOString()
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2))
  }
  return { closed }
}

function buildReport(rows, generatedAt) {
  const byDomain = new Map()
  for (const r of rows) {
    if (!byDomain.has(r.domainId)) byDomain.set(r.domainId, [])
    byDomain.get(r.domainId).push(r)
  }

  const gradeCounts = { PASS: 0, THIN_PROSE: 0, MISSING_CKU: 0, BOTH: 0 }
  for (const r of rows) gradeCounts[r.grade] += 1

  const failRows = rows.filter(r => r.grade !== 'PASS')
  const top10ByMissingCku = [...failRows]
    .filter(r => r.missingCkus.length > 0)
    .sort((a, b) => (b.examWeight * b.missingCkus.length) - (a.examWeight * a.missingCkus.length))
    .slice(0, 10)

  const lines = []
  lines.push('# Lesson ↔ Question Bank Alignment Report')
  lines.push('')
  lines.push(`Generated: ${generatedAt}`)
  lines.push(`Spec: \`ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md\` (P0 — measure only, no content rewritten)`)
  lines.push('')
  lines.push('## App rollup')
  lines.push('')
  lines.push(`| Grade | Count | % |`)
  lines.push(`|---|---|---|`)
  for (const g of ['PASS', 'THIN_PROSE', 'MISSING_CKU', 'BOTH']) {
    lines.push(`| ${g} | ${gradeCounts[g]} | ${((gradeCounts[g] / rows.length) * 100).toFixed(0)}% |`)
  }
  lines.push('')
  lines.push(`**${gradeCounts.PASS}/${rows.length}** objectives fully pass (3.3 domain bar target: ≥50/53).`)
  lines.push('')

  lines.push('## Domain rollup')
  lines.push('')
  lines.push('| Domain | Weight | PASS | THIN_PROSE | MISSING_CKU | BOTH | Objectives |')
  lines.push('|---|---|---|---|---|---|---|')
  for (const d of DOMAINS) {
    const objs = byDomain.get(d.id) || []
    const c = { PASS: 0, THIN_PROSE: 0, MISSING_CKU: 0, BOTH: 0 }
    for (const r of objs) c[r.grade] += 1
    lines.push(`| ${d.name} | ${d.weight}% | ${c.PASS} | ${c.THIN_PROSE} | ${c.MISSING_CKU} | ${c.BOTH} | ${objs.length} |`)
  }
  lines.push('')

  lines.push('## Top 10 objectives by MISSING_CKU × exam weight')
  lines.push('')
  if (top10ByMissingCku.length === 0) {
    lines.push('_None — no objective has a reverse-CKU gap._')
  } else {
    lines.push('| Objective | Domain weight | Missing CKUs | Coverage | Grade | Sample missing CKU |')
    lines.push('|---|---|---|---|---|---|')
    for (const r of top10ByMissingCku) {
      lines.push(`| ${r.objectiveId} — ${r.title} | ${r.examWeight}% | ${r.missingCkus.length} | ${(r.ckuCoverage * 100).toFixed(0)}% | ${r.grade} | ${r.missingCkus[0] || '—'} |`)
    }
  }
  lines.push('')

  lines.push('## THIN_PROSE / BOTH detail (prose floor misses)')
  lines.push('')
  const thinRows = rows.filter(r => r.grade === 'THIN_PROSE' || r.grade === 'BOTH')
  if (thinRows.length === 0) {
    lines.push('_None._')
  } else {
    lines.push('| Objective | bigTakeaway | plainEnglish | howItWorks | examCue | rememberThis | draftHits |')
    lines.push('|---|---|---|---|---|---|---|')
    for (const r of thinRows) {
      const p = r.proseScores
      lines.push(`| ${r.objectiveId} | ${p.bigTakeawayPass ? '✓' : '✗'} | ${p.beginnerPass ? '✓' : '✗'} | ${p.howItWorksPass ? '✓' : '✗'} | ${p.examCuePass ? '✓' : '✗'} | ${p.rememberThisPass ? '✓' : '✗'} | ${p.draftPatternHits.length} |`)
    }
  }
  lines.push('')

  lines.push('## All FAIL objectives (grade != PASS)')
  lines.push('')
  if (failRows.length === 0) {
    lines.push('_None — 53/53 PASS._')
  } else {
    lines.push('| Objective | Domain | Grade | Q count | Missing CKUs | Coverage |')
    lines.push('|---|---|---|---|---|---|')
    for (const r of [...failRows].sort((a, b) => a.objectiveId.localeCompare(b.objectiveId, undefined, { numeric: true }))) {
      lines.push(`| ${r.objectiveId} | ${r.domainName} | ${r.grade} | ${r.questionCount} | ${r.missingCkus.length} | ${(r.ckuCoverage * 100).toFixed(0)}% |`)
    }
  }
  lines.push('')

  lines.push('## Methodology')
  lines.push('')
  lines.push('- **CKU reverse coverage** = supported bank CKUs / unique bank CKUs (pass ≥95%); objectives with no bank CKUs default to 100%.')
  lines.push('- **Lesson support set** = `curated.ckus[].id` ∪ `reading.ckuIds` ∪ `examTraps[].ckuIds` ∪ `flashcards[].ckuId(s)` ∪ `commands[].ckuIds`.')
  lines.push('- **Prose floors** (post-`getCurated`/`finalizeReading`): bigTakeaway 8–28 words · plain English (beginner tier) ≥40 words/≤5 sentences · how-it-works (intermediate or examReady) ≥50 words or ≥3 step-like sentences · exam cue = ≥1 trap or ≥2 commonMistakes or engineerView · remember-this = ≥3 keyPoints · draft hits via `isDraftKbTierText`.')
  lines.push('- **Sub-objective ledger**: `curated.ckus[].sourceRefs[].chapter` matching `/^(\\d+\\.\\d+)\\.([a-z])$/i`; `missingLetters` = letters with CKUs tagged but zero bank questions covering them. Empty today — no curated CKU currently tags a blueprint sub-letter; ledger activates automatically once P3 sourceRefs are added.')
  lines.push('- This is **P0 (measure only)** — no content was rewritten. See queue items `lesson-align-{id}` for P1/P2 follow-up.')
  lines.push('')

  return lines.join('\n')
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const wantsQueue = process.argv.includes('--queue')

  const rows = ALL_OBJECTIVES.map(analyzeObjective)
  const generatedAt = new Date().toISOString()

  const gradeCounts = { PASS: 0, THIN_PROSE: 0, MISSING_CKU: 0, BOTH: 0 }
  for (const r of rows) gradeCounts[r.grade] += 1

  const matrix = {
    generatedAt,
    spec: 'ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md',
    phase: 'P0',
    totalObjectives: rows.length,
    gradeCounts,
    objectives: rows,
  }
  writeFileSync(MATRIX_PATH, JSON.stringify(matrix, null, 2))

  const report = buildReport(rows, generatedAt)
  writeFileSync(REPORT_PATH, report)

  console.log(`✓ audit:lesson-bank — ${rows.length} objectives → ai-improvement-logs/LESSON_BANK_ALIGNMENT_MATRIX.json`)
  console.log(`  PASS: ${gradeCounts.PASS} · THIN_PROSE: ${gradeCounts.THIN_PROSE} · MISSING_CKU: ${gradeCounts.MISSING_CKU} · BOTH: ${gradeCounts.BOTH}`)
  console.log(`  Report: ai-improvement-logs/LESSON_BANK_ALIGNMENT_REPORT.md`)

  const failRows = rows.filter(r => r.grade !== 'PASS')
  if (wantsQueue) {
    if (failRows.length > 0) {
      const { added, updated, total } = updateQueue(failRows)
      console.log(`  Queue: ${added} added · ${updated} refreshed · ${total} lesson-align-* pending (IMPLEMENTATION_QUEUE.json)`)
    } else {
      console.log('  Queue: no FAIL objectives — nothing to seed')
    }
    const { closed } = closeStalePassed(rows)
    if (closed > 0) console.log(`  Queue: ${closed} stale lesson-align-* item(s) closed (objective now PASS)`)
  }

  process.exit(0)
}

main()
