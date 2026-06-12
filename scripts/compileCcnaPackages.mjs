#!/usr/bin/env node
/* =========================================================================
   Domain Package Compiler (Phase 23). Bundles all curated static content +
   labs into one portable JSON per domain, plus a source audit trail and
   coverage summary. Pure data — no AI, no app runtime. Run: npm run compile:ccna
   ========================================================================= */
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { curatedObjectiveIds, getCurated, validateCurated, CURATED_SOURCES } from '../src/data/ccnaCurated.js'
import { allLabs, getLab, labsByDomain, validateLabs, LAB_SOURCES } from '../src/data/ccnaLabs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'src', 'domain-packages')

const DOMAIN_META = {
  fundamentals: { num: 1, name: 'Network Fundamentals', slug: 'network-fundamentals' },
  access: { num: 2, name: 'Network Access', slug: 'network-access' },
  connectivity: { num: 3, name: 'IP Connectivity', slug: 'ip-connectivity' },
  services: { num: 4, name: 'IP Services', slug: 'ip-services' },
  security: { num: 5, name: 'Security Fundamentals', slug: 'security-fundamentals' },
  automation: { num: 6, name: 'Automation & Programmability', slug: 'automation-programmability' },
}

function main() {
  // Validate first — never compile invalid data.
  const cv = validateCurated(), lv = validateLabs()
  if (!cv.ok || !lv.ok) {
    console.error('✗ Validation failed — fix before compiling.')
    ;[...cv.errors, ...lv.errors].forEach(e => console.error('  -', e))
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })

  // Group curated objectives + labs by domain.
  const curatedByDomain = {}
  for (const id of curatedObjectiveIds) {
    const o = getCurated(id)
    ;(curatedByDomain[o.domainId] ||= []).push(o)
  }
  const labsDom = labsByDomain()

  const summary = []
  for (const [domainId, meta] of Object.entries(DOMAIN_META)) {
    const objectives = curatedByDomain[domainId] || []
    const labs = (labsDom[domainId] || []).map(l => getLab(l.id)) // full bundles

    const count = (arr, key) => objectives.reduce((s, o) => s + (o[key]?.length || 0), 0)
    const pkg = {
      metadata: {
        domainId, domainNumber: meta.num, domainName: meta.name,
        version: '1', compiledAt: new Date().toISOString(),
        curatedObjectives: objectives.length, labs: labs.length,
      },
      sourceAudit: { sources: { ...CURATED_SOURCES, ...LAB_SOURCES }, note: 'Content is original/paraphrased from the cited sources; questions are original. Verify command syntax against official Cisco docs.' },
      objectives,
      labs,
      counts: {
        ckus: count(objectives, 'ckus'), questions: count(objectives, 'questions'),
        flashcards: count(objectives, 'flashcards'), commands: count(objectives, 'commands'),
        glossary: count(objectives, 'glossary'), mnemonics: count(objectives, 'mnemonics'),
        examTraps: count(objectives, 'examTraps'), misconceptions: count(objectives, 'misconceptions'),
        labs: labs.length,
      },
    }
    const file = join(OUT_DIR, `domain${meta.num}-${meta.slug}-v1.json`)
    writeFileSync(file, JSON.stringify(pkg, null, 2))
    summary.push({ domain: `${meta.num} ${meta.name}`, objectives: objectives.length, labs: labs.length, file: `src/domain-packages/domain${meta.num}-${meta.slug}-v1.json` })
  }

  console.log('✓ Validation passed. Compiled domain packages:\n')
  summary.forEach(s => console.log(`  D${s.domain.padEnd(28)} curated:${s.objectives}  labs:${s.labs}  → ${s.file}`))
  const totalCurated = [...curatedObjectiveIds].length
  console.log(`\nTotals: ${totalCurated} curated objective(s), ${allLabs().length} lab(s) across 6 domains.`)
}

main()
