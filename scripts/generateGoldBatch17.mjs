/**
 * Hand-authored gold batch 17 — HSRP 3.5, ACL 5.5, port security 5.6, QoS 4.7, VPN 5.10, automation 6.1, SDN 6.3, EtherChannel 2.4, DHCP 4.3, OSPF 3.4.
 * Regenerate: python3 scripts/_genGoldBatch17.py
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

execSync('python3 scripts/_genGoldBatch17.py', { stdio: 'inherit' })
const out = readFileSync('src/answerReview/goldAnswerReviewsBatch17.js', 'utf8')
if (!out.includes('BATCH17_GOLD')) {
  console.error('Batch 17 generation failed')
  process.exit(1)
}
console.error('goldAnswerReviewsBatch17.js is up to date')
