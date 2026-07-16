#!/usr/bin/env node
/**
 * Retention-prose floor check for every curated objective (Lesson ↔ Bank Alignment 99, section 3.2).
 * Inventory only — does not rewrite content. See ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md.
 *
 * Run: node scripts/validateLessonProse.mjs [--strict] [--json]
 *   --strict  exit 1 if any objective is thinProse (default: exit 0, print summary only)
 *   --json    print machine-readable JSON instead of the human table
 */
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'
import { getCurated } from '../src/data/ccnaCurated.js'
import { scoreLessonRetentionProse } from '../src/lesson/lessonAlignmentProse.js'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const asJson = args.includes('--json')

const rows = []

for (const objective of ALL_OBJECTIVES) {
  const id = objective.id
  const curated = getCurated(id)
  if (!curated?.reading) {
    rows.push({ id, status: 'NO_READING', thinProse: true, failingFloors: ['noReading'], draftHits: [] })
    continue
  }

  const result = scoreLessonRetentionProse({
    reading: curated.reading,
    examTraps: curated.examTraps,
    engineerView: curated.engineerView,
  })

  const failingFloors = [
    !result.details.bigTakeaway.ok && 'bigTakeaway',
    !result.plainEnglishOk && 'plainEnglish',
    !result.howItWorksOk && 'howItWorks',
    !result.examCueOk && 'examCue',
    !result.rememberOk && 'remember',
    !result.dontConfuseOk && 'dontConfuse',
  ].filter(Boolean)

  rows.push({
    id,
    status: result.thinProse ? 'THIN_PROSE' : 'PASS',
    thinProse: result.thinProse,
    failingFloors,
    draftHits: result.draftHits,
  })
}

const thinRows = rows.filter(r => r.thinProse)
const passCount = rows.length - thinRows.length

if (asJson) {
  console.log(JSON.stringify({ total: rows.length, pass: passCount, thin: thinRows.length, rows }, null, 2))
} else {
  console.log(`validate:lesson-prose — ${rows.length} objectives (${passCount} pass, ${thinRows.length} thin)\n`)
  if (thinRows.length) {
    console.log('THIN_PROSE / NO_READING:')
    for (const row of thinRows) {
      const floorNote = row.failingFloors.length ? ` floors=[${row.failingFloors.join(', ')}]` : ''
      const draftNote = row.draftHits.length ? ` draftHits=[${row.draftHits.join(', ')}]` : ''
      console.log(`  • ${row.id} (${row.status})${floorNote}${draftNote}`)
    }
    console.log('')
  }
}

if (strict && thinRows.length) {
  console.error(`validate:lesson-prose FAILED (--strict) — ${thinRows.length} objective(s) thin`)
  process.exit(1)
}

console.log(`validate:lesson-prose OK — ${passCount}/${rows.length} pass${strict ? '' : ' (non-strict: informational only)'}`)
process.exit(0)
