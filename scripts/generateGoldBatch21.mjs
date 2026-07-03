/**
 * Hand-authored gold batch 21 — OSPF 3.4 q1+, STP 2.5 q1+, static routing 3.3 q1+.
 * Regenerate: python3 scripts/_genGoldBatch21.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch21.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch21.js', 'utf8')
if (!out.includes('BATCH21_GOLD')) {
  console.error('Batch 21 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch21.js is up to date')
