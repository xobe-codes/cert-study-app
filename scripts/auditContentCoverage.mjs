#!/usr/bin/env node
/**
 * Build-time coverage scanner — writes objective-level metrics to ai-improvement-logs/.
 * No runtime cost; safe to run in CI.
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'
import { getCurated, curatedObjectiveIds } from '../src/data/ccnaCurated.js'
import { countObjectiveQuestions } from '../src/data/questionBankCount.js'
import { KB_COMPILED_OBJECTIVE_IDS } from '../src/data/kbCompiledPatches.js'
import { labsForObjective, allLabs } from '../src/data/ccnaLabs.js'
import { getLessonReference } from '../src/lesson/knowledgeReference.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'ai-improvement-logs')

function tierFor(row) {
  const { traps, flashcards, commands, questions, hasReading, hasLab, hasDiagram } = row
  if (traps >= 3 && flashcards >= 4 && commands >= 2 && questions >= 8) return 'A'
  if (hasReading && questions >= 6 && (traps >= 1 || commands >= 1)) return 'B'
  return 'C'
}

function passImpact(objectiveId) {
  const high = new Set(['1.6', '2.1', '2.2', '2.5', '3.1', '3.4', '4.1', '5.5', '5.8', '5.9', '6.1', '6.5', '6.6'])
  const med = new Set(['2.3', '2.4', '3.2', '3.3', '4.3', '5.3', '5.6'])
  if (high.has(objectiveId)) return 90
  if (med.has(objectiveId)) return 75
  return 60
}

/** Count quiz items for coverage (clean bank + skill; hand-curated when no clean file). */
function questionCountFor(objectiveId) {
  return countObjectiveQuestions(objectiveId)
}

/** Recursively collect files matching a predicate under a directory. */
function collectFiles(dir, predicate, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) collectFiles(full, predicate, acc)
    else if (predicate(entry.name, full)) acc.push(full)
  }
  return acc
}

/**
 * Real, file-based test/e2e/accessibility signals that back the mobile and
 * tests/CI score dimensions. No test execution — pure inventory, safe in CI.
 */
function qualitySignals() {
  const e2eDir = join(ROOT, 'e2e')
  const e2eSpecs = existsSync(e2eDir)
    ? readdirSync(e2eDir).filter(f => f.endsWith('.spec.js'))
    : []
  const mobileRe = /device|landscape|ipad|mobile|offline/i
  const mobileE2e = e2eSpecs.filter(f => mobileRe.test(f)).length
  const a11yE2e = e2eSpecs.some(f => /a11y|accessib/i.test(f))
  const unitTestFiles = collectFiles(join(ROOT, 'src'), name => /\.test\.(js|jsx)$/.test(name)).length
  return {
    e2eSpecCount: e2eSpecs.length,
    mobileE2eCount: mobileE2e,
    a11yE2e,
    unitTestFileCount: unitTestFiles,
  }
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const rows = ALL_OBJECTIVES.map(obj => {
    const id = obj.id
    const curated = getCurated(id)
    const ref = getLessonReference(id)
    const questions = questionCountFor(id)
    const traps = curated?.examTraps?.length || ref?.examTraps?.length || 0
    const flashcards = curated?.flashcards?.length || 0
    const commands = curated?.commands?.length || ref?.commands?.length || 0
    const hasReading = !!curated?.reading
    const hasLab = labsForObjective(id).length > 0
    const hasDiagram = !!(curated?.diagram || curated?.packetFlow?.steps?.length)
    const hasEngineerView = !!curated?.engineerView
    const handCurated = curatedObjectiveIds.has(id)
    const kbPatch = KB_COMPILED_OBJECTIVE_IDS.has(id)
    const row = {
      objectiveId: id,
      domainId: obj.domainId,
      title: obj.title,
      tier: null,
      traps,
      flashcards,
      commands,
      questions,
      hasReading,
      hasLab,
      hasDiagram,
      hasEngineerView,
      handCurated,
      kbPatch,
      passImpact: passImpact(id),
    }
    row.tier = tierFor(row)
    return row
  })

  const labs = allLabs()
  const summary = {
    generatedAt: new Date().toISOString(),
    totalObjectives: rows.length,
    tierCounts: {
      A: rows.filter(r => r.tier === 'A').length,
      B: rows.filter(r => r.tier === 'B').length,
      C: rows.filter(r => r.tier === 'C').length,
    },
    zeroTraps: rows.filter(r => r.traps === 0).map(r => r.objectiveId),
    zeroFlashcards: rows.filter(r => r.flashcards === 0).map(r => r.objectiveId),
    zeroCommands: rows.filter(r => r.commands === 0).map(r => r.objectiveId),
    noLab: rows.filter(r => !r.hasLab).map(r => r.objectiveId),
    lowQuestions: rows.filter(r => r.questions < 8).map(r => ({ id: r.objectiveId, count: r.questions })),
    trapAtFloor: rows.filter(r => r.traps <= 4).map(r => r.objectiveId),
    automation: rows.filter(r => r.domainId === 'automation'),
    wlanThin: rows.filter(r => ['5.8', '5.9'].includes(r.objectiveId)),
    labStats: {
      total: labs.length,
      interpretOnly: labs.filter(l => l.interpretOnly).length,
      config: labs.filter(l => !l.interpretOnly).length,
      troubleshoot: labs.filter(l => l.labType === 'troubleshooting').length,
    },
    quality: qualitySignals(),
  }

  writeFileSync(join(OUT_DIR, 'coverage-data.json'), JSON.stringify({ summary, rows }, null, 2))
  console.log(`✓ audit:coverage — ${rows.length} objectives → ai-improvement-logs/coverage-data.json`)
  console.log(`  Tier A: ${summary.tierCounts.A} · B: ${summary.tierCounts.B} · C: ${summary.tierCounts.C}`)
  console.log(`  Zero traps: ${summary.zeroTraps.length} · Zero flashcards: ${summary.zeroFlashcards.length}`)
  console.log(`  Labs: ${summary.labStats.total} (${summary.labStats.interpretOnly} interpret-only) · Trap floor: ${summary.trapAtFloor.length}`)
  console.log(`  Tests: ${summary.quality.unitTestFileCount} unit files · ${summary.quality.e2eSpecCount} e2e (${summary.quality.mobileE2eCount} mobile · a11y ${summary.quality.a11yE2e ? '✓' : '—'})`)
}

main()
