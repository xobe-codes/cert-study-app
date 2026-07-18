#!/usr/bin/env node
/** Validate blueprint-adjacent wave patches stay greppable and mapped. */
import { BLUEPRINT_ADJACENT_WAVE1_PATCHES } from '../src/data/blueprintAdjacentWave1Patches.js'
import { BLUEPRINT_ADJACENT_WAVE2_PATCHES } from '../src/data/blueprintAdjacentWave2Patches.js'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'

const ID_RE = /^\d+\.\d+-ba\d*-[tfq]\d+$/
const MARKER = /Blueprint-adjacent/i
const objectiveIds = new Set(ALL_OBJECTIVES.map(o => o.id))
const errors = []
const waves = [
  ['Wave 1', BLUEPRINT_ADJACENT_WAVE1_PATCHES],
  ['Wave 2', BLUEPRINT_ADJACENT_WAVE2_PATCHES],
]
const seenIds = new Set()

for (const [waveName, wave] of waves) {
  for (const [objectiveId, patch] of Object.entries(wave)) {
    if (!objectiveIds.has(objectiveId)) {
      errors.push(`${waveName}/${objectiveId}: not in ALL_OBJECTIVES`)
      continue
    }
    const hasContent = Boolean(
      patch.reading?.related?.length
      || patch.reading?.keyPoints?.length
      || patch.reading?.commonMistakes?.length
      || patch.examTraps?.length
      || patch.flashcards?.length
      || patch.questions?.length,
    )
    if (!hasContent) errors.push(`${waveName}/${objectiveId}: empty adjacent patch`)

    for (const listName of ['examTraps', 'flashcards', 'questions']) {
      for (const item of patch[listName] || []) {
        if (!ID_RE.test(item.id || '')) {
          errors.push(`${waveName}/${objectiveId}: bad id ${item.id}`)
        }
        if (seenIds.has(item.id)) errors.push(`${waveName}/${objectiveId}: duplicate id ${item.id}`)
        seenIds.add(item.id)
        const blob = JSON.stringify(item)
        if (listName !== 'questions' && !MARKER.test(blob) && !MARKER.test(JSON.stringify(patch.reading || {}))) {
          // questions may omit the phrase if explanation is clear; traps/cards should mark adjacent
          if (listName === 'examTraps' || listName === 'flashcards') {
            if (!MARKER.test(blob)) errors.push(`${waveName}/${objectiveId}/${item.id}: missing Blueprint-adjacent marker`)
          }
        }
      }
    }

    const related = patch.reading?.related || []
    for (const line of related) {
      if (!MARKER.test(line)) errors.push(`${waveName}/${objectiveId}: related bullet missing Blueprint-adjacent marker`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

const objectives = new Set(waves.flatMap(([, wave]) => Object.keys(wave))).size
const questions = waves.reduce(
  (total, [, wave]) => total + Object.values(wave).reduce((n, p) => n + (p.questions?.length || 0), 0),
  0,
)
console.log(`validate:blueprint-adjacent OK — ${waves.length} waves, ${objectives} objectives, ${questions} adjacent questions`)
