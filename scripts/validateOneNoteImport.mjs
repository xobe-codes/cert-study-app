#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, ONENOTE_NORMALIZED } from './lib/onenoteUtils.mjs'

const REPORT = join(ROOT, 'data', 'onenote', 'import-report.json')
const COMPILED = join(ROOT, 'data', 'onenote', 'compiled', 'objective-readings.json')

const errors = []
let warningCount = 0

if (!existsSync(REPORT)) {
  console.error('✗ missing import-report.json — run npm run onenote:import')
  process.exit(1)
}

const report = JSON.parse(readFileSync(REPORT, 'utf8'))
warningCount = report.warningCount || 0
if (report.errors?.length) errors.push(...report.errors)
if (!report.imported?.length) errors.push('no lessons imported')

if (existsSync(ONENOTE_NORMALIZED)) {
  const goldWithWarnings = []
  if (existsSync(COMPILED)) {
    const readings = JSON.parse(readFileSync(COMPILED, 'utf8'))
    for (const [id, r] of Object.entries(readings)) {
      if (r.confidence === 'gold' && r.needsReview) goldWithWarnings.push(id)
      if (!r.operatorSummary?.trim() && !r.keyPoints?.length) errors.push(`${id}: empty operator content`)
    }
    if (goldWithWarnings.length) {
      errors.push(`gold readings with OCR flags: ${goldWithWarnings.join(', ')}`)
    }
  }
}

if (errors.length) {
  console.error('✗ validate:onenote-import failed:')
  errors.slice(0, 30).forEach(e => console.error('  -', e))
  process.exit(1)
}

console.log(`✓ validate:onenote-import OK (${report.imported.length} lessons, OCR warnings: ${warningCount})`)
