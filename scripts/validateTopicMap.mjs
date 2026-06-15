#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { TOPIC_MAP, ALL_OBJECTIVE_IDS } from './lib/onenoteTopicMap.mjs'
import { ROOT, resolveImportDir } from './lib/onenoteUtils.mjs'

const src = resolveImportDir()
const errors = []
const warnings = []

if (!existsSync(src)) {
  console.error('✗ No OneNote source directory')
  process.exit(1)
}

const files = readdirSync(src).filter(f => f.endsWith('.md') && !f.startsWith('00 -'))

for (const f of files) {
  if (!TOPIC_MAP[f]) errors.push(`unmapped file: ${f}`)
}

for (const f of Object.keys(TOPIC_MAP)) {
  if (f.startsWith('00 -')) continue
  if (!files.includes(f)) warnings.push(`topic-map entry missing file: ${f}`)
}

const covered = new Set()
for (const meta of Object.values(TOPIC_MAP)) {
  for (const id of meta.objectiveIds || []) {
    if (/^[1-6]\.[0-9]+$/.test(id)) covered.add(id)
  }
}
const uncovered = ALL_OBJECTIVE_IDS.filter(id => !covered.has(id))
if (uncovered.length) warnings.push(`objectives not in topic-map: ${uncovered.join(', ')}`)

if (warnings.length) {
  console.log(`validate:topic-map warnings (${warnings.length}):`)
  warnings.slice(0, 10).forEach(w => console.log('  ⚠', w))
}

if (errors.length) {
  console.error(`✗ validate:topic-map failed (${errors.length}):`)
  errors.forEach(e => console.error('  -', e))
  process.exit(1)
}

console.log(`✓ validate:topic-map OK — ${files.length} files mapped`)
