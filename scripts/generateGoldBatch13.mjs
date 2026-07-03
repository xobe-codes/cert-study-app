/**
 * Hand-authored gold batch 13 — Security 5.1, ACLs 5.5, IPv6 1.8, routing 3.1.
 * Regenerate: python3 scripts/_genGoldBatch13.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch13.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch13.js', 'utf8')
if (!out.includes('BATCH13_GOLD')) {
  console.error('Batch 13 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch13.js is up to date')
