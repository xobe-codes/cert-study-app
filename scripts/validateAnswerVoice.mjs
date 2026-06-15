#!/usr/bin/env node
/** Strict answer-review voice validation. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isFallbackExplanation } from '../src/answerReview/answerReviewQuality.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN = join(ROOT, 'data', 'clean-question-bank')

function walkJson(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walkJson(p, out)
    else if (name.endsWith('.json') && name !== 'manifest.json') out.push(p)
  }
  return out
}

const errors = []
let checked = 0

for (const path of walkJson(CLEAN)) {
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const q of data.questions || []) {
    checked++
    const texts = [
      ['explanation', q.explanation],
      ['correct', q.answerReview?.correct?.explanation],
      ['examTip', q.answerReview?.examTip],
      ...(q.answerReview?.incorrect || []).map((i, idx) => [`incorrect.${idx}`, i.explanation]),
    ].filter(([, t]) => t)

    for (const [where, t] of texts) {
      if (/\*\*/.test(t)) errors.push(`${q.id}: ${where} has markdown bold`)
      if (/does not answer .+ in this stem/i.test(t)) errors.push(`${q.id}: ${where} uses stem template`)
      if (isFallbackExplanation(t)) errors.push(`${q.id}: ${where} fallback/template`)
    }
  }
}

if (errors.length) {
  console.error(`✗ validate:answer-voice failed (${errors.length} on ${checked} questions):`)
  errors.slice(0, 40).forEach(e => console.error('  -', e))
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`)
  process.exit(1)
}

console.log(`✓ validate:answer-voice OK — ${checked} questions`)
process.exit(0)
