#!/usr/bin/env node
/** Regenerate answer reviews and strip template/markdown voice from clean bank. */
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { applyAnswerReviewToQuestion } from '../src/answerReviewLogic.js'
import { sanitizeAnswerText } from './lib/voiceProse.mjs'

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

function polishQuestion(q) {
  let next = applyAnswerReviewToQuestion(q)
  if (next.explanation) next.explanation = sanitizeAnswerText(next.explanation)
  if (next.answerReview) {
    if (next.answerReview.correct?.explanation) {
      next.answerReview.correct.explanation = sanitizeAnswerText(next.answerReview.correct.explanation)
    }
    if (next.answerReview.examTip) {
      next.answerReview.examTip = sanitizeAnswerText(next.answerReview.examTip)
    }
    next.answerReview.incorrect = (next.answerReview.incorrect || []).map(item => ({
      ...item,
      explanation: sanitizeAnswerText(item.explanation),
    }))
  }
  return next
}

let files = 0
let questions = 0

for (const path of walkJsonFiles(CLEAN_ROOT)) {
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  if (!Array.isArray(data.questions)) continue
  data.questions = data.questions.map(polishQuestion)
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
  files++
  questions += data.questions.length
}

console.log(`✓ Regenerated answer voice on ${questions} questions in ${files} files`)

const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'compileCleanQuestionsModule.mjs')], { stdio: 'inherit' })
process.exit(r.status ?? 1)
