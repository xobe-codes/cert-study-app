#!/usr/bin/env node
/**
 * Extract knowledge-base JSON from curated content (Domain 4.1 pilot).
 * Phase 2 — no app runtime changes.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCurated, curatedObjectiveIds, hasCuratedReading } from '../src/data/ccnaCurated.js'
import { DOMAIN_3_OBJECTIVES, DOMAIN_4_OBJECTIVES, DOMAIN_2_OBJECTIVES, DOMAIN_5_OBJECTIVES, DOMAIN_6_OBJECTIVES, DOMAIN_1_OBJECTIVES } from './lib/cleanBankUtils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const KB_DIR = join(ROOT, 'data', 'knowledge-base')
const CLEAN_DIR = join(ROOT, 'data', 'clean-question-bank')

function loadCleanQuestions(objectiveId) {
  for (const domainNum of [1, 2, 3, 4, 5, 6]) {
    const path = join(CLEAN_DIR, `domain-${domainNum}`, `${objectiveId}.json`)
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8')).questions || []
  }
  return []
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

  const kbObjectiveIds = [...curatedObjectiveIds].filter(id => hasCuratedReading(id)).sort()

  for (const objectiveId of kbObjectiveIds) {
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

  const chapters = [
    { chapterId: 'ch1-fundamentals', chapterNumber: 1, chapterTitle: 'Network Fundamentals', domainId: 'fundamentals', objectiveIds: DOMAIN_1_OBJECTIVES, summary: 'Components, topologies, cabling, switching, IPv4/IPv6, wireless, virtualization.' },
    { chapterId: 'ch2-network-access', chapterNumber: 2, chapterTitle: 'Network Access', domainId: 'access', objectiveIds: DOMAIN_2_OBJECTIVES, summary: 'VLANs, trunking, CDP/LLDP, EtherChannel, STP, wireless architectures.' },
    { chapterId: 'ch3-ip-connectivity', chapterNumber: 3, chapterTitle: 'IP Connectivity', domainId: 'connectivity', objectiveIds: DOMAIN_3_OBJECTIVES, summary: 'Routing table, forwarding, static routing, OSPFv2, FHRP, troubleshooting.' },
    { chapterId: 'ch4-ip-services', chapterNumber: 4, chapterTitle: 'IP Services', domainId: 'services', objectiveIds: DOMAIN_4_OBJECTIVES, summary: 'NAT, NTP, DHCP/DNS, SNMP, Syslog, QoS, SSH, TFTP/FTP, management.' },
    { chapterId: 'ch5-security', chapterNumber: 5, chapterTitle: 'Security Fundamentals', domainId: 'security', objectiveIds: DOMAIN_5_OBJECTIVES, summary: 'Threats, access control, AAA, ACLs, L2 security, wireless security, VPN.' },
    { chapterId: 'ch6-automation', chapterNumber: 6, chapterTitle: 'Automation & Programmability', domainId: 'automation', objectiveIds: DOMAIN_6_OBJECTIVES, summary: 'Automation, SDN, DNA Center, REST, JSON, Ansible.' },
  ]
  writeFileSync(join(KB_DIR, 'chapters.json'), JSON.stringify(chapters, null, 2))

  console.log('✓ Knowledge base extracted (all curated objectives)')
  console.log(`  CKUs: ${ckus.length}`)
  console.log(`  Glossary: ${glossary.length}`)
  console.log(`  Commands: ${commands.length}`)
  console.log(`  Exam traps: ${examTraps.length}`)
  console.log(`  Objectives: ${objectives.length}`)
}

main()
