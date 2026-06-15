#!/usr/bin/env node
/** Strict voice validation for KB-compiled lesson patches. */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateVoiceText } from './lib/voiceProse.mjs'
import { countSentences, wordCount } from '../src/lesson/explanationFormat.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PATCHES = join(__dirname, '..', 'src', 'data', 'kbCompiledPatches.js')

const errors = []

if (!existsSync(PATCHES)) {
  console.error('✗ kbCompiledPatches.js missing')
  process.exit(1)
}

const mod = await import(`file://${PATCHES}`)
const patches = mod.KB_COMPILED_PATCHES || {}

for (const [id, patch] of Object.entries(patches)) {
  errors.push(...validateVoiceText(patch.bigTakeaway, { field: `${id}.bigTakeaway` }))
  if (wordCount(patch.bigTakeaway || '') > 28) errors.push(`${id}.bigTakeaway: too long (${wordCount(patch.bigTakeaway)} words)`)

  for (const [tier, text] of Object.entries(patch.tiers || {})) {
    errors.push(...validateVoiceText(text, { field: `${id}.tiers.${tier}` }))
    if (!text?.trim()) errors.push(`${id}.tiers.${tier}: empty`)
    if (countSentences(text) > 5) errors.push(`${id}.tiers.${tier}: too many sentences`)
  }
  if (!patch.tiers?.examReady?.trim()) errors.push(`${id}.tiers.examReady: empty`)
}

if (errors.length) {
  console.error(`✗ validate:voice failed (${errors.length}):`)
  errors.slice(0, 40).forEach(e => console.error('  -', e))
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`)
  process.exit(1)
}

console.log(`✓ validate:voice OK — ${Object.keys(patches).length} KB objectives`)
process.exit(0)
