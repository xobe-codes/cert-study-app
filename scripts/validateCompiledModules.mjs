#!/usr/bin/env node
/**
 * CI guard: compiled runtime modules match clean-bank manifest expectations.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { DOMAIN_1_OBJECTIVES, EXTRA_CLEAN_OBJECTIVES } from './lib/sourceBankConfig.mjs'
import { loadShelvedQuestionIds } from './validateRegenCoverage.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const META = join(ROOT, 'src', 'data', 'ccnaCleanBankMeta.js')
const CLEAN_Q_DIR = join(ROOT, 'src', 'data', 'cleanQuestions')
const KB = join(ROOT, 'src', 'data', 'ccnaKnowledgeBaseDomain4.js')
const MANIFEST = join(ROOT, 'data', 'clean-question-bank', 'manifest.json')
const REGEN = join(ROOT, 'src', 'answerReview', 'regeneratedExplanations.json')
const SHELVED = join(ROOT, 'data', 'shelved-questions')

function readMetaObjectiveCount() {
  const text = readFileSync(META, 'utf-8')
  const match = text.match(/new Set\(\[([\s\S]*?)\]\)/)
  if (!match) throw new Error('Could not parse ccnaCleanBankMeta.js')
  return (match[1].match(/"/g) || []).length / 2
}

async function validateCompiledRegen(errors) {
  if (!existsSync(REGEN)) {
    errors.push('missing src/answerReview/regeneratedExplanations.json')
    return
  }
  const shelvedIds = loadShelvedQuestionIds(SHELVED)
  const expected = new Set(
    Object.keys(JSON.parse(readFileSync(REGEN, 'utf-8')))
      .filter(id => !shelvedIds.has(id)),
  )
  const compiled = new Map()
  for (let domain = 1; domain <= 6; domain += 1) {
    const path = join(CLEAN_Q_DIR, `domain-${domain}.js`)
    if (!existsSync(path)) continue
    const mod = await import(`${pathToFileURL(path).href}?validate=${Date.now()}`)
    for (const questions of Object.values(mod.CLEAN_QUESTIONS || {})) {
      for (const q of questions) {
        if (Array.isArray(q.regeneratedIncorrect) && q.regeneratedIncorrect.length) {
          compiled.set(q.id, q.regeneratedIncorrect)
        }
      }
    }
  }
  const missing = [...expected].filter(id => !compiled.has(id))
  const extra = [...compiled.keys()].filter(id => !expected.has(id))
  if (missing.length) {
    errors.push(`compiled clean-bank chunks missing regen for ${missing.length} question(s): ${missing.slice(0, 5).join(', ')}`)
  }
  if (extra.length) {
    errors.push(`compiled clean-bank chunks have ${extra.length} unknown regen question(s): ${extra.slice(0, 5).join(', ')}`)
  }
}

async function main() {
  const errors = []
  if (!existsSync(META)) errors.push('missing src/data/ccnaCleanBankMeta.js')
  for (let d = 1; d <= 6; d += 1) {
    const path = join(CLEAN_Q_DIR, `domain-${d}.js`)
    if (!existsSync(path)) errors.push(`missing src/data/cleanQuestions/domain-${d}.js — run npm run compile:clean-questions`)
  }
  if (!existsSync(KB)) errors.push('missing src/data/ccnaKnowledgeBaseDomain4.js')
  if (!existsSync(MANIFEST)) errors.push('missing data/clean-question-bank/manifest.json — run npm run kb:full')

  if (!errors.length) {
    const metaCount = readMetaObjectiveCount()
    if (metaCount < 53) errors.push(`ccnaCleanBankMeta has ${metaCount} objectives, expected 53`)
  }

  for (const id of DOMAIN_1_OBJECTIVES) {
    const path = join(ROOT, 'data', 'clean-question-bank', 'domain-1', `${id}.json`)
    if (!existsSync(path)) errors.push(`missing domain-1/${id}.json`)
  }
  for (const { objectiveId, domain } of EXTRA_CLEAN_OBJECTIVES) {
    const path = join(ROOT, 'data', 'clean-question-bank', `domain-${domain}`, `${objectiveId}.json`)
    if (!existsSync(path)) errors.push(`missing domain-${domain}/${objectiveId}.json (extra clean objective)`)
  }

  if (existsSync(KB)) {
    const kbText = readFileSync(KB, 'utf-8')
    if (!kbText.includes('"objectives"')) errors.push('KB module missing objectives')
    if (!kbText.includes('"examTraps"')) errors.push('KB module missing examTraps')
  }

  await validateCompiledRegen(errors)

  if (errors.length) {
    console.error('✗ Compiled module validation failed:')
    errors.forEach(e => console.error('  -', e))
    process.exit(1)
  }
  console.log('✓ Compiled modules present with full per-domain regen coverage')
}

main().catch(error => {
  console.error('✗ Compiled module validation failed:', error)
  process.exit(1)
})
