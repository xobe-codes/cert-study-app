/**
 * Hand-authored gold batch 22 — OSPF 3.4 q13+, STP 2.5 q9+, static routing 3.3 q8+.
 * Regenerate: python3 scripts/_genGoldBatch22.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch22.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch22.js', 'utf8')
if (!out.includes('BATCH22_GOLD')) {
  console.error('Batch 22 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch22.js is up to date')
