#!/usr/bin/env node
/**
 * Build-time coverage scanner — writes objective-level metrics to ai-improvement-logs/.
 * No runtime cost; safe to run in CI.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'
import { getCurated, getCuratedQuestions, curatedObjectiveIds } from '../src/data/ccnaCurated.js'
import { KB_COMPILED_OBJECTIVE_IDS } from '../src/data/kbCompiledPatches.js'
import { labsForObjective } from '../src/data/ccnaLabs.js'
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

function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const rows = ALL_OBJECTIVES.map(obj => {
    const id = obj.id
    const curated = getCurated(id)
    const ref = getLessonReference(id)
    const questions = getCuratedQuestions(id)
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
      questions: questions.length,
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
    automation: rows.filter(r => r.domainId === 'automation'),
    wlanThin: rows.filter(r => ['5.8', '5.9'].includes(r.objectiveId)),
  }

  writeFileSync(join(OUT_DIR, 'coverage-data.json'), JSON.stringify({ summary, rows }, null, 2))
  console.log(`✓ audit:coverage — ${rows.length} objectives → ai-improvement-logs/coverage-data.json`)
  console.log(`  Tier A: ${summary.tierCounts.A} · B: ${summary.tierCounts.B} · C: ${summary.tierCounts.C}`)
  console.log(`  Zero traps: ${summary.zeroTraps.length} · Zero flashcards: ${summary.zeroFlashcards.length}`)
}

main()
