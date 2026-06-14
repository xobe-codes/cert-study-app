#!/usr/bin/env node
/** Compile examTraps + misconceptions from domain packages → ckuTrapIndex.js */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'src', 'answerReview', 'ckuTrapIndex.js')

const PACKS = [
  'domain1-network-fundamentals-v1.json',
  'domain2-network-access-v1.json',
  'domain3-ip-connectivity-v1.json',
  'domain4-ip-services-v1.json',
  'domain5-security-fundamentals-v1.json',
  'domain6-automation-programmability-v1.json',
]

const byCku = new Map()

function addEntry(ckuId, entry) {
  if (!ckuId) return
  const list = byCku.get(ckuId) || []
  const key = `${entry.trap}|${entry.correction}`
  if (!list.some(e => `${e.trap}|${e.correction}` === key)) list.push(entry)
  byCku.set(ckuId, list)
}

for (const file of PACKS) {
  const path = join(ROOT, 'src', 'domain-packages', file)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const obj of data.objectives || []) {
    for (const t of obj.examTraps || []) {
      for (const ckuId of t.ckuIds || []) {
        addEntry(ckuId, { trap: t.trap, correction: t.correction, source: 'examTrap' })
      }
    }
    for (const m of obj.misconceptions || []) {
      for (const ckuId of m.ckuIds || []) {
        addEntry(ckuId, {
          trap: m.misconception,
          correction: m.reality || m.correction || '',
          source: 'misconception',
        })
      }
    }
  }
  if (Array.isArray(data.examTraps)) {
    for (const t of data.examTraps) {
      for (const ckuId of t.ckuIds || []) {
        addEntry(ckuId, { trap: t.trap, correction: t.correction, source: 'domainTrap' })
      }
    }
  }
}

const sorted = Object.fromEntries([...byCku.entries()].sort(([a], [b]) => a.localeCompare(b)))
const body = `/** Auto-generated from domain packages — npm run compile:cku-traps */\nexport const CKU_TRAP_INDEX = ${JSON.stringify(sorted, null, 2)}\n`
writeFileSync(OUT, body)
console.log(`✓ Compiled ${Object.keys(sorted).length} CKU trap entries → src/answerReview/ckuTrapIndex.js`)
