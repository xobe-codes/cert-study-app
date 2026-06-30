#!/usr/bin/env node
/** List question IDs with min distractor score below threshold for gold override queue. */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scoreAnswerReview } from '../src/answerReview/answerReviewQuality.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const OUT_JSON = join(ROOT, 'data', 'gold-distractor-candidates.json')
const THRESHOLD = 3

function walkJsonFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walkJsonFiles(p, out)
    else if (name.endsWith('.json') && name !== 'manifest.json') out.push(p)
  }
  return out
}

function inferObjectiveId(path, q) {
  if (q.objectiveId) return q.objectiveId
  const rel = path.replace(`${CLEAN_ROOT}/`, '')
  const m = rel.match(/objective-([\d.]+)/i)
  return m?.[1] || null
}

const candidates = []

for (const path of walkJsonFiles(CLEAN_ROOT)) {
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  for (const q of data.questions || []) {
    const { min, avg, fallbackCount } = scoreAnswerReview(q)
    if (min >= THRESHOLD) continue
    candidates.push({
      id: q.id || 'no-id',
      objectiveId: inferObjectiveId(path, q),
      min,
      avg,
      fallbackCount,
      file: path.replace(`${ROOT}/`, ''),
    })
  }
}

candidates.sort((a, b) => a.min - b.min || a.avg - b.avg || a.id.localeCompare(b.id))

const output = {
  generatedAt: new Date().toISOString(),
  threshold: THRESHOLD,
  count: candidates.length,
  questionIds: candidates.map(c => c.id),
  candidates,
}

writeFileSync(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`)

console.log(`✓ Gold distractor candidates — ${candidates.length} questions (min < ${THRESHOLD})`)
console.log(`  → ${OUT_JSON.replace(`${ROOT}/`, '')}`)
