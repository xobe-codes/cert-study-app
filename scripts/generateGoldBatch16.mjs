/**
 * Hand-authored gold batch 16 — HSRP 3.5, routing troubleshoot 3.6, ACL/L2 5.6, wireless security 5.8, QoS 4.7, WLAN arch 2.6, WLAN client 2.8, security 5.1, phishing 5.2, SDN spine-leaf 6.3.
 * Regenerate: python3 scripts/_genGoldBatch16.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch16.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch16.js', 'utf8')
if (!out.includes('BATCH16_GOLD')) {
  console.error('Batch 16 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch16.js is up to date')
