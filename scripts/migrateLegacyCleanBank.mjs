#!/usr/bin/env node
/**
 * Migrate legacy ccnaQuestionImports objectives into clean-question-bank.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMPORTED_QUESTIONS } from '../src/data/ccnaQuestionImports.js'
import { SCHEMA_VERSION, cleanAppQuestion } from './lib/cleanBankUtils.mjs'
import { applyAnswerReviewToQuestion } from './lib/generateAnswerReview.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')

const LEGACY_MIGRATIONS = [
  { objectiveId: '3.6', domain: 3 },
  { objectiveId: '4.10', domain: 4 },
  { objectiveId: '5.4', domain: 5 },
  { objectiveId: '5.11', domain: 5 },
]

function main() {
  for (const { objectiveId, domain } of LEGACY_MIGRATIONS) {
    const imported = IMPORTED_QUESTIONS[objectiveId] || []
    if (!imported.length) {
      console.warn(`  skip ${objectiveId}: no imported questions`)
      continue
    }
    const questions = imported.map((q, i) => {
      const base = cleanAppQuestion({
        ...q,
        id: q.id || `${objectiveId}-legacy-q${String(i + 1).padStart(3, '0')}`,
      }, objectiveId)
      return applyAnswerReviewToQuestion(base)
    })
    const dir = join(CLEAN_ROOT, `domain-${domain}`)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${objectiveId}.json`), JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      objectiveId,
      domain,
      builtAt: new Date().toISOString(),
      source: 'legacy-import-migration',
      questions,
    }, null, 2))
    console.log(`  ${objectiveId}: ${questions.length} questions → domain-${domain}`)
  }
  console.log('✓ Legacy objectives migrated to clean bank')
}

main()
