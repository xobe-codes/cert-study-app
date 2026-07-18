#!/usr/bin/env node
/**
 * Deterministic full-backlog backfill for src/answerReview/regeneratedExplanations.json.
 *
 * Loads clean-bank questions, applies applyAnswerReviewToQuestion (runtime learner-visible
 * reviews), and adds missing question IDs only — never overwrites existing authored entries.
 *
 * Usage:
 *   node scripts/backfillRegenFromRuntimeReviews.mjs --dry-run
 *   node scripts/backfillRegenFromRuntimeReviews.mjs
 *
 * No network / no LLM. Throws without writing if any mapped entry fails validation.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyAnswerReviewToQuestion } from '../src/answerReviewLogic.js'
import {
  buildRegenBlockFromApplied,
  validateRegenQuestionBlock,
  wrongChoiceIndexes,
} from './lib/backfillRegenMapper.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const REGEN_PATH = join(ROOT, 'src', 'answerReview', 'regeneratedExplanations.json')

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run')
  const unknown = argv.filter(a => a.startsWith('-') && a !== '--dry-run')
  if (unknown.length) {
    throw new Error(`Unknown flag(s): ${unknown.join(', ')} (supported: --dry-run)`)
  }
  return { dryRun }
}

/** Numeric objective sort: 1.2.json before 1.10.json. */
function objectiveFileSort(a, b) {
  const parse = name => {
    const m = String(name).match(/^(\d+)\.(\d+)/)
    return m ? [Number(m[1]), Number(m[2])] : [Infinity, Infinity]
  }
  const [ad, ao] = parse(a)
  const [bd, bo] = parse(b)
  return ad - bd || ao - bo || a.localeCompare(b)
}

/**
 * Deterministic clean-bank walk: domain-1…6, objective files numeric-sorted,
 * questions in file array order. Skips manifest.json.
 */
export function loadCleanQuestionsInOrder(cleanRoot = CLEAN_ROOT) {
  const questions = []
  if (!existsSync(cleanRoot)) {
    throw new Error(`Missing clean bank root: ${cleanRoot}`)
  }
  for (let domain = 1; domain <= 6; domain++) {
    const dir = join(cleanRoot, `domain-${domain}`)
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue
    const files = readdirSync(dir)
      .filter(name => name.endsWith('.json') && name !== 'manifest.json')
      .sort(objectiveFileSort)
    for (const name of files) {
      const path = join(dir, name)
      const data = JSON.parse(readFileSync(path, 'utf8'))
      for (const q of data.questions || []) {
        if (!q?.id) throw new Error(`${path}: question missing id`)
        questions.push(q)
      }
    }
  }
  return questions
}

function writeJsonAtomic(path, data) {
  const tmp = `${path}.tmp-${process.pid}`
  const body = `${JSON.stringify(data, null, 2)}\n`
  writeFileSync(tmp, body, 'utf8')
  try {
    renameSync(tmp, path)
  } catch (err) {
    try { unlinkSync(tmp) } catch { /* ignore */ }
    throw err
  }
}

function countDistractors(regen) {
  return Object.values(regen).reduce(
    (sum, block) => sum + (block?.incorrect?.length || 0),
    0,
  )
}

function main() {
  const { dryRun } = parseArgs(process.argv.slice(2))

  if (!existsSync(REGEN_PATH)) {
    throw new Error(`Missing regen file: ${REGEN_PATH}`)
  }

  const existing = JSON.parse(readFileSync(REGEN_PATH, 'utf8'))
  if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
    throw new Error('regeneratedExplanations.json must be a JSON object')
  }

  const questions = loadCleanQuestionsInOrder()
  const seenIds = new Set()
  for (const q of questions) {
    if (seenIds.has(q.id)) throw new Error(`Duplicate clean-bank id: ${q.id}`)
    seenIds.add(q.id)
  }

  const preserved = Object.keys(existing).length
  const out = {}
  // Preserve authored key order exactly.
  for (const id of Object.keys(existing)) {
    out[id] = existing[id]
  }

  const errors = []
  let added = 0
  let addedDistractors = 0

  for (const q of questions) {
    if (Object.prototype.hasOwnProperty.call(existing, q.id)) continue

    try {
      if (!Array.isArray(q.choices) || q.choices.length < 2) {
        throw new Error('need >= 2 choices')
      }
      if (wrongChoiceIndexes(q).length === 0) {
        throw new Error('no wrong choices to map')
      }

      const applied = applyAnswerReviewToQuestion(q)
      const block = buildRegenBlockFromApplied(applied)
      const vErrors = validateRegenQuestionBlock(applied, block)
      if (vErrors.length) throw new Error(vErrors.join('; '))

      out[q.id] = block
      added++
      addedDistractors += block.incorrect.length
    } catch (err) {
      errors.push(`${q.id}: ${err.message || err}`)
    }
  }

  if (errors.length) {
    console.error(`✗ Backfill aborted — ${errors.length} error(s), nothing written:`)
    for (const e of errors.slice(0, 40)) console.error(`  - ${e}`)
    if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`)
    process.exit(1)
  }

  const total = Object.keys(out).length
  const distractors = countDistractors(out)
  const mode = dryRun ? 'DRY-RUN' : 'WRITE'

  console.log(`[${mode}] regeneratedExplanations backfill`)
  console.log(`  clean questions : ${questions.length}`)
  console.log(`  existing/preserved: ${preserved}`)
  console.log(`  added           : ${added}`)
  console.log(`  total           : ${total}`)
  console.log(`  distractors     : ${distractors} (new distractors: ${addedDistractors})`)
  console.log(`  errors          : 0`)

  if (dryRun) {
    console.log('  (no file written)')
    return
  }

  writeJsonAtomic(REGEN_PATH, out)
  console.log(`  wrote ${REGEN_PATH.replace(`${ROOT}/`, '')}`)
}

try {
  main()
} catch (err) {
  console.error(`✗ ${err.message || err}`)
  process.exit(1)
}
