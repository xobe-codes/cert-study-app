#!/usr/bin/env node
// One-time bulk converter: question-bank source JSON (ccna-question-bank-v1) ->
// src/data/ccnaQuestionImports.js (IMPORTED_QUESTIONS keyed by app objectiveId).
// Source files live outside the repo under ~/Downloads (validation packages).
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DL = join(homedir(), 'Downloads')

// objectiveIds in QB source -> app objectiveId. Most are 1:1; QB 6.6/6.7 both
// fold into app 6.6 (config-mgmt tools + JSON interpretation). Orphans resolved
// in MASTER SEQUENCE item 8: QB 2.9 -> app 2.8, QB 5.4 -> app 5.3.
const FILES = [
  { qbId: '2.3', appId: '2.3', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.3-layer-2-discovery-protocols-source-questions.json' },
  { qbId: '2.4', appId: '2.4', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.4-etherchannel-lacp-source-questions.json' },
  { qbId: '2.5', appId: '2.5', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.5-rapid-pvst-stp-basics-source-questions.json' },
  { qbId: '2.6', appId: '2.6', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.6-cisco-wireless-architectures-ap-modes-source-questions.json' },
  { qbId: '2.7', appId: '2.7', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.7-wlan-physical-infrastructure-connections-source-questions.json' },
  { qbId: '2.8', appId: '2.8', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.8-ap-wlc-management-access-source-questions.json' },
  // QB 2.9 has no app objective (domain stops at 2.8); merged into 2.8 per item 8.
  { qbId: '2.9', appId: '2.8', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.9-wlan-operational-parameters-source-questions.json' },
  // QB 5.4 (password policies) overlaps app 5.3 (device access control).
  { qbId: '5.4', appId: '5.3', file: 'domain5-domain6-validation/objective-5.4-security-password-policies-source-questions.json' },
  // Domain 5 bulk import — QB IDs shifted per PROJECT_LOG crosswalk.
  { qbId: '5.1', appId: '5.1', file: 'domain5-domain6-validation/objective-5.1-key-security-concepts-source-questions.json' },
  { qbId: '5.2', appId: '5.2', file: 'domain5-domain6-validation/objective-5.2-security-program-elements-source-questions.json' },
  { qbId: '5.3', appId: '5.3', file: 'domain5-domain6-validation/objective-5.3-local-device-access-control-source-questions.json' },
  { qbId: '5.5', appId: '5.10', file: 'domain5-domain6-validation/objective-5.5-vpn-remote-access-site-to-site-source-questions.json' },
  { qbId: '5.6', appId: '5.5', file: 'domain5-domain6-validation/objective-5.6-access-control-lists-source-questions.json' },
  { qbId: '5.7', appId: '5.6', file: 'domain5-domain6-validation/objective-5.7-layer-2-security-features-source-questions.json' },
  { qbId: '5.8', appId: '5.7', file: 'domain5-domain6-validation/objective-5.8-aaa-concepts-source-questions.json' },
  { qbId: '5.9', appId: '5.8', file: 'domain5-domain6-validation/objective-5.9-wireless-security-protocols-source-questions.json' },
  { qbId: '5.10', appId: '5.9', file: 'domain5-domain6-validation/objective-5.10-wlc-gui-wpa2-psk-source-questions.json' },
  { qbId: '3.1', appId: '3.1', file: 'domain3-ip-connectivity-validation/objective-3.1-routing-table-components-source-questions.json' },
  { qbId: '3.2', appId: '3.2', file: 'domain3-ip-connectivity-validation/objective-3.2-router-forwarding-decision-source-questions.json' },
  { qbId: '3.3', appId: '3.3', file: 'domain3-ip-connectivity-validation/objective-3.3-static-routing-ipv4-ipv6-source-questions.json' },
  {
    qbId: '3.4', appId: '3.4', file: 'domain3-ip-connectivity-validation/objective-3.4-single-area-ospfv2-source-questions.json',
    // Multi-area OSPF cluster excluded per PROJECT_LOG item 6 (Theme A) — these
    // are flagged qualityFlags.uncertainObjectiveMapping and are about ABRs /
    // multi-area design, not single-area OSPFv2.
    exclude: ['obj-3.4-source-q007', 'obj-3.4-source-q008', 'obj-3.4-source-q009', 'obj-3.4-source-q011',
      'obj-3.4-source-q038', 'obj-3.4-source-q039', 'obj-3.4-source-q040', 'obj-3.4-source-q043',
      'obj-3.4-source-q044', 'obj-3.4-source-q045', 'obj-3.4-source-q059', 'obj-3.4-source-q062'],
  },
  { qbId: '3.5', appId: '3.5', file: 'domain3-ip-connectivity-validation/objective-3.5-first-hop-redundancy-protocols-source-questions.json' },
  // Domain 4 — IP Services (4.1 already imported at pilot; 4.2-4.9 imported here)
  { qbId: '4.2', appId: '4.2', file: 'domain4-ip-services-validation/objective-4.2-ntp-client-server-source-questions.json' },
  { qbId: '4.3', appId: '4.3', file: 'domain4-ip-services-validation/objective-4.3-dhcp-dns-roles-source-questions.json' },
  { qbId: '4.4', appId: '4.4', file: 'domain4-ip-services-validation/objective-4.4-snmp-network-operations-source-questions.json' },
  { qbId: '4.5', appId: '4.5', file: 'domain4-ip-services-validation/objective-4.5-syslog-features-source-questions.json' },
  { qbId: '4.6', appId: '4.6', file: 'domain4-ip-services-validation/objective-4.6-dhcp-client-relay-source-questions.json' },
  { qbId: '4.7', appId: '4.7', file: 'domain4-ip-services-validation/objective-4.7-qos-phb-source-questions.json' },
  { qbId: '4.8', appId: '4.8', file: 'domain4-ip-services-validation/objective-4.8-ssh-remote-access-source-questions.json' },
  { qbId: '4.9', appId: '4.9', file: 'domain4-ip-services-validation/objective-4.9-tftp-ftp-source-questions.json' },
  { qbId: '6.1', appId: '6.1', file: 'domain5-domain6-validation/objective-6.1-automation-impacts-network-management-source-questions.json' },
  { qbId: '6.2', appId: '6.2', file: 'domain5-domain6-validation/objective-6.2-traditional-vs-controller-based-source-questions.json' },
  { qbId: '6.3', appId: '6.3', file: 'domain5-domain6-validation/objective-6.3-controller-based-sdn-architectures-source-questions.json' },
  { qbId: '6.4', appId: '6.4', file: 'domain5-domain6-validation/objective-6.4-traditional-vs-dna-center-management-source-questions.json' },
  { qbId: '6.5', appId: '6.5', file: 'domain5-domain6-validation/objective-6.5-rest-api-characteristics-source-questions.json' },
  { qbId: '6.6', appId: '6.6', file: 'domain5-domain6-validation/objective-6.6-configuration-management-mechanisms-source-questions.json' },
  { qbId: '6.7', appId: '6.6', file: 'domain5-domain6-validation/objective-6.7-json-encoded-data-source-questions.json' },
]

const QUESTION_TYPE_MAP = {
  scenario: 'scenario',
  'output-interpretation': 'application',
  'command-analysis': 'application',
  'multiple-choice-single': 'definition',
}

const DIFFICULTY_MAP = {
  'exam-ready': 'hard',
}

function ckuToConcept(ckuId) {
  if (!ckuId) return undefined
  return ckuId.replace(/^CKU-/, '').toLowerCase().replace(/-/g, ' ')
}

function convertQuestion(q) {
  const correctId = q.correctChoiceIds?.[0]
  const correctIndex = q.choices.findIndex(c => c.id === correctId || c.isCorrect)
  return {
    question: q.stem,
    choices: q.choices.map(c => c.text),
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: q.explanation || q.sourceAnswerText || '',
    type: QUESTION_TYPE_MAP[q.questionType] || q.questionType,
    difficulty: DIFFICULTY_MAP[q.difficulty] || q.difficulty,
    concept: ckuToConcept(q.ckuIds?.[0]),
    ckuIds: q.ckuIds || [],
  }
}

const OSPF_34_EXCLUDE = new Set([
  'obj-3.4-source-q007', 'obj-3.4-source-q008', 'obj-3.4-source-q009', 'obj-3.4-source-q011',
  'obj-3.4-source-q038', 'obj-3.4-source-q039', 'obj-3.4-source-q040', 'obj-3.4-source-q043',
  'obj-3.4-source-q044', 'obj-3.4-source-q045', 'obj-3.4-source-q059', 'obj-3.4-source-q062',
])

const imported = {}
const supplemental = {}
let totalIn = 0
let totalOut = 0
let totalSupplemental = 0

for (const entry of FILES) {
  const data = JSON.parse(readFileSync(join(DL, entry.file), 'utf-8'))
  const questions = data.questions || []
  totalIn += questions.length
  const exclude = new Set(entry.exclude || [])
  const converted = questions.filter(q => !exclude.has(q.id)).map(convertQuestion)
  totalOut += converted.length
  imported[entry.appId] = (imported[entry.appId] || []).concat(converted)

  // Shelve 3.4 multi-area OSPF cluster (item 8: SUPPLEMENTAL, not served under 3.4).
  if (entry.qbId === '3.4') {
    const shelved = questions.filter(q => OSPF_34_EXCLUDE.has(q.id)).map(convertQuestion)
    totalSupplemental += shelved.length
    supplemental['supp-ospf-multiarea'] = shelved
  }
}

const dataDir = join(import.meta.dirname, '..', 'src', 'data')

const out = `// AUTO-GENERATED by scripts/convertQuestionBank.mjs — do not hand-edit.
// Bulk-imported question bank for domains 2, 3, 5, 6.
// Orphans resolved in MASTER SEQUENCE item 8: QB 2.9 -> 2.8, QB 5.4 -> 5.3.
// 3.4 multi-area OSPF cluster shelved in ccnaQuestionSupplemental.js (not under 3.4).
// QB 6.6 and 6.7 are merged into app 6.6.
export const IMPORTED_QUESTIONS = ${JSON.stringify(imported, null, 2)}
`

const suppOut = `// AUTO-GENERATED by scripts/convertQuestionBank.mjs — do not hand-edit.
// Shelved question sets with no live app objective (SUPPLEMENTAL registry in ccnaCurated.js).
// supp-ospf-multiarea: 12 questions excluded from app 3.4 (single-area OSPFv2 scope).
export const SUPPLEMENTAL_QUESTIONS = ${JSON.stringify(supplemental, null, 2)}
`

writeFileSync(join(dataDir, 'ccnaQuestionImports.js'), out)
writeFileSync(join(dataDir, 'ccnaQuestionSupplemental.js'), suppOut)

console.log(`Source questions read: ${totalIn}`)
console.log(`Converted (imported):  ${totalOut}`)
console.log(`Shelved (supplemental): ${totalSupplemental}`)
console.log(`Skipped (3.4 exclusions from 3.4 pool only): ${totalIn - totalOut - totalSupplemental}`)
for (const [id, qs] of Object.entries(imported)) console.log(`  ${id}: ${qs.length}`)
