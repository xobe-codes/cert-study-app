#!/usr/bin/env node
// One-time bulk converter: question-bank source JSON (ccna-question-bank-v1) ->
// src/data/ccnaQuestionImports.js (IMPORTED_QUESTIONS keyed by app objectiveId).
// Source files live outside the repo under ~/Downloads (validation packages).
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DL = join(homedir(), 'Downloads')

// objectiveIds in QB source -> app objectiveId. Most are 1:1; QB 6.6/6.7 both
// fold into app 6.6 (config-mgmt tools + JSON interpretation). QB 2.9 has no
// app objective and is intentionally omitted (MASTER SEQUENCE item 8).
const FILES = [
  { qbId: '2.3', appId: '2.3', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.3-layer-2-discovery-protocols-source-questions.json' },
  { qbId: '2.4', appId: '2.4', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.4-etherchannel-lacp-source-questions.json' },
  { qbId: '2.5', appId: '2.5', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.5-rapid-pvst-stp-basics-source-questions.json' },
  { qbId: '2.6', appId: '2.6', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.6-cisco-wireless-architectures-ap-modes-source-questions.json' },
  { qbId: '2.7', appId: '2.7', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.7-wlan-physical-infrastructure-connections-source-questions.json' },
  { qbId: '2.8', appId: '2.8', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.8-ap-wlc-management-access-source-questions.json' },
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

const imported = {}
let totalIn = 0
let totalOut = 0
let totalSkipped2_9 = 0

for (const entry of FILES) {
  const data = JSON.parse(readFileSync(join(DL, entry.file), 'utf-8'))
  const questions = data.questions || []
  totalIn += questions.length
  const exclude = new Set(entry.exclude || [])
  const converted = questions.filter(q => !exclude.has(q.id)).map(convertQuestion)
  totalOut += converted.length
  imported[entry.appId] = (imported[entry.appId] || []).concat(converted)
}

const out = `// AUTO-GENERATED by scripts/convertQuestionBank.mjs — do not hand-edit.
// Bulk-imported question bank for domains 2, 3, 6 (MASTER SEQUENCE item 7).
// Excludes QB 2.9 (orphan, no app objective) and the 3.4 multi-area-OSPF
// cluster (see PROJECT_LOG.md item 6/7). QB 6.6 and 6.7 are merged into app 6.6.
export const IMPORTED_QUESTIONS = ${JSON.stringify(imported, null, 2)}
`

writeFileSync(join(import.meta.dirname, '..', 'src', 'data', 'ccnaQuestionImports.js'), out)

console.log(`Source questions read: ${totalIn}`)
console.log(`Converted (imported):  ${totalOut}`)
console.log(`Skipped (2.9 orphan + 3.4 exclusions): ${totalIn - totalOut}`)
for (const [id, qs] of Object.entries(imported)) console.log(`  ${id}: ${qs.length}`)
