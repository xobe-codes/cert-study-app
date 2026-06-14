#!/usr/bin/env node
/**
 * Migrate Domain 1 hand-curated questions into clean-question-bank/domain-1/.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCurated } from '../src/data/ccnaCurated.js'
import { SCHEMA_VERSION, cleanAppQuestion } from './lib/cleanBankUtils.mjs'
import { applyAnswerReviewToQuestion } from './lib/generateAnswerReview.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'data', 'clean-question-bank', 'domain-1')

const DOMAIN_1_OBJECTIVES = [
  '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12',
]

function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    domain: '1',
    domainName: 'Network Fundamentals',
    builtAt: new Date().toISOString(),
    objectives: {},
    totals: { active: 0, shelved: 0 },
  }

  for (const objectiveId of DOMAIN_1_OBJECTIVES) {
    const curated = getCurated(objectiveId)
    const raw = (curated?.questions || []).map(q => cleanAppQuestion(q, objectiveId))
    const questions = raw.map(q => applyAnswerReviewToQuestion(q))
    writeFileSync(join(OUT_DIR, `${objectiveId}.json`), JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      objectiveId,
      domain: 1,
      builtAt: manifest.builtAt,
      questions,
    }, null, 2))
    manifest.objectives[objectiveId] = { active: questions.length, shelved: 0 }
    manifest.totals.active += questions.length
    console.log(`  ${objectiveId}: ${questions.length} questions`)
  }

  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`✓ Domain 1: ${manifest.totals.active} active questions`)
}

main()
