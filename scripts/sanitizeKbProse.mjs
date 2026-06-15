#!/usr/bin/env node
/** Sanitize normalized OneNote JSON — strip markdown, fix prose, prep for merge. */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ONENOTE_NORMALIZED } from './lib/onenoteUtils.mjs'
import {
  stripMarkdown,
  sanitizeBulletList,
  firstProseSentence,
  dedupeJoin,
  applyFactFixes,
} from './lib/voiceProse.mjs'

function sanitizeRecord(rec) {
  const keyPoints = sanitizeBulletList(rec.keyPoints || [])
  const learningOutcomes = sanitizeBulletList(rec.learningOutcomes || [])
  const operatorSummary = firstProseSentence(rec.operatorSummary)
    || dedupeJoin(learningOutcomes.slice(0, 2), 480)
    || dedupeJoin(keyPoints.slice(0, 2), 480)

  const examTraps = (rec.examTraps || []).map(t => ({
    trap: stripMarkdown(t.trap || ''),
    correction: stripMarkdown(t.correction || t.trap || ''),
  })).filter(t => t.trap.length > 8)

  return {
    ...rec,
    operatorSummary: applyFactFixes(operatorSummary),
    keyPoints,
    learningOutcomes,
    examTraps,
    voiceSanitized: true,
  }
}

function main() {
  if (!existsSync(ONENOTE_NORMALIZED)) {
    console.error('✗ No normalized data. Run: npm run onenote:import')
    process.exit(1)
  }
  const files = readdirSync(ONENOTE_NORMALIZED).filter(f => f.endsWith('.json'))
  let n = 0
  for (const f of files) {
    const path = join(ONENOTE_NORMALIZED, f)
    const rec = JSON.parse(readFileSync(path, 'utf8'))
    writeFileSync(path, JSON.stringify(sanitizeRecord(rec), null, 2))
    n++
  }
  console.log(`✓ Sanitized voice prose on ${n} normalized lessons`)
}

main()
