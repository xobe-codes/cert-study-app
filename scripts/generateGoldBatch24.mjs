/**
 * Hand-authored gold batch 24 — static routing 3.3 q22+, OSPF 3.4 q33+.
 * Regenerate: python3 scripts/_genGoldBatch24.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch24.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch24.js', 'utf8')
if (!out.includes('BATCH24_GOLD')) {
  console.error('Batch 24 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch24.js is up to date')
