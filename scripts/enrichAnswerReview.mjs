#!/usr/bin/env node
/**
 * Offline answerReview enrichment helper (Phase 2).
 *
 * Export batch JSON for ChatGPT/manual authoring, or merge reviews from an input file.
 * Does NOT call any API. Does NOT run during quiz runtime.
 *
 * Usage:
 *   node scripts/enrichAnswerReview.mjs export 4.3
 *   node scripts/enrichAnswerReview.mjs merge reviews-4.3.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCurated } from '../src/data/ccnaCurated.js'
import { isPlaceholderExplanation } from './lib/cleanBankUtils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_DIR = join(ROOT, 'data', 'clean-question-bank')
const OUT_DIR = join(ROOT, 'data', 'enrichment-queue')

function loadObjective(objectiveId) {
  for (const domainNum of [2, 3, 4, 5, 6]) {
    const path = join(CLEAN_DIR, `domain-${domainNum}`, `${objectiveId}.json`)
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8'))
  }
  throw new Error(`Missing clean bank for ${objectiveId}. Run build:clean-bank first.`)
}

function saveObjective(objectiveId, data) {
  for (const domainNum of [2, 3, 4, 5, 6]) {
    const path = join(CLEAN_DIR, `domain-${domainNum}`, `${objectiveId}.json`)
    if (existsSync(path)) {
      writeFileSync(path, JSON.stringify(data, null, 2))
      return
    }
  }
  throw new Error(`Cannot save — no file for ${objectiveId}`)
}

function exportBatch(objectiveId) {
  mkdirSync(OUT_DIR, { recursive: true })
  const data = loadObjective(objectiveId)
  const curated = getCurated(objectiveId)
  const batch = (data.questions || [])
    .filter(q => !q.answerReview && (q.needsExplanationReview || isPlaceholderExplanation(q.explanation)))
    .map(q => ({
      objectiveId,
      questionId: q.id,
      type: q.type,
      difficulty: q.difficulty,
      concept: q.concept,
      ckuIds: q.ckuIds || [],
      question: q.question,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      ckuContext: curated?.reading?.definition || null,
    }))

  const outPath = join(OUT_DIR, `export-${objectiveId}.json`)
  writeFileSync(outPath, JSON.stringify(batch, null, 2))
  console.log(`✓ Exported ${batch.length} question(s) for offline review → ${outPath}`)
}

function mergeReviews(inputPath) {
  const reviews = JSON.parse(readFileSync(inputPath, 'utf-8'))
  const items = Array.isArray(reviews) ? reviews : [reviews]
  const byObjective = {}

  for (const item of items) {
    if (item.status && item.status !== 'OK') {
      console.log(`  skip ${item.questionId}: ${item.status}`)
      continue
    }
    if (!item.questionId || !item.answerReview) {
      console.warn('  skip invalid item (need questionId + answerReview)')
      continue
    }
    const oid = item.objectiveId || item.questionId.split('-')[0]
    ;(byObjective[oid] ||= {})[item.questionId] = item.answerReview
  }

  let merged = 0
  for (const [objectiveId, map] of Object.entries(byObjective)) {
    const data = loadObjective(objectiveId)
    for (const q of data.questions) {
      if (map[q.id]) {
        q.answerReview = map[q.id]
        delete q.needsExplanationReview
        merged++
      }
    }
    saveObjective(objectiveId, data)
    console.log(`  ${objectiveId}: merged ${Object.keys(map).length} review(s)`)
  }
  console.log(`✓ Merged ${merged} answerReview block(s)`)
}

function main() {
  const [,, cmd, arg] = process.argv
  if (!cmd) {
    console.log('Usage: enrichAnswerReview.mjs export <objectiveId> | merge <reviews.json>')
    process.exit(1)
  }

  if (cmd === 'export') {
    if (!arg) throw new Error('export requires objectiveId (e.g. 4.3)')
    exportBatch(arg)
    return
  }
  if (cmd === 'merge') {
    if (!arg) throw new Error('merge requires path to reviews JSON')
    mergeReviews(join(process.cwd(), arg))
    return
  }
  throw new Error(`Unknown command: ${cmd}`)
}

main()
