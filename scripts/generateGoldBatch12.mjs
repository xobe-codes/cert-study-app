/**
 * Hand-authored gold batch 12 — Subnetting 1.6 + NAT 4.1 + Security 5.1.
 * Regenerate: python3 scripts/_genGoldBatch12.py
 */
import { writeFileSync, readFileSync } from 'fs'
import { execSync } from 'child_process'

execSync('python3 scripts/_genGoldBatch12.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch12.js', 'utf8')
if (!out.includes('BATCH12_GOLD')) {
  console.error('Batch 12 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch12.js is up to date')
