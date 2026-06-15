#!/usr/bin/env node
/** Check answer-review language against KB lexicon + banned phrases. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isFallbackExplanation } from '../src/answerReview/answerReviewQuality.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LEXICON = join(ROOT, 'data', 'onenote', 'lexicon.json')
const CKUS = join(ROOT, 'data', 'knowledge-base', 'ckus.json')
const CLEAN = join(ROOT, 'data', 'clean-question-bank')

const lexicon = existsSync(LEXICON) ? JSON.parse(readFileSync(LEXICON, 'utf8')) : { banned: [] }
const ckus = existsSync(CKUS) ? JSON.parse(readFileSync(CKUS, 'utf8')) : []
const ckuById = new Map(ckus.map(c => [c.ckuId, c]))

function walkJson(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walkJson(p, out)
    else if (name.endsWith('.json') && name !== 'manifest.json') out.push(p)
  }
  return out
}

function bannedHit(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  return (lexicon.banned || []).find(b => lower.includes(b.toLowerCase()))
}

const warnings = []
let checked = 0

for (const path of walkJson(CLEAN)) {
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const q of data.questions || []) {
    checked++
    const texts = [
      q.explanation,
      q.answerReview?.correct?.explanation,
      q.answerReview?.examTip,
      ...(q.answerReview?.incorrect || []).map(i => i.explanation),
    ].filter(Boolean)

    for (const t of texts) {
      const ban = bannedHit(t)
      if (ban) warnings.push(`${q.id}: banned phrase "${ban}"`)
      if (isFallbackExplanation(t)) warnings.push(`${q.id}: fallback/template explanation`)
    }

    const ckuIds = q.ckuIds || []
    if (ckuIds.length) {
      const terms = ckuIds.flatMap(id => {
        const c = ckuById.get(id)
        return [c?.title, ...(c?.keyTerms || [])].filter(Boolean)
      })
      const combined = texts.join(' ').toLowerCase()
      const hit = terms.some(term => combined.includes(String(term).toLowerCase().slice(0, 8)))
      if (!hit && terms.length) warnings.push(`${q.id}: answer text may not match CKU vocabulary`)
    }
  }
}

if (warnings.length > 50) {
  console.log(`validate:answer-voice warnings (${warnings.length}, showing 20):`)
  warnings.slice(0, 20).forEach(w => console.log('  ⚠', w))
} else if (warnings.length) {
  console.log(`validate:answer-voice warnings (${warnings.length}):`)
  warnings.forEach(w => console.log('  ⚠', w))
}

console.log(`✓ validate:answer-voice OK — ${checked} questions checked (${warnings.length} warnings)`)
