#!/usr/bin/env node
/**
 * Build Question Health Registry from validation scan + learner flag export + manual overrides.
 * Outputs data/question-health-registry.json + src/data/questionHealthRegistry.js
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCleanQuestion } from './lib/cleanBankUtils.mjs'
import { DOMAIN_META, DOMAIN_1_OBJECTIVES, EXTRA_CLEAN_OBJECTIVES } from './lib/sourceBankConfig.mjs'
import { validateQuestionAnswerReview } from '../src/answerReview/answerReviewQuality.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const OUT_JSON = join(ROOT, 'data', 'question-health-registry.json')
const OUT_JS = join(ROOT, 'src', 'data', 'questionHealthRegistry.js')
const OVERRIDES_PATH = join(ROOT, 'data', 'question-health-overrides.json')
const FLAGS_EXPORT = join(ROOT, 'data', 'question-health-flags-export.json')

const LEARNER_QUARANTINE_THRESHOLD = 3
const PASS_IMPACT_BY_DOMAIN = { '1': 90, '2': 85, '3': 88, '4': 80, '5': 82, '6': 78 }

function passImpactFor(objectiveId) {
  return PASS_IMPACT_BY_DOMAIN[objectiveId?.split('.')[0]] ?? 70
}

function loadOverrides() {
  if (!existsSync(OVERRIDES_PATH)) {
    return { manualQuarantine: [], manualNeedsFix: [], resolved: [] }
  }
  return JSON.parse(readFileSync(OVERRIDES_PATH, 'utf-8'))
}

function loadLearnerFlagCounts() {
  if (!existsSync(FLAGS_EXPORT)) return {}
  const raw = JSON.parse(readFileSync(FLAGS_EXPORT, 'utf-8'))
  return raw.counts || raw || {}
}

function collectQuestions() {
  const list = []
  const addFile = (objectiveId, path) => {
    if (!existsSync(path)) return
    const { questions } = JSON.parse(readFileSync(path, 'utf-8'))
    for (const q of questions || []) {
      if (q?.id) list.push({ objectiveId, q })
    }
  }
  for (const objectiveId of DOMAIN_1_OBJECTIVES) {
    addFile(objectiveId, join(CLEAN_ROOT, 'domain-1', `${objectiveId}.json`))
  }
  for (const [domainNum, meta] of Object.entries(DOMAIN_META)) {
    for (const objectiveId of meta.objectives) {
      addFile(objectiveId, join(CLEAN_ROOT, `domain-${domainNum}`, `${objectiveId}.json`))
    }
  }
  for (const { objectiveId, domain } of EXTRA_CLEAN_OBJECTIVES) {
    addFile(objectiveId, join(CLEAN_ROOT, `domain-${domain}`, `${objectiveId}.json`))
  }
  return list
}

function upsertEntry(map, questionId, objectiveId, patch) {
  const prev = map[questionId] || {
    questionId,
    objectiveId,
    status: 'ok',
    reasons: [],
    flagCount: 0,
    passImpact: passImpactFor(objectiveId),
  }
  map[questionId] = {
    ...prev,
    ...patch,
    questionId,
    objectiveId: patch.objectiveId || prev.objectiveId || objectiveId,
    reasons: [...(prev.reasons || []), ...(patch.reasons || [])],
  }
}

function main() {
  const overrides = loadOverrides()
  const learnerCounts = loadLearnerFlagCounts()
  const resolved = new Set(overrides.resolved || [])
  const entries = {}

  for (const { objectiveId, q } of collectQuestions()) {
    if (resolved.has(q.id)) continue

    for (const msg of validateCleanQuestion(q, objectiveId)) {
      upsertEntry(entries, q.id, objectiveId, {
        status: 'needs_fix',
        reasons: [{ code: 'validation', source: 'ci', severity: 'critical', detail: msg }],
      })
    }
    if (!q.answerReview) {
      upsertEntry(entries, q.id, objectiveId, {
        status: 'needs_fix',
        reasons: [{ code: 'missing_answer_review', source: 'ci', severity: 'high', detail: 'missing answerReview' }],
      })
    } else {
      for (const msg of validateQuestionAnswerReview(q)) {
        upsertEntry(entries, q.id, objectiveId, {
          status: 'needs_fix',
          reasons: [{ code: 'answer_voice', source: 'ci', severity: 'medium', detail: msg }],
        })
      }
    }

    const flagCount = Number(learnerCounts[q.id] || 0)
    if (flagCount > 0) {
      upsertEntry(entries, q.id, objectiveId, {
        flagCount,
        reasons: [{ code: 'learner_flags', source: 'learner', severity: flagCount >= LEARNER_QUARANTINE_THRESHOLD ? 'critical' : 'medium', detail: `${flagCount} learner flag(s)` }],
      })
      if (flagCount >= LEARNER_QUARANTINE_THRESHOLD) {
        entries[q.id].status = 'quarantined'
      }
    }
  }

  for (const id of overrides.manualNeedsFix || []) {
    if (resolved.has(id)) continue
    upsertEntry(entries, id, id.split('-')[0], {
      status: 'needs_fix',
      reasons: [{ code: 'manual', source: 'editor', severity: 'high', detail: 'manual needs_fix override' }],
    })
  }
  for (const id of overrides.manualQuarantine || []) {
    if (resolved.has(id)) continue
    upsertEntry(entries, id, id.split('-')[0], {
      status: 'quarantined',
      reasons: [{ code: 'manual', source: 'editor', severity: 'critical', detail: 'manual quarantine override' }],
    })
  }

  const excluded = new Set()
  for (const [id, e] of Object.entries(entries)) {
    if (e.status === 'needs_fix' || e.status === 'quarantined') excluded.add(id)
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    learnerQuarantineThreshold: LEARNER_QUARANTINE_THRESHOLD,
    entries,
    excludedIds: [...excluded].sort(),
  }
  writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`)

  const js = `// AUTO-GENERATED by scripts/buildQuestionHealthRegistry.mjs — do not hand-edit.
export const QUESTION_HEALTH_GENERATED_AT = ${JSON.stringify(payload.generatedAt)}

export const QUESTION_HEALTH_ENTRIES = ${JSON.stringify(entries, null, 2)}

export const EXCLUDED_QUESTION_IDS = new Set(${JSON.stringify([...excluded].sort())})

export function isQuestionExcluded(questionId) {
  return questionId && EXCLUDED_QUESTION_IDS.has(questionId)
}

export function getQuestionHealthEntry(questionId) {
  return QUESTION_HEALTH_ENTRIES[questionId] || null
}

export function listNeedsFixEntries() {
  return Object.values(QUESTION_HEALTH_ENTRIES).filter(e => e.status === 'needs_fix' || e.status === 'quarantined')
    .sort((a, b) => (b.passImpact || 0) - (a.passImpact || 0) || (b.flagCount || 0) - (a.flagCount || 0))
}
`
  writeFileSync(OUT_JS, js)
  console.log(`✓ Question health registry — ${Object.keys(entries).length} flagged, ${excluded.size} excluded from compile`)
}

main()
