/**
 * Hand-authored gold batch 20 — FHRP 3.5 q23+, REST APIs 6.5 q7+, config mgmt 6.6 q7+, NAT 4.1 q10+.
 * Regenerate: python3 scripts/_genGoldBatch20.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch20.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch20.js', 'utf8')
if (!out.includes('BATCH20_GOLD')) {
  console.error('Batch 20 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch20.js is up to date')
