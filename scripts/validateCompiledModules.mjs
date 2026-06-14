#!/usr/bin/env node
/**
 * CI guard: compiled runtime modules match clean-bank manifest expectations.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMAIN_1_OBJECTIVES, EXTRA_CLEAN_OBJECTIVES } from './lib/sourceBankConfig.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const META = join(ROOT, 'src', 'data', 'ccnaCleanBankMeta.js')
const KB = join(ROOT, 'src', 'data', 'ccnaKnowledgeBaseDomain4.js')
const MANIFEST = join(ROOT, 'data', 'clean-question-bank', 'manifest.json')

function readMetaObjectiveCount() {
  const text = readFileSync(META, 'utf-8')
  const match = text.match(/new Set\(\[([\s\S]*?)\]\)/)
  if (!match) throw new Error('Could not parse ccnaCleanBankMeta.js')
  return (match[1].match(/"/g) || []).length / 2
}

function main() {
  const errors = []
  if (!existsSync(META)) errors.push('missing src/data/ccnaCleanBankMeta.js')
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

  if (errors.length) {
    console.error('✗ Compiled module validation failed:')
    errors.forEach(e => console.error('  -', e))
    process.exit(1)
  }
  console.log('✓ Compiled modules and domain-1/extra clean bank files present')
}

main()
