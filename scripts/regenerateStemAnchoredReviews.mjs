#!/usr/bin/env node
/** Rebuild stem-anchored answerReview on all clean-bank JSON, then recompile runtime module. */
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { applyAnswerReviewToQuestion } from '../src/answerReviewLogic.js'
import { loadGoldAnswerReviews } from '../src/answerReview/goldAnswerReviews.js'
import { loadStemAnchoredTemplates } from '../src/answerReview/stemAnchoredDistractor.js'

// Gold reviews load on demand in the browser; scripts must install them
// explicitly or they validate/generate against a chain missing its top tier.
await loadGoldAnswerReviews()
await loadStemAnchoredTemplates()

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')

function walkJsonFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walkJsonFiles(p, out)
    else if (name.endsWith('.json') && name !== 'manifest.json') out.push(p)
  }
  return out
}

let files = 0
let questions = 0

for (const path of walkJsonFiles(CLEAN_ROOT)) {
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  if (!Array.isArray(data.questions)) continue
  data.questions = data.questions.map(q => applyAnswerReviewToQuestion(q))
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
  files++
  questions += data.questions.length
}

console.log(`✓ Regenerated stem-anchored answerReview on ${questions} questions in ${files} files`)

const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'compileCleanQuestionsModule.mjs')], { stdio: 'inherit' })
process.exit(r.status ?? 1)
