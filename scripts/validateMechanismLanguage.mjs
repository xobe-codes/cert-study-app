#!/usr/bin/env node
/** Fail CI when distractor debriefs use banned mechanism-template language. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isBannedMechanismLanguage } from '../src/answerReview/answerReviewQuality.js'
import { applyAnswerReviewToQuestion } from '../src/answerReviewLogic.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')

const FIELDS = ['explanation', 'whatItDoes', 'whyWrongHere']

function walkJsonFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walkJsonFiles(p, out)
    else if (name.endsWith('.json') && name !== 'manifest.json') out.push(p)
  }
  return out
}

function scanIncorrect(incorrect, ctx) {
  const issues = []
  for (const item of incorrect || []) {
    for (const field of FIELDS) {
      const text = item[field]
      if (text && isBannedMechanismLanguage(text)) {
        issues.push(`${ctx} choice ${item.choiceIndex} ${field}`)
      }
    }
  }
  return issues
}

const errors = []
let staticChecked = 0
let runtimeChecked = 0
const questions = []

for (const path of walkJsonFiles(CLEAN_ROOT)) {
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const rel = path.replace(`${ROOT}/`, '')
  for (const q of data.questions || []) {
    staticChecked++
    questions.push({ q, rel })
    const qid = q.id || 'no-id'
    errors.push(...scanIncorrect(q.answerReview?.incorrect, `${rel} ${qid}`).map(s => `static: ${s}`))
  }
}

for (const { q, rel } of questions) {
  runtimeChecked++
  const enriched = applyAnswerReviewToQuestion(q)
  const qid = enriched.id || q.id || 'no-id'
  errors.push(...scanIncorrect(enriched.answerReview?.incorrect, `${rel} ${qid} runtime`).map(s => `runtime: ${s}`))
}

if (errors.length) {
  console.error(`✗ Mechanism language validation failed (${errors.length} issues on ${staticChecked} static / ${runtimeChecked} runtime checks):`)
  errors.slice(0, 40).forEach(e => console.error('  -', e))
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`)
  process.exit(1)
}

console.log(`✓ Mechanism language OK — ${staticChecked} static + ${runtimeChecked} runtime checks`)
process.exit(0)
