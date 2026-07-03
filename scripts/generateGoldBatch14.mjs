/**
 * Hand-authored gold batch 14 — MAC 1.5, private IP 1.7, IPv6 1.9, OSPF 3.4.
 * Regenerate: python3 scripts/_genGoldBatch14.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch14.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch14.js', 'utf8')
if (!out.includes('BATCH14_GOLD')) {
  console.error('Batch 14 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch14.js is up to date')
