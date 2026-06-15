#!/usr/bin/env node
/** Warn when objectives lack OneNote-sourced KB readings. */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ALL_OBJECTIVE_IDS, OBJECTIVE_GAPS } from './lib/onenoteTopicMap.mjs'
import { ROOT } from './lib/onenoteUtils.mjs'

const COMPILED = join(ROOT, 'data', 'onenote', 'compiled', 'objective-readings.json')
const errors = []
const warnings = []

if (!existsSync(COMPILED)) {
  console.error('✗ validate:content-depth — run onenote pipeline first')
  process.exit(1)
}

const readings = JSON.parse(readFileSync(COMPILED, 'utf8'))

for (const id of ALL_OBJECTIVE_IDS) {
  const r = readings[id]
  if (!r) {
    if (!OBJECTIVE_GAPS.includes(id)) warnings.push(`${id}: no OneNote reading`)
    continue
  }
  if (!r.bigTakeaway?.trim()) errors.push(`${id}: missing bigTakeaway`)
  if ((r.examTraps || []).length < 1 && !OBJECTIVE_GAPS.includes(id)) {
    warnings.push(`${id}: fewer than 1 exam trap from OneNote`)
  }
}

if (warnings.length) {
  console.log(`validate:content-depth warnings (${warnings.length}):`)
  warnings.slice(0, 15).forEach(w => console.log('  ⚠', w))
}

if (errors.length) {
  console.error('✗ validate:content-depth failed:')
  errors.forEach(e => console.error('  -', e))
  process.exit(1)
}

const gold = Object.values(readings).filter(r => r.confidence === 'gold').length
console.log(`✓ validate:content-depth OK — ${Object.keys(readings).length} readings (${gold} gold)`)
