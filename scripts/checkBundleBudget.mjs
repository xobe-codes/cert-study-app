#!/usr/bin/env node
/**
 * Bundle budget gate.
 *
 * The startup chunk grew from a documented 416KB gzip to over 1MB without
 * anything failing, because nothing measured it. These ceilings are ratchets:
 * lower them when a change makes the bundle smaller, never raise them to make
 * a red build green.
 */
import { gzipSync } from 'node:zlib'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ASSETS = join(process.cwd(), 'dist', 'assets')

const BUDGETS = [
  // The chunk every visitor parses before the app is interactive.
  { name: 'core', match: /^core-.*\.js$/, maxGzipKB: 800 },
  // Loaded on demand with the question bank, not at startup.
  { name: 'gold answer reviews', match: /^goldAnswerReviewsData-.*\.js$/, maxGzipKB: 300 },
]

const TOTAL_JS_GZIP_MAX_KB = 1900

function gzipKB(file) {
  return gzipSync(readFileSync(file)).length / 1024
}

let files
try {
  files = readdirSync(ASSETS).filter(f => f.endsWith('.js'))
} catch {
  console.error('✗ dist/assets not found — run `npm run build` first.')
  process.exit(1)
}

const failures = []
const report = []

for (const budget of BUDGETS) {
  const matches = files.filter(f => budget.match.test(f))
  if (!matches.length) {
    failures.push(`${budget.name}: no chunk matched ${budget.match} — chunking changed, update the budget`)
    continue
  }
  const size = matches.reduce((sum, f) => sum + gzipKB(join(ASSETS, f)), 0)
  report.push(`  ${budget.name.padEnd(22)} ${size.toFixed(0).padStart(5)}KB gz  (budget ${budget.maxGzipKB}KB)`)
  if (size > budget.maxGzipKB) {
    failures.push(`${budget.name} is ${size.toFixed(0)}KB gzip, over its ${budget.maxGzipKB}KB budget`)
  }
}

const totalGzip = files.reduce((sum, f) => sum + gzipKB(join(ASSETS, f)), 0)
report.push(`  ${'all JS'.padEnd(22)} ${totalGzip.toFixed(0).padStart(5)}KB gz  (budget ${TOTAL_JS_GZIP_MAX_KB}KB)`)
if (totalGzip > TOTAL_JS_GZIP_MAX_KB) {
  failures.push(`total JS is ${totalGzip.toFixed(0)}KB gzip, over the ${TOTAL_JS_GZIP_MAX_KB}KB budget`)
}

// The service worker precaches on first visit — this is what a learner pays for
// on mobile data before the app is reliably offline.
let precacheKB = 0
try {
  const sw = readFileSync(join(process.cwd(), 'dist', 'sw.js'), 'utf8')
  for (const m of sw.matchAll(/"url":\s*"([^"]+)"/g)) {
    try { precacheKB += statSync(join(process.cwd(), 'dist', m[1].replace(/^\//, ''))).size / 1024 } catch { /* not on disk */ }
  }
} catch { /* no service worker in this build */ }
const PRECACHE_MAX_KB = 8600
if (precacheKB) {
  report.push(`  ${'sw precache'.padEnd(22)} ${precacheKB.toFixed(0).padStart(5)}KB raw (budget ${PRECACHE_MAX_KB}KB)`)
  if (precacheKB > PRECACHE_MAX_KB) {
    failures.push(`service-worker precache is ${precacheKB.toFixed(0)}KB, over the ${PRECACHE_MAX_KB}KB budget`)
  }
}

console.log('Bundle budget:')
report.forEach(r => console.log(r))

if (failures.length) {
  console.error('\n✗ Bundle budget exceeded:')
  failures.forEach(f => console.error(`  - ${f}`))
  console.error('\nBudgets are ratchets. Split or lazy-load the growth rather than raising them.')
  process.exit(1)
}

console.log('\n✓ Bundle within budget')
