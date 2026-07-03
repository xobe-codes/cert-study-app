/**
 * Hand-authored gold batch 23 — OSPF 3.4 q23+, STP 2.5 q17+, static routing 3.3 q15+.
 * Regenerate: python3 scripts/_genGoldBatch23.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch23.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch23.js', 'utf8')
if (!out.includes('BATCH23_GOLD')) {
  console.error('Batch 23 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch23.js is up to date')
