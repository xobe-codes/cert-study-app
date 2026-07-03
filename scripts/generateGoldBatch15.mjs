/**
 * Hand-authored gold batch 15 — WLAN 5.9, automation 6.1, SDN 6.2, NTP 4.2, EtherChannel 2.4, device access 5.3.
 * Regenerate: python3 scripts/_genGoldBatch15.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch15.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch15.js', 'utf8')
if (!out.includes('BATCH15_GOLD')) {
  console.error('Batch 15 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch15.js is up to date')
