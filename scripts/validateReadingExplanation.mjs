#!/usr/bin/env node
/**
 * Validates pilot Explanation section content (short tiers + bigTakeaway).
 * Run: npm run validate:reading-explanation
 */
import { getCurated } from '../src/data/ccnaCurated.js'
import { EXPLANATION_PILOT_IDS, validateReadingExplanation } from '../src/lesson/explanationFormat.js'

const errors = []
for (const id of [...EXPLANATION_PILOT_IDS].sort()) {
  const curated = getCurated(id)
  if (!curated?.reading) {
    errors.push(`${id}: no curated reading`)
    continue
  }
  errors.push(...validateReadingExplanation(curated.reading, id, { pilotOnly: false }))
}

if (errors.length) {
  console.error('validate:reading-explanation FAILED\n')
  errors.forEach(e => console.error(`  • ${e}`))
  process.exit(1)
}

console.log(`validate:reading-explanation OK — ${EXPLANATION_PILOT_IDS.size} pilot objectives`)
process.exit(0)
