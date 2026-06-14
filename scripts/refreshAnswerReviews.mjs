#!/usr/bin/env node
/** Rebuild answerReview on all clean-bank JSON files, then recompile runtime module. */
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyAnswerReviewToQuestion } from '../src/answerReviewLogic.js'

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

console.log(`✓ Refreshed answerReview on ${questions} questions in ${files} files`)

import { spawnSync } from 'node:child_process'
const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'compileCleanQuestionsModule.mjs')], { stdio: 'inherit' })
process.exit(r.status ?? 1)
