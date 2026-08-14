#!/usr/bin/env node
/**
 * Migrate hand-curated objectives (e.g. 2.1, 2.2) into clean-question-bank.
 * Usage: node scripts/buildCuratedCleanBank.mjs [objectiveIds...]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCurated } from '../src/data/ccnaCurated.js'
import { SCHEMA_VERSION, cleanAppQuestion } from './lib/cleanBankUtils.mjs'
import { applyAnswerReviewToQuestion } from './lib/generateAnswerReview.mjs'
import { loadGoldAnswerReviews } from '../src/answerReview/goldAnswerReviews.js'
import { loadStemAnchoredTemplates } from '../src/answerReview/stemAnchoredDistractor.js'

// Gold reviews load on demand in the browser; scripts must install them
// explicitly or they validate/generate against a chain missing its top tier.
await loadGoldAnswerReviews()
await loadStemAnchoredTemplates()

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')

const DOMAIN_FOR = {
  '2.1': 2, '2.2': 2,
}

const DEFAULT_IDS = ['2.1', '2.2']
const ids = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_IDS

function main() {
  for (const objectiveId of ids) {
    const domain = DOMAIN_FOR[objectiveId]
    if (!domain) {
      console.warn(`  skip ${objectiveId}: unknown domain mapping`)
      continue
    }
    const curated = getCurated(objectiveId)
    const raw = (curated?.questions || []).map(q => cleanAppQuestion(q, objectiveId))
    const questions = raw.map(q => applyAnswerReviewToQuestion(q))
    const dir = join(CLEAN_ROOT, `domain-${domain}`)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${objectiveId}.json`), JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      objectiveId,
      domain,
      builtAt: new Date().toISOString(),
      questions,
    }, null, 2))
    console.log(`  ${objectiveId}: ${questions.length} questions → domain-${domain}`)
  }
  console.log('✓ Curated objectives written to clean bank')
}

main()
