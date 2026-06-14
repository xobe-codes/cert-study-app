#!/usr/bin/env node
/**
 * Promote shelved questions back into the clean question bank.
 *
 * Exhibit-dependent: auto-tries exhibitConverters.mjs
 * Out-of-scope: requires entry in data/shelved-questions/approved-promotions.json
 *
 * Usage:
 *   npm run promote:shelved              # try all convertible exhibit questions
 *   npm run promote:shelved -- obj-3.1-source-q002
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMAIN_META } from './lib/sourceBankConfig.mjs'
import { tryConvertExhibit } from './lib/exhibitConverters.mjs'
import { applyAnswerReviewToQuestion } from './lib/generateAnswerReview.mjs'
import { validateCleanQuestion, isExhibitDependent } from './lib/cleanBankUtils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SHELVED_ROOT = join(ROOT, 'data', 'shelved-questions')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')
const APPROVED = join(SHELVED_ROOT, 'approved-promotions.json')

const targetId = process.argv[2] || null

function loadJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : []
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

function domainForObjective(objectiveId) {
  for (const [num, meta] of Object.entries(DOMAIN_META)) {
    if (meta.objectives.includes(objectiveId)) return Number(num)
  }
  return null
}

function promoteQuestion(q, approvedIds) {
  let candidate = { ...q }

  if (q.reason === 'exhibit-dependent') {
    const converted = tryConvertExhibit(candidate, q.objectiveId)
    if (!converted) return { ok: false, reason: 'no exhibit converter' }
    candidate = converted
  } else if (q.reason === 'out-of-scope') {
    if (!approvedIds.has(q.id)) return { ok: false, reason: 'not in approved-promotions.json' }
  } else {
    return { ok: false, reason: 'unknown shelved reason' }
  }

  if (isExhibitDependent(candidate)) return { ok: false, reason: 'still exhibit-dependent after convert' }

  candidate = applyAnswerReviewToQuestion(candidate)
  const errors = validateCleanQuestion(candidate, q.objectiveId)
  if (errors.length) return { ok: false, reason: errors[0] }

  const domain = domainForObjective(q.objectiveId)
  if (!domain) return { ok: false, reason: 'unknown domain for objective' }

  const cleanPath = join(CLEAN_ROOT, `domain-${domain}`, `${q.objectiveId}.json`)
  if (!existsSync(cleanPath)) return { ok: false, reason: 'clean bank file missing' }

  const cleanFile = JSON.parse(readFileSync(cleanPath, 'utf-8'))
  if (cleanFile.questions.some(x => x.id === q.id)) return { ok: false, reason: 'already in clean bank' }

  cleanFile.questions.push(candidate)
  saveJson(cleanPath, cleanFile)
  return { ok: true, question: candidate }
}

function main() {
  const approved = loadJson(APPROVED)
  const approvedIds = new Set(approved.map(a => a.id))
  let promoted = 0
  const results = []

  for (const [domainNum] of Object.entries(DOMAIN_META)) {
    const dir = join(SHELVED_ROOT, `domain-${domainNum}`)
    for (const file of ['exhibit-dependent.json', 'out-of-scope.json']) {
      const path = join(dir, file)
      let items = loadJson(path)
      const kept = []

      for (const q of items) {
        if (targetId && q.id !== targetId) {
          kept.push(q)
          continue
        }
        if (targetId || q.reason === 'exhibit-dependent' || approvedIds.has(q.id)) {
          const result = promoteQuestion(q, approvedIds)
          if (result.ok) {
            promoted++
            results.push(`✓ ${q.id} → clean bank (${q.objectiveId})`)
          } else if (targetId) {
            results.push(`✗ ${q.id}: ${result.reason}`)
          }
          if (!result.ok) kept.push(q)
        } else {
          kept.push(q)
        }
      }

      saveJson(path, kept)
    }
  }

  results.forEach(r => console.log(r))
  console.log(`\n✓ Promoted ${promoted} question(s)`)
  if (promoted > 0) {
    console.log('  Run: npm run compile:clean-questions && npm run compile:shelved-questions')
  }
}

main()
