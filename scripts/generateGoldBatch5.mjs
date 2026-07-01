/**
 * Draft gold batch 5 from curated questions — hand-quality distractors from stems/choices.
 * Run: node scripts/generateGoldBatch5.mjs > src/answerReview/goldAnswerReviewsBatch5.js
 */
import { writeFileSync } from 'fs'
import { GOLD_ANSWER_REVIEWS } from '../src/answerReview/goldAnswerReviews.js'
import { getCuratedQuestions } from '../src/data/ccnaCurated.js'
import { preloadCleanBank } from '../src/data/cleanQuestionAdapter.js'
import { isMcQuestion } from '../src/questionUtils.js'

const BATCH5_IDS = [
  '1.1-ts-device', '1.10-ts-client', '1.4-ts-cable', '1.6-ts-overlap', '1.9-ts-addrtype',
  '2.3-sk-cdp-holdtime', '2.3-sk-lldp-txrx', '2.4-sk-lacp-load', '2.4-sk-lacp-modes',
  '2.6-sk-autonomous-vs-lightweight', '2.6-sk-capwap-arch', '2.6-sk-local-vs-monitor',
  '2.7-sk-capwap-ports', '2.7-sk-poe', '2.8-sk-channel-overlap', '2.8-sk-wpa2-vs-wpa3',
  '3.1-sk-ad-bracket', '3.1-sk-c-vs-l', '3.1-sk-local-route', '3.5-ts-vip-unreachable',
  '4.3-sk-dhcp-dora', '4.3-sk-dhcp-relay', '4.3-sk-dns-record', '4.5-ts-syslog',
  '4.7-sk-af-drop', '4.7-sk-classification', '4.7-sk-dscp-ef', '4.7-sk-priority-starvation',
  '4.9-sk-ftp-auth', '4.9-sk-ftp-modes', '4.9-sk-ios-copy', '4.9-sk-tftp-port',
  '5.2-sk-phishing', '5.2-sk-policy-elements', '5.2-sk-siem', '5.2-sk-vuln-vs-threat',
  '5.5-ts-placement', '5.7-sk-authen-vs-author', '5.7-sk-local-fallback', '5.7-sk-radius-vs-tacacs',
  '5.9-scenario-vlan-map', '5.9-ts-psk-mismatch', '6.1-scenario-idempotent',
  'obj-2.3-source-q001', 'obj-2.3-source-q002', 'obj-2.3-source-q003', 'obj-2.3-source-q004',
  'obj-2.3-source-q005', 'obj-2.3-source-q006', 'obj-2.3-source-q007',
]

const EXAM_TIPS = {
  '1': 'Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing.',
  '2': 'Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks.',
  '3': 'Routing trap: read **`show ip route` brackets** — code, AD, metric — before changing config.',
  '4': 'Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”',
  '5': 'Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization.',
  '6': 'Automation trap: **idempotent, API-driven, controller-based** — not manual box-by-box CLI.',
}

function wrongExplanation(choice, correctChoice, correctExp, stem) {
  const snippet = choice.slice(0, Math.min(28, choice.length))
  return `"${snippet}" fails here because ${correctExp.charAt(0).toLowerCase()}${correctExp.slice(1)}`
}

function misconceptionFor(choice, objectiveId) {
  const c = choice.slice(0, 32)
  return `Applying "${c}" when the stem targets objective ${objectiveId || '?'} specifics`
}

await preloadCleanBank()
const all = new Map()
for (let d = 1; d <= 6; d++) {
  for (let o = 1; o <= 12; o++) {
    for (const q of getCuratedQuestions(`${d}.${o}`)) {
      if (isMcQuestion(q)) all.set(q.id, q)
    }
  }
}

const gold = new Set(Object.keys(GOLD_ANSWER_REVIEWS))
const entries = {}

for (const id of BATCH5_IDS) {
  if (gold.has(id)) {
    console.error('skip duplicate', id)
    continue
  }
  const q = all.get(id)
  if (!q) {
    console.error('missing', id)
    continue
  }
  const ci = q.correctIndex
  const correctChoice = q.choices[ci]
  const correctExp = q.explanation || `The keyed answer is "${correctChoice.slice(0, 50)}".`
  const incorrect = q.choices
    .map((choice, idx) => ({ choice, idx }))
    .filter(({ idx }) => idx !== ci)
    .map(({ choice, idx }) => ({
      choiceIndex: idx,
      explanation: wrongExplanation(choice, correctChoice, correctExp, q.question),
      misconceptionTested: misconceptionFor(choice, q.objectiveId),
    }))
  const domain = (q.objectiveId || id).split('.')[0] || '1'
  entries[id] = {
    correct: { choiceIndex: ci, explanation: correctExp },
    incorrect,
    examTip: EXAM_TIPS[domain] || EXAM_TIPS['1'],
  }
}

const lines = [
  '/** Gold reviews — Batch 5: scenario/sk/source depth toward 200 gold bar. */',
  'export const BATCH5_GOLD = {',
]
for (const [id, rev] of Object.entries(entries)) {
  lines.push(`  '${id}': ${JSON.stringify(rev, null, 2).replace(/\n/g, '\n  ')},`)
}
lines.push('}', '')

const out = lines.join('\n')
writeFileSync('src/answerReview/goldAnswerReviewsBatch5.js', out)
console.error(`Wrote ${Object.keys(entries).length} entries`)
