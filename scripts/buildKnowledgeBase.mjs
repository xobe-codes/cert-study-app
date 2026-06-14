#!/usr/bin/env node
/**
 * Extract knowledge-base JSON from curated content (Domain 4.1 pilot).
 * Phase 2 — no app runtime changes.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCurated } from '../src/data/ccnaCurated.js'
import { DOMAIN_4_OBJECTIVES } from './lib/cleanBankUtils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const KB_DIR = join(ROOT, 'data', 'knowledge-base')
const CLEAN_DIR = join(ROOT, 'data', 'clean-question-bank', 'domain-4')

function loadCleanQuestions(objectiveId) {
  const path = join(CLEAN_DIR, `${objectiveId}.json`)
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8')).questions || []
}

function main() {
  mkdirSync(KB_DIR, { recursive: true })
  mkdirSync(join(KB_DIR, 'objectives'), { recursive: true })

  const ckus = []
  const glossary = []
  const commands = []
  const examTraps = []
  const misconceptions = []
  const objectives = []

  for (const objectiveId of DOMAIN_4_OBJECTIVES) {
    const curated = getCurated(objectiveId)
    const cleanQs = loadCleanQuestions(objectiveId)
    const questionIds = cleanQs.map(q => q.id).filter(Boolean)

    if (curated) {
      for (const c of curated.ckus || []) {
        ckus.push({
          ckuId: c.id,
          title: c.title,
          domainId: curated.domainId,
          objectiveIds: [objectiveId],
          summary: c.summary,
          keyTerms: c.aliases || [],
          examTraps: [],
          relatedCommands: [],
          relatedQuestionIds: questionIds.filter(id =>
            cleanQs.find(q => q.id === id && q.ckuIds?.includes(c.id)),
          ),
          confidence: 'high',
          needsReview: false,
        })
      }
      for (const g of curated.glossary || []) {
        glossary.push({ ...g, objectiveId })
      }
      for (const c of curated.commands || []) {
        commands.push({ ...c, objectiveId })
      }
      for (const t of curated.examTraps || []) {
        examTraps.push({ ...t, objectiveId })
      }
      for (const m of curated.misconceptions || []) {
        misconceptions.push({ ...m, objectiveId })
      }
      if (curated.reading) {
        objectives.push({
          objectiveId,
          title: curated.title,
          domainId: curated.domainId,
          summary: curated.reading.definition,
          keyPoints: curated.reading.keyPoints || [],
          ckuIds: curated.reading.ckuIds || [],
          estimatedReadMinutes: curated.reading.estimatedReadMinutes,
          tiers: curated.reading.tiers,
        })
      }
    } else {
      objectives.push({
        objectiveId,
        title: objectiveId,
        domainId: 'services',
        summary: '',
        keyPoints: [],
        ckuIds: [...new Set(cleanQs.flatMap(q => q.ckuIds || []))],
        needsReview: true,
      })
    }
  }

  writeFileSync(join(KB_DIR, 'ckus.json'), JSON.stringify(ckus, null, 2))
  writeFileSync(join(KB_DIR, 'glossary.json'), JSON.stringify(glossary, null, 2))
  writeFileSync(join(KB_DIR, 'command-bank.json'), JSON.stringify(commands, null, 2))
  writeFileSync(join(KB_DIR, 'exam-traps.json'), JSON.stringify(examTraps, null, 2))
  writeFileSync(join(KB_DIR, 'misconceptions.json'), JSON.stringify(misconceptions, null, 2))
  writeFileSync(join(KB_DIR, 'objectives.json'), JSON.stringify(objectives, null, 2))

  const chapters = [{
    chapterId: 'ch4-ip-services',
    chapterNumber: 4,
    chapterTitle: 'IP Services (Domain 4)',
    domainId: 'services',
    objectiveIds: DOMAIN_4_OBJECTIVES,
    summary: 'NAT/PAT, NTP, DHCP/DNS, SNMP, Syslog, DHCP relay, QoS, SSH, TFTP/FTP — core CCNA IP Services objectives.',
  }]
  writeFileSync(join(KB_DIR, 'chapters.json'), JSON.stringify(chapters, null, 2))

  console.log('✓ Knowledge base extracted (Domain 4)')
  console.log(`  CKUs: ${ckus.length}`)
  console.log(`  Glossary: ${glossary.length}`)
  console.log(`  Commands: ${commands.length}`)
  console.log(`  Exam traps: ${examTraps.length}`)
  console.log(`  Objectives: ${objectives.length}`)
}

main()
