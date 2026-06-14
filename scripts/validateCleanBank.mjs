#!/usr/bin/env node
/**
 * Validate clean question bank — leak scan, schema, exhibit exclusion.
 * CI-safe: validates only, does not generate content.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMAIN_4_OBJECTIVES, validateCleanQuestion } from './lib/cleanBankUtils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_DIR = join(ROOT, 'data', 'clean-question-bank', 'domain-4')

function main() {
  const errors = []
  let total = 0

  if (!existsSync(CLEAN_DIR)) {
    console.error('✗ Clean bank not built. Run: npm run build:clean-bank')
    process.exit(1)
  }

  const manifestPath = join(ROOT, 'data', 'clean-question-bank', 'manifest.json')
  if (!existsSync(manifestPath)) {
    errors.push('missing manifest.json')
  }

  for (const objectiveId of DOMAIN_4_OBJECTIVES) {
    const path = join(CLEAN_DIR, `${objectiveId}.json`)
    if (!existsSync(path)) {
      errors.push(`missing clean file for ${objectiveId}`)
      continue
    }
    const { questions } = JSON.parse(readFileSync(path, 'utf-8'))
    if (!Array.isArray(questions) || questions.length === 0) {
      errors.push(`${objectiveId}: empty questions array`)
    }
    const ids = new Set()
    for (const q of questions || []) {
      total++
      if (q.id && ids.has(q.id)) errors.push(`${objectiveId}: duplicate id ${q.id}`)
      if (q.id) ids.add(q.id)
      errors.push(...validateCleanQuestion(q, objectiveId))
    }
  }

  if (errors.length) {
    console.error(`✗ Clean bank validation failed (${errors.length} issue(s)):`)
    errors.forEach(e => console.error('  -', e))
    process.exit(1)
  }

  console.log(`✓ Clean bank valid — ${total} active Domain 4 questions`)
}

main()
