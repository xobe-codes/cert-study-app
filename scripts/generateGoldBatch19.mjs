/**
 * Hand-authored gold batch 19 — FHRP 3.5 q14+, REST APIs 6.5, config mgmt 6.6, L2 security 5.7, CDP 2.3.
 * Regenerate: python3 scripts/_genGoldBatch19.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch19.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch19.js', 'utf8')
if (!out.includes('BATCH19_GOLD')) {
  console.error('Batch 19 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch19.js is up to date')
