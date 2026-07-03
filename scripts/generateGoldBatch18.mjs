/**
 * Hand-authored gold batch 18 — FHRP 3.5, segmentation 5.11, DNS 4.3, SNMP 4.4, syslog 4.5, cloud mgmt 4.10, controller 6.2, SDN 6.3, DNA 6.4, APIs 6.5, config mgmt 6.6.
 * Regenerate: python3 scripts/_genGoldBatch18.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch18.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch18.js', 'utf8')
if (!out.includes('BATCH18_GOLD')) {
  console.error('Batch 18 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch18.js is up to date')
