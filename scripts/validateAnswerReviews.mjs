#!/usr/bin/env node
/** Validate answerReview quality across clean question bank. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateQuestionAnswerReview, isFallbackExplanation, isGenericExamTip } from '../src/answerReview/answerReviewQuality.js'

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

const errors = []
let total = 0
let fallback = 0
let genericTips = 0

for (const path of walkJsonFiles(CLEAN_ROOT)) {
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const q of data.questions || []) {
    total++
    for (const item of q.answerReview?.incorrect || []) {
      if (isFallbackExplanation(item.explanation)) fallback++
    }
    if (isGenericExamTip(q.answerReview?.examTip)) genericTips++
    errors.push(...validateQuestionAnswerReview(q).map(e => `${path.replace(`${ROOT}/`, '')}: ${e}`))
  }
}

if (errors.length) {
  console.error(`✗ Answer review validation failed (${errors.length} issues, ${fallback} fallback slots, ${genericTips} generic tips):`)
  errors.slice(0, 40).forEach(e => console.error('  -', e))
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`)
  process.exit(1)
}

console.log(`✓ Answer reviews valid — ${total} questions, 0 fallback explanations, 0 generic exam tips`)
