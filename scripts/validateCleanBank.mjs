#!/usr/bin/env node
/**
 * Validate all clean question bank domains.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCleanQuestion } from './lib/cleanBankUtils.mjs'
import { DOMAIN_META, DOMAIN_1_OBJECTIVES, EXTRA_CLEAN_OBJECTIVES } from './lib/sourceBankConfig.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')

function validateObjectiveFile(errors, objectiveId, path) {
  if (!existsSync(path)) {
    errors.push(`missing ${objectiveId}.json at ${path}`)
    return 0
  }
  const { questions } = JSON.parse(readFileSync(path, 'utf-8'))
  const ids = new Set()
  let count = 0
  for (const q of questions || []) {
    count++
    if (q.id && ids.has(q.id)) errors.push(`${objectiveId}: duplicate ${q.id}`)
    if (q.id) ids.add(q.id)
    errors.push(...validateCleanQuestion(q, objectiveId))
    if (!q.answerReview) errors.push(`${objectiveId}/${q.id}: missing answerReview`)
  }
  return count
}

function main() {
  const errors = []
  let total = 0
  const validated = new Set()

  for (const objectiveId of DOMAIN_1_OBJECTIVES) {
    validated.add(objectiveId)
    total += validateObjectiveFile(errors, objectiveId, join(CLEAN_ROOT, 'domain-1', `${objectiveId}.json`))
  }

  for (const [domainNum, meta] of Object.entries(DOMAIN_META)) {
    const dir = join(CLEAN_ROOT, `domain-${domainNum}`)
    if (!existsSync(dir)) {
      errors.push(`missing domain-${domainNum}`)
      continue
    }
    for (const objectiveId of meta.objectives) {
      validated.add(objectiveId)
      total += validateObjectiveFile(errors, objectiveId, join(dir, `${objectiveId}.json`))
    }
  }

  for (const { objectiveId, domain } of EXTRA_CLEAN_OBJECTIVES) {
    if (validated.has(objectiveId)) continue
    validated.add(objectiveId)
    total += validateObjectiveFile(errors, objectiveId, join(CLEAN_ROOT, `domain-${domain}`, `${objectiveId}.json`))
  }

  if (errors.length) {
    console.error(`✗ Validation failed (${errors.length} issues):`)
    errors.slice(0, 50).forEach(e => console.error('  -', e))
    if (errors.length > 50) console.error(`  … and ${errors.length - 50} more`)
    process.exit(1)
  }
  console.log(`✓ Clean bank valid — ${total} questions across domains 1–6`)
}

main()
