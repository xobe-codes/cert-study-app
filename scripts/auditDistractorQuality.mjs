#!/usr/bin/env node
/** Scan clean bank; rank questions by distractor score; write audit JSON + console summary. */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scoreAnswerReview } from '../src/answerReview/answerReviewQuality.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const OUT_DIR = join(ROOT, 'ai-improvement-logs')
const OUT_JSON = join(OUT_DIR, 'DISTRACTOR_QUALITY_AUDIT.json')
const THRESHOLD = 3
const WORST_LIMIT = 50

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

const rows = []

for (const path of walkJsonFiles(CLEAN_ROOT)) {
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  for (const q of data.questions || []) {
    const scored = scoreAnswerReview(q)
    rows.push({
      id: q.id || 'no-id',
      objectiveId: inferObjectiveId(path, q),
      file: path.replace(`${ROOT}/`, ''),
      min: scored.min,
      avg: scored.avg,
      fallbackCount: scored.fallbackCount,
      duplicateTexts: scored.duplicateTexts,
      items: scored.items,
    })
  }
}

rows.sort((a, b) => a.min - b.min || a.avg - b.avg || a.id.localeCompare(b.id))

const belowThreshold = rows.filter(r => r.min < THRESHOLD)
const mins = rows.map(r => r.min)
const avgs = rows.map(r => r.avg)

const report = {
  generatedAt: new Date().toISOString(),
  threshold: THRESHOLD,
  totalQuestions: rows.length,
  summary: {
    belowThreshold: belowThreshold.length,
    atOrAboveThreshold: rows.length - belowThreshold.length,
    avgMin: mins.length ? mins.reduce((a, b) => a + b, 0) / mins.length : 0,
    avgAvg: avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0,
    totalFallbackSlots: rows.reduce((n, r) => n + (r.fallbackCount || 0), 0),
    duplicateExplanationCount: rows.filter(r => r.duplicateTexts).length,
  },
  worst: rows.slice(0, WORST_LIMIT),
  belowThresholdIds: belowThreshold.map(r => r.id),
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`)

console.log(`✓ Distractor quality audit — ${rows.length} questions`)
console.log(`  below threshold (min < ${THRESHOLD}): ${belowThreshold.length}`)
console.log(`  avg min score: ${report.summary.avgMin.toFixed(2)}`)
console.log(`  avg avg score: ${report.summary.avgAvg.toFixed(2)}`)
console.log(`  fallback slots: ${report.summary.totalFallbackSlots}`)
console.log(`  → ${OUT_JSON.replace(`${ROOT}/`, '')}`)

if (report.worst.length) {
  console.log('\nWorst 10:')
  for (const r of report.worst.slice(0, 10)) {
    console.log(`  ${r.id}  min=${r.min} avg=${r.avg.toFixed(1)}  fallback=${r.fallbackCount}`)
  }
}
